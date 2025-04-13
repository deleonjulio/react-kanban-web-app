import { useState, useEffect } from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import "./style.css";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getBoard, updateColumnOrder, createCard, getCard, updateCardLocation, deleteCard, updateCard, createColumn, deleteColumn } from "../../apis";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from '@mantine/form';
import { NewCardModal, CardModal, DeleteCardModal, BoardNotFound, DeleteColumnModal, CreateColumn, BoardFilter, BoardColumn } from "./components";
import { Head } from "../../components";
import type { SelectedCard, UpdateCardPayload } from "../../types";
import { errorHandler } from "../../utils/helper";
import { AxiosError } from "axios";
import { useColumns, useColumnsDispatch } from "../../providers/ColumnsProvider";
import { BoardColumns, Card } from "../../providers/ColumnsProvider";

type TransformData = {
  [key: string]: {
    name: string
    items: Card[]
  }
}

function reorderListColumn(list: string[], startIndex: number, endIndex: number) {
  const result: string[] = Array.from(list)
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

function reorderListCard(list: Card[], startIndex: number, endIndex: number) {
  const result: Card[] = Array.from(list)
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export const BoardPage = () => {
  const { id: boardId } = useParams();
  
  const [searchParams, setSearchParams] = useSearchParams();

  const priority = searchParams.get('priority')

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
      
      let boardData: {[key: string] : {
        name: string;
        items: Card[];
      }} = {};

      initialBoardData?.columns?.forEach((column: { _id: string; name: string; }) => {
        boardData[column._id] = {
          name: column.name,
          items: []
        }
      })

      const transformData = (data: TransformData) => {
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

      const transformedBoardData: BoardColumns = transformData(boardData)
      columnsDispatch({type: "LIST", boardData: transformedBoardData})
    }
  }, [boardInfo])

  const { mutate: updateColumnOrderMutate} = useMutation({
    mutationFn: updateColumnOrder,
    onError: (error) => {   
      console.log("Error updating column order", error);
    }
  });

  const handleUpdateColumnOrder = (reorderedColumns: string[]) => {
    updateColumnOrderMutate({ boardId, columnOrder: reorderedColumns });
  }

  const { mutate: updateCardLocationMutate } = useMutation({
    mutationFn: updateCardLocation,
    onError: (error: AxiosError) => {   
      console.log("Error moving card", error);
      errorHandler(error)
    }
  });

  function onDragEnd(result: DropResult) {
    console.log(result)
    if (!result.destination) {
      return;
    }

    if (result.type === "column") {
      if (result.source.index === result.destination.index) return; 

      // if the list is scrolled it looks like there is some strangeness going on
      // with react-window. It looks to be scrolling back to scroll: 0
      // I should log an issue with the project
      const columnOrder = reorderListColumn(
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
      if (result.source.index === result.destination.index) return; 

      const column = columns.columns[result.source.droppableId];

      const items = reorderListCard(
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
        const targetCardId = columns.columns[result.source.droppableId].items[result?.destination.index]?._id || ''

        updateCardLocationMutate({ 
          boardId, 
          sourceColumnId: result.source.droppableId, 
          destinationColumnId: result.destination.droppableId, 
          destinationIndex: result.destination.index, 
          cardId: result.draggableId,
          placedAtTop: false,
          targetCardId
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
      let placedAtTop = false
      let targetCardId = ''
      if(result?.destination?.index === 0) {
        if(columns.columns[result.destination.droppableId].items[result?.destination?.index]?._id) {
          placedAtTop = true
        }

        targetCardId = columns.columns[result.destination.droppableId].items[result?.destination.index]?._id || ''
      } else {
        targetCardId = columns.columns[result.destination.droppableId].items[result?.destination.index-1]?._id || ''
      }

      updateCardLocationMutate({ 
        boardId, 
        sourceColumnId: result.source.droppableId, 
        destinationColumnId: result.destination.droppableId, 
        destinationIndex: result.destination.index, 
        cardId: result.draggableId,
        targetCardId,
        placedAtTop
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
      title: (value) => {
        if(value.length < 1 ) {
          return 'Required'
        } else if (value.length > 180) {
          return 'Title should not exceed 180 characters'
        }
        return null
      },
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
        let updatedColumns: BoardColumns = {
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
                    due_date: updatedCard.due_date ? updatedCard.due_date.toString() : null
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
    return () => columnsDispatch({type: "RESET"})
  }, [])

  if(errorGetBoard) {
    return (
      <BoardNotFound />
    )
  }

  // I need to re-render the entire board if a user unselects a filter.
  // I have an issue with hasMountedRef.current?.resetAfterIndex(0).
  // VERY IMPORTANT, In the future, please add the other filters here. (due_date?, tag?)
  const forceRender = priority

  return (
    <div id="board-container">
      <Head title={BOARD_NAME} />
      <BoardFilter />
      <div id="columns-container">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="app">
            <Droppable
              droppableId="all-droppables"
              direction="horizontal"
              type="column"
            >
              {provided => (
                <div
                  key={forceRender}
                  className="columns"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {columns?.columnOrder?.map((columnId, index) => (
                    <BoardColumn 
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
        <div id="create-column-container">
          <CreateColumn handleCreateColumn={handleCreateColumn} createColumnIsPending={createColumnIsPending} />
        </div>
      </div>
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
