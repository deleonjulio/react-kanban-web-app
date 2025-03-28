// @flow
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { areEqual, VariableSizeList } from "react-window";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "./style.css";
import { useParams, useSearchParams } from "react-router-dom";
import { Paper, Text, Avatar } from "@mantine/core";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getBoard, updateColumnOrder, createCard, getCard, updateCardLocation, deleteCard, updateCard, createColumn, deleteColumn, getColumnCardsOlder } from "../../apis";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from '@mantine/form';
import { NewCardModal, CardModal, DeleteCardModal, BoardNotFound, DeleteColumnModal, CreateColumn, BoardFilter, BoardColumn, PriorityBadge} from "./components";
import { Head } from "../../components";
import type { SelectedCard, UpdateCardPayload } from "../../types";
import { errorHandler } from "../../utils/helper";
import { AxiosError } from "axios";
import { useColumns, useColumnsDispatch } from "../../providers/ColumnsProvider";
import { BoardColumns, Card } from "../../providers/ColumnsProvider";
import { ColumnHeader } from "./components";
import dayjs from "dayjs";

import { getColumnCards } from "../../apis";

const CURRENT_DATE = dayjs();

function reorderList(list, startIndex, endIndex) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}

function getStyle({ draggableStyle, virtualStyle, isDragging }) {
  // If you don't want any spacing between your items
  // then you could just return this.
  // I do a little bit of magic to have some nice visual space
  // between the row items
  const combined = {
    ...virtualStyle,
    ...draggableStyle,
  };

  // Being lazy: this is defined in our css file
  const grid = 8;

  // when dragging we want to use the draggable style for placement, otherwise use the virtual style
  const result = {
    ...combined,
    height: isDragging ? combined.height : combined.height - grid,
    left: isDragging ? combined.left : combined.left + grid,
    width: isDragging
      ? draggableStyle.width
      : `calc(${combined.width} - ${grid * 2}px)`,
    marginBottom: grid,
  };

  return result;
}

function calculateHeight(text, width = 300, fontSize = 13) {
  const uppercaseCount = (text.match(/[A-Z]/g) || []).length;
  const lowercaseCount = (text.match(/[a-z]/g) || []).length;
  const numberCount = (text.match(/[0-9]/g) || []).length;
  const totalLength = text.length;

  if (totalLength === 0) return 0; // No text, no height

  // Weighted average character width based on text composition
  const avgCharWidth =
      ((uppercaseCount * 0.65 + lowercaseCount * 0.54 + numberCount * 0.6) / totalLength) * fontSize;

  const lineHeight = fontSize * 1.5;
  const charsPerLine = Math.floor(width / avgCharWidth);
  const totalLines = Math.ceil(totalLength / charsPerLine);

  return totalLines * lineHeight;
}

function Item({ provided, item, style, isDragging }) {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <Paper
      withBorder
      // bd="0.5px gray solid"
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      ref={provided.innerRef}
      style={getStyle({
        draggableStyle: provided.draggableProps.style,
        virtualStyle: style,
        isDragging
      })}
      className={`item ${isDragging ? "is-dragging" : ""}`}
      onClick={() => {
        searchParams.set("selectedCard", item.card_key);
        setSearchParams(searchParams)
      }}
    >
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <Text fw={900} size="xs" c="gray.7">{item?.card_key}</Text>
          <div style={{display:"flex", justifyContent:"flex-end", alignItems: "center", gap: 4}}>    
            {item?.priority && <PriorityBadge priority={item?.priority} size="xs" />}
            <Avatar size="sm" name="JULIO" color="initials" />   
          </div>
      </div>
      <div style={{display:"flex", alignItems: "center"}}>       
        {item.due_date && <Text fw={500} size="xs" c={CURRENT_DATE >= dayjs(item.due_date) ? "red" : "gray"}>{dayjs(item.due_date).format('MMM. DD, YYYY')}</Text>}
      </div>
      <Text style={{fontSize: 12}}>
          {item.title}
      </Text>
    </Paper>
  );
}

// Recommended react-window performance optimisation: memoize the row render function
// Things are still pretty fast without this, but I am a sucker for making things faster
const Row = React.memo(function Row(props) {
  const { data: items, index, style } = props;
  const item = items[index];
  
  // We are rendering an extra item for the placeholder
  if (!item) {
    return null;
  }

  return (
    <Draggable draggableId={item._id} index={index} key={item._id}>
      {provided => <Item provided={provided} item={item} style={style} />}
    </Draggable>
  );
}, areEqual);

const ItemList = React.memo(function ItemList({ column, index, loadMore }) {
  // There is an issue I have noticed with react-window that when reordered
  // react-window sets the scroll back to 0 but does not update the UI
  // I should raise an issue for this.
  // As a work around I am resetting the scroll to 0
  // on any list that changes it's index
  const listRef = useRef();
  const hasMountedRef = useRef();

  const rowHeights = column.items.map((item) => {
    let height = 75
    height += calculateHeight(item?.title)

    if(item?.due_date) {
      height += 20
    }
    
    return height
  });

  const getItemSize = index => {
    return rowHeights[index];
  }

  useLayoutEffect(() => {
    if(hasMountedRef.current) {
      hasMountedRef.current?.resetAfterIndex(0)
    }
  }, [column])

  let totalHeight = 0

  rowHeights.forEach(i => {
    totalHeight += i
  })

  return (
    <Droppable
      droppableId={column._id}
      mode="virtual"
      renderClone={(provided, snapshot, rubric) => (
        <Item
          provided={provided}
          isDragging={snapshot.isDragging}
          item={column.items[rubric.source.index]}
        />
      )}
    >
      {(provided, snapshot) => {
        // Add an extra item to our list to make space for a dragging item
        // Usually the DroppableProvided.placeholder does this, but that won't
        // work in a virtual list
        const itemCount = snapshot.isUsingPlaceholder
          ? column.items.length + 1
          : column.items.length;

        return (
          <VariableSizeList 
            height={700}
            itemCount={itemCount}
            itemSize={getItemSize}
            width={300}
            itemData={column.items}
            className="task-list"
            outerRef={provided.innerRef}
            innerRef={listRef}
            ref={hasMountedRef}
            onScroll={(event) => {
              if (!hasMountedRef.current) {
                hasMountedRef.current = true;
                return;
              }
          
              if (!listRef.current) {
                return;
              }

              console.log(hasMountedRef.current.props.height + event.scrollOffset, totalHeight)
              if (hasMountedRef.current.props.height + event.scrollOffset >= totalHeight) {
                loadMore()
              }
            }}
          >
            {Row}
          </VariableSizeList >
        );
      }}
    </Droppable>
  );
});

const Column = React.memo(function Column({ column, index, initCreateCard, initDeleteColumn }) {
  const { id: boardId } = useParams();
  const columns = useColumns()
  const columnsDispatch = useColumnsDispatch()

  const lastCard = column?.items[column?.items?.length - 1];

  const { data: cards, error: errorGetColumnCards } = useQuery({
      queryKey: [boardId, column._id],
      queryFn: () => getColumnCards({boardId, columnId: column._id, columnFilters: {}}),
      enabled: boardId !== undefined && column._id !== undefined,
      retry: false,
      refetchOnWindowFocus: false,
  })

  const { data: olderCards, refetch, isFetching: getColumnCardsOlderIsPending } = useQuery({
    queryKey: ["columnCardsOlder", boardId, column?._id],
    queryFn: () => getColumnCardsOlder({boardId, columnId: column._id, columnFilters: {}, cardId: lastCard._id}),
    enabled: false, // Disabled by default, only fetch when triggered
  });

  const loadMore = () => refetch()

  useEffect(() => {
    if(cards?.data) {
        const cardsData = cards.data?.data;
        columnsDispatch({type: "INITIAL_LOAD", column: {
          [column._id]: {
            ...columns?.columns[column?._id],
            items: cardsData
          }
        }})
      }
  }, [cards])

  useEffect(() => {
    if(olderCards?.data?.data) {
      const updatedColumns = {
        ...columns,
        columns: {
          ...columns.columns,
          [column?._id]: {
            ...columns.columns[column?._id],
            items: [...columns.columns[column?._id].items, ...olderCards?.data?.data]
          }
        }
      };
      columnsDispatch({ type: "LIST", boardData: updatedColumns });
    }
  }, [olderCards])

  return (
    <Draggable draggableId={column?._id} index={index}>
      {provided => (
        <div
          className="column"
          {...provided.draggableProps}
          ref={provided.innerRef}
        >
          <div {...provided.dragHandleProps} style={{paddingLeft: 16, paddingRight: 16, display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <h3>
              {column.title}
            </h3>
            <ColumnHeader name={column.name} initCreateCard={() => initCreateCard(column?._id) } initDeleteColumn={() => initDeleteColumn(column?._id)} />
          </div>
          <ItemList column={column} index={index} loadMore={loadMore} />
        </div>
      )}
    </Draggable>
  );
});

export const BoardPage = () => {
  const { id: boardId } = useParams();
  
  const [searchParams, setSearchParams] = useSearchParams();

  const columns = useColumns()
  const columnsDispatch = useColumnsDispatch()

  const [columnToBeDeleted, setColumnToBeDeleted] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<SelectedCard | null>(null)

  const [createCardModalOpened, { open: openCreateCardModal, close: closeCreateCardModal }] = useDisclosure(false);
  const [deleteColumnModalOpened, { open: openDeleteColumnModal, close: closeDeleteColumnModal }] = useDisclosure(false);
  const [deleteCardModalOpened, { open: openDeleteCardModal, close: closeDeleteCardModal }] = useDisclosure(false);
  const [cardModalOpened, { open: openCardModal, close: closeCardModal }] = useDisclosure(false);
  const [cardCreationColumnId, setCardCreationColumnId] = useState<string | null>(null)

  const { data: boardInfo, error: errorGetBoard } = useQuery({
    queryKey: [boardId],
    queryFn: () => getBoard(boardId),
    enabled: boardId != undefined,
    retry: false,
    refetchOnWindowFocus: false
  })

  const BOARD_NAME = boardInfo?.data?.name

  useEffect(() => {
    if(boardInfo?.data) {
      const { data: initialBoardData } = boardInfo;
      let boardData: BoardColumns = {};

      initialBoardData?.columns?.forEach((column: { _id: string; name: string; }) => {
        boardData[column._id] = {
          name: column.name,
          items: []
        }
      })

      const transformData = (data) => {
        const columns = Object.fromEntries(
          Object.entries(data).map(([key, value]) => [
            key,
            {
              _id: key,
              title: value.name,
              items: value.items
            }
          ])
        );
        
        const columnOrder = Object.keys(columns);
        
        return { columns, columnOrder };
      };

      boardData = transformData(boardData)
      columnsDispatch({type: "LIST", boardData})

      // setState(boardData)

    }
  }, [boardInfo])

  const { mutate: updateColumnOrderMutate} = useMutation({
    mutationFn: updateColumnOrder,
    onError: (error) => {   
      console.log("Error updating column order", error);
    }
  });

  const handleUpdateColumnOrder = (reorderedColumns: BoardColumns) => {
    updateColumnOrderMutate({ boardId, columnOrder: reorderedColumns });
  }

  const { mutate: updateCardLocationMutate } = useMutation({
    mutationFn: updateCardLocation,
    onError: (error: AxiosError) => {   
      console.log("Error moving card", error);
      errorHandler(error)
    }
  });

  function onDragEnd(result) {
    if (!result.destination) {
      return;
    }

    if (result.type === "column") {
      // if the list is scrolled it looks like there is some strangeness going on
      // with react-window. It looks to be scrolling back to scroll: 0
      // I should log an issue with the project
      const columnOrder = reorderList(
        columns.columnOrder,
        result.source.index,
        result.destination.index
      );
      
      columnsDispatch({type: "LIST", boardData: {
        ...columns,
        columnOrder
      }})

      handleUpdateColumnOrder(columnOrder);
      return;
    }

    // reordering in same list
    if (result.source.droppableId === result.destination.droppableId) {
      const column = columns.columns[result.source.droppableId];
      const items = reorderList(
        column.items,
        result.source.index,
        result.destination.index
      );

      // updating column entry
      const newState = {
        ...columns,
        columns: {
          ...columns.columns,
          [column._id]: {
            ...column,
            items
          }
        }
      };
      columnsDispatch({type: "LIST", boardData: newState})

      if (result?.source?.droppableId && result?.destination?.droppableId) {
        updateCardLocationMutate({ 
          boardId, 
          sourceColumnId: result.source.droppableId, 
          destinationColumnId: result.destination.droppableId, 
          destinationIndex: result.destination.index, 
          cardId: result.draggableId 
        });
      }
      return;
    }

    // moving between lists
    const sourceColumn = columns.columns[result.source.droppableId];
    const destinationColumn = columns.columns[result.destination.droppableId];
    const item = sourceColumn.items[result.source.index];

    // 1. remove item from source column
    const newSourceColumn = {
      ...sourceColumn,
      items: [...sourceColumn.items]
    };
    newSourceColumn.items.splice(result.source.index, 1);

    // 2. insert into destination column
    const newDestinationColumn = {
      ...destinationColumn,
      items: [...destinationColumn.items]
    };
    // in line modification of items
    newDestinationColumn.items.splice(result.destination.index, 0, item);

    const newState = {
      ...columns,
      columns: {
        ...columns.columns,
        [newSourceColumn._id]: newSourceColumn,
        [newDestinationColumn._id]: newDestinationColumn
      }
    };

    columnsDispatch({type: "LIST", boardData: newState})

    if (result?.source?.droppableId && result?.destination?.droppableId) {
      updateCardLocationMutate({ 
        boardId, 
        sourceColumnId: result.source.droppableId, 
        destinationColumnId: result.destination.droppableId, 
        destinationIndex: result.destination.index, 
        cardId: result.draggableId 
      });
    }
  }

  const { mutate: createColumnMutate, isPending: createColumnIsPending } = useMutation({
    mutationFn: createColumn,
    onSuccess: (response, variable) => {
      const updatedColumns = { 
        columnOrder: [...columns?.columnOrder, response.data._id],
        columns: {
          ...columns.columns,
          [response.data._id]: {
            _id: response.data._id,
            title: response.data.name,
            items: [], 
          } 
        }
      };
      columnsDispatch({type: "LIST", boardData: updatedColumns})
      variable.onSuccess()
    },
    onError: (error: AxiosError) => {   
      console.log("Error creating card", error);
      errorHandler(error)
    }
  });

  const handleCreateColumn = ({name, onSuccess}: {name: string; onSuccess: () => void}) => {
    if(boardId) {
      createColumnMutate({ boardId, name, onSuccess });
    }
  }

  const { mutate: deleteColumnMutate, isPending: deleteColumnIsPending } = useMutation({
    mutationFn: deleteColumn,
    onSuccess: (_response, variable) => {
        if(variable?.columnId) {
          const { [variable?.columnId]: toRemove, ...rest } = columns.columns; 
          const updatedColumns = { 
            columnOrder: columns?.columnOrder?.filter((columnId) => columnId != variable?.columnId),
            columns: { ...rest }
          };
          columnsDispatch({type: "LIST", boardData: updatedColumns})
        }
        handleCloseDeleteColumnModal()
    },
    onError: (error: AxiosError) => {   
      console.log("Error deleting column", error);
      errorHandler(error)
    },
  });

  const handleDeleteColumn = () => {
    if(boardId && columnToBeDeleted) {
      deleteColumnMutate({boardId, columnId: columnToBeDeleted})
    }
  }

  const handleCloseDeleteColumnModal = () => {
    setColumnToBeDeleted(null);
    closeDeleteColumnModal()  
  }

  const initDeleteColumn = (columnId: string) => { 
    setColumnToBeDeleted(columnId);
    openDeleteColumnModal();
  }

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
        title: '',
    },
    validate: {
        title: (value) => (value.length < 1 ? 'Required' : null),
    }
  });

  const handleCloseCreateCardModal = () => {
    form.reset();
    closeCreateCardModal()
    setCardCreationColumnId(null)
  }

  const initCreateCard = (columnId: string) => {
    setCardCreationColumnId(columnId)
    openCreateCardModal()
  }

  const { mutate: createCardMutate, isPending: createCardIsPending } = useMutation({
    mutationFn: createCard,
    onSuccess: (response, variable) => {
      handleCloseCreateCardModal();
      const updatedColumns = { 
        ...columns, 
        columns: {
          ...columns.columns,
          [variable.columnId]: {
            ...columns.columns[variable.columnId], 
           items: [{
              column_id: variable.columnId,
              ...response.data.data
            }, 
            ...columns.columns[variable.columnId].items
          ] 
         } 
        }
      };
      columnsDispatch({type: "LIST", boardData: updatedColumns})
    },
    onError: (error: AxiosError) => {   
      console.log("Error creating card", error);
      errorHandler(error)
    }
  });

  const handleCreateCard = ({title}: {title: string}) => {
    if (boardId && cardCreationColumnId) {
      createCardMutate({ boardId, columnId: cardCreationColumnId, title });
    }
  }

  const { data: initialSelectedCard, isFetching: getCardIsFetching, error: getCardError } = useQuery({
    queryKey: [searchParams?.get('selectedCard')],
    queryFn: () => {
      const cardKey = searchParams?.get('selectedCard');
      if (boardId && cardKey) {
        return getCard({ boardId, cardKey });
      }
    },
    enabled: searchParams?.get('selectedCard') !== null,
    retry: false,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if(searchParams?.get('selectedCard') === null) {
      closeCardModal()
      setSelectedCard(null);
    } else {
      openCardModal()
    }
  }, [searchParams])

  useEffect(() => {
    if(initialSelectedCard?.data) {
      setSelectedCard(initialSelectedCard.data)
    }
  }, [initialSelectedCard])

  const handleCloseCardModal = () => {
    searchParams.delete("selectedCard");
    setSearchParams(searchParams);

    closeCardModal()
    setSelectedCard(null);
  }

  const { mutate: deleteCardMutate, isPending: deleteCardIsPending } = useMutation({
    mutationFn: deleteCard,
    onSuccess: (_, variable) => {
        if(variable?.columnId) {
          let updatedColumns = {
            ...columns,
            columns: {
              ...columns.columns,
              [variable?.columnId]: {
                ...columns.columns[variable?.columnId],
                items: [...columns.columns[variable?.columnId]?.items.filter((card) => card._id != variable?.cardId)]
              }
            }
          }
          
          columnsDispatch({type: "LIST", boardData: updatedColumns})
        }
        closeDeleteCardModal()
        handleCloseCardModal()
    },
    onError: (error: AxiosError) => {   
      console.log("Error deleting card", error);
      errorHandler(error)
    },
  });

  const initDeleteCard = () => openDeleteCardModal();

  const handleDeleteCard = ({columnId, cardId} : { columnId?: string, cardId?: string}) => {
    if (boardId && columnId && cardId) {
      deleteCardMutate({ boardId, columnId, cardId });
    }
  }

  const handleUpdateCard = ({payload, onSuccess}: {payload: UpdateCardPayload, onSuccess: () => void; }) => {
    if (boardId && payload?.column_id && payload?._id) {
      updateCardMutate({boardId, columnId: payload.column_id, cardId: payload._id, payload, onSuccess});
    }
  }

  const { mutate: updateCardMutate, isPending: updateCardIsPending } = useMutation({
    mutationFn: updateCard,
    onSuccess: (_, variable) => {
      const updatedCard = variable.payload;

      if(updatedCard.column_id) {
        let updatedColumns = {
          ...columns,
          columns: {
            ...columns.columns,
            [updatedCard?.column_id]: {
              ...columns.columns[updatedCard?.column_id],
              items: [...columns.columns[updatedCard.column_id]?.items.map((card) => {
                if(card._id === updatedCard._id) {
                  return {
                    ...card,
                    title: updatedCard.title ?? '',
                    content: updatedCard.content,
                    formatted_content: updatedCard.formatted_content,
                    priority: updatedCard.priority,
                    due_date: updatedCard.due_date
                  }
                }
                return {...card}
              })]
            }
          }
        }

        setSelectedCard((prev) => prev ? ({
          ...prev,
          ...variable.payload
        }) : prev)
        
        columnsDispatch({type: "LIST", boardData: updatedColumns})
      }

      variable.onSuccess()
    },
    onError: (error) => {   
      console.log("Error updating card", error);
    }
  });

  useEffect(() => {
    return () => {
      columnsDispatch({type: "RESET"})
    }
  }, [])

  if(errorGetBoard) {
    return (
      <BoardNotFound />
    )
  }

  return (
    <div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="app">
          <Droppable
            droppableId="all-droppables"
            direction="horizontal"
            type="column"
          >
            {provided => (
              <div
                className="columns"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {columns?.columnOrder?.map((columnId, index) => (
                  <Column
                    key={columnId}
                    column={columns.columns[columnId]}
                    index={index}
                    initCreateCard={initCreateCard}
                    initDeleteColumn={initDeleteColumn} 
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>
      <CreateColumn handleCreateColumn={handleCreateColumn} createColumnIsPending={createColumnIsPending} />
      <NewCardModal form={form} opened={createCardModalOpened} close={handleCloseCreateCardModal} handleCreateCard={handleCreateCard} createCardIsPending={createCardIsPending} />
      <DeleteColumnModal 
        opened={deleteColumnModalOpened}
        close={handleCloseDeleteColumnModal}
        handleDeleteColumn={handleDeleteColumn}
        deleteColumnIsPending={deleteColumnIsPending}
      />
      <CardModal 
        opened={cardModalOpened} 
        close={handleCloseCardModal} 
        selectedCard={selectedCard} 
        boardName={BOARD_NAME}
        initDeleteCard={initDeleteCard} 
        handleUpdateCard={handleUpdateCard}
        updateCardIsPending={updateCardIsPending}
        getCardIsFetching={getCardIsFetching} 
      />
      <DeleteCardModal 
        opened={deleteCardModalOpened}
        close={closeDeleteCardModal}
        selectedCard={selectedCard}
        handleDeleteCard={handleDeleteCard}
        deleteCardIsPending={deleteCardIsPending}
      />
    </div>
  );
}
