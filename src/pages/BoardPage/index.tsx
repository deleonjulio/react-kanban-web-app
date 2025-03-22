import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd";
import { Space } from "@mantine/core";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getBoard, updateColumnOrder, createCard, getCard, updateCardLocation, deleteCard, updateCard, createColumn, deleteColumn } from "../../apis";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from '@mantine/form';
import { NewCardModal, CardModal, DeleteCardModal, BoardNotFound, DeleteColumnModal, CreateColumn, BoardFilter, BoardColumn } from "./components";
import { Head } from "../../components";
import type { SelectedCard, UpdateCardPayload } from "../../types";
import { styles } from "./style";
import { errorHandler } from "../../utils/helper";
import { AxiosError } from "axios";
import { useColumns, useColumnsDispatch } from "../../providers/ColumnsProvider";
import { BoardColumns, Card } from "../../providers/ColumnsProvider";

export const BoardPage = () => { 
  const { id: boardId } = useParams();

  const [searchParams, setSearchParams] = useSearchParams();

  const columns = useColumns()
  const columnsDispatch = useColumnsDispatch()

  const [createCardModalOpened, { open: openCreateCardModal, close: closeCreateCardModal }] = useDisclosure(false);
  const [cardModalOpened, { open: openCardModal, close: closeCardModal }] = useDisclosure(false);
  const [deleteCardModalOpened, { open: openDeleteCardModal, close: closeDeleteCardModal }] = useDisclosure(false);
  const [deleteColumnModalOpened, { open: openDeleteColumnModal, close: closeDeleteColumnModal }] = useDisclosure(false);
  const [selectedCard, setSelectedCard] = useState<SelectedCard | null>(null)
  const [columnToBeDeleted, setColumnToBeDeleted] = useState<string | null>(null);
  const [cardCreationColumnId, setCardCreationColumnId] = useState<string | null>(null)

  const { data: boardInfo, error: errorGetBoard } = useQuery({
    queryKey: [boardId],
    queryFn: () => getBoard(boardId),
    enabled: boardId != undefined,
    retry: false,
    refetchOnWindowFocus: false
  })
  
  const BOARD_NAME = boardInfo?.data?.name
  
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

  const handleSelectCard = (item: Card) => setSearchParams({ selectedCard: item.card_key })

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

  useEffect(() => {
    if(getCardError) {
      setSelectedCard(null)
    }
  }, [getCardError])

  useEffect(() => {
    if(boardInfo?.data) {
      const { data: initialBoardData } = boardInfo;
      const boardData: BoardColumns = {};

      initialBoardData?.columns?.forEach((column: { _id: string; name: string; }) => {
        boardData[column._id] = {
          name: column.name,
          items: []
        }
      })
      columnsDispatch({type: "LIST", boardData})
    }
  }, [boardInfo])

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

  const { mutate: updateColumnOrderMutate} = useMutation({
    mutationFn: updateColumnOrder,
    onError: (error) => {   
      console.log("Error updating column order", error);
    }
  });

  const handleUpdateColumnOrder = (reorderedColumns: BoardColumns) => {
    const columns = Object.keys(reorderedColumns);
    updateColumnOrderMutate({ boardId, columnOrder: columns });
  }

  const { mutate: updateCardLocationMutate } = useMutation({
    mutationFn: updateCardLocation,
    onError: (error: AxiosError) => {   
      console.log("Error moving card", error);
      errorHandler(error)
    }
  });

  const { mutate: createCardMutate, isPending: createCardIsPending } = useMutation({
    mutationFn: createCard,
    onSuccess: (response, variable) => {
      handleCloseCreateCardModal();
      const updatedColumns = { 
        ...columns, 
        [variable.columnId]: {
           ...columns[variable.columnId], 
          items: [{
            column_id: variable.columnId,
            ...response.data.data
          }, 
          ...columns[variable.columnId].items] 
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

  const { mutate: deleteCardMutate, isPending: deleteCardIsPending } = useMutation({
    mutationFn: deleteCard,
    onSuccess: (_, variable) => {
        let updatedColumns = { ...columns }
        if(variable?.columnId) {
            updatedColumns[variable?.columnId] = {
                ...updatedColumns[variable?.columnId],
                items: updatedColumns[variable?.columnId]?.items.filter((card) => card._id != variable?.cardId)
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

  const initCreateCard = (columnId: string) => {
    setCardCreationColumnId(columnId)
    openCreateCardModal()
  }

  const initDeleteCard = () => openDeleteCardModal();
  
  const handleDeleteCard = ({columnId, cardId} : { columnId?: string, cardId?: string}) => {
    if (boardId && columnId && cardId) {
      deleteCardMutate({ boardId, columnId, cardId });
    }
  }

  const { mutate: createColumnMutate, isPending: createColumnIsPending } = useMutation({
    mutationFn: createColumn,
    onSuccess: (response, variable) => {
      const updatedColumns = { 
        ...columns, 
        [response.data._id]: {
          name: response.data.name,
          items: [], 
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
          const { [variable?.columnId]: toRemove, ...updatedColumns } = columns; 
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

  const onDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;
    const sourceColumnId = source?.droppableId
    const destinationColumnId = destination?.droppableId

    if (!destination) return;

    if (type === "COLUMN") {
      // Handle column drag
      const columnOrder = Object.entries(columns);
      const [movedColumn] = columnOrder.splice(source.index, 1);
      columnOrder.splice(destination.index, 0, movedColumn);

      const reorderedColumns = Object.fromEntries(columnOrder);
      columnsDispatch({type: "LIST", boardData: reorderedColumns})

      //prevent from making api call if the order is the same
      if(JSON.stringify(columns) === JSON.stringify(reorderedColumns)) return;
      handleUpdateColumnOrder(reorderedColumns);
    } else {
      // Handle item drag
      const sourceColumn = columns[source.droppableId];
      const destinationColumn = columns[destination.droppableId];

      const sourceItems = [...sourceColumn.items];
      const destinationItems = [...destinationColumn.items];

      const [movedItem] = sourceItems.splice(source.index, 1);

      if (source.droppableId === destination.droppableId) {
        if (source.index === destination.index) return; // Prevent unnecessary API call
        
        // Same column
        sourceItems.splice(destination.index, 0, movedItem);
        const updatedColumns = {
          ...columns,
          [source.droppableId]: {
            ...sourceColumn,
            items: sourceItems,
          },
        }

        columnsDispatch({type: "LIST", boardData: updatedColumns})

        if (sourceColumnId && destinationColumnId) {
          updateCardLocationMutate({ boardId, sourceColumnId, destinationColumnId, destinationIndex: destination.index, cardId: movedItem._id });
        }
      } else {
        // Different columns
        destinationItems.splice(destination.index, 0, movedItem);

        const updatedColumns = {
          ...columns,
          [source.droppableId]: {
            ...sourceColumn,
            items: sourceItems,
          },
          [destination.droppableId]: {
            ...destinationColumn,
            items: destinationItems,
          },
        }

        columnsDispatch({type: "LIST", boardData: updatedColumns})
        
        if (sourceColumnId && destinationColumnId) {
          updateCardLocationMutate({ boardId, sourceColumnId, destinationColumnId, destinationIndex: destination.index, cardId: movedItem._id});
        }
      }
    }
  };

  const handleCloseCardModal = () => {
    setSearchParams({})
    closeCardModal()
    setSelectedCard(null);
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
      let updatedColumns = { ...columns }
      if(updatedCard.column_id) {
          updatedColumns[updatedCard.column_id] = {
              ...updatedColumns[updatedCard.column_id],
              items: updatedColumns[updatedCard.column_id]?.items.map((card) => {
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
              })
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

  if(errorGetBoard) {
    return (
      <BoardNotFound />
    )
  }

  return (
    <div style={styles.boardStyle as React.CSSProperties} id="board-container">
      <Head title={BOARD_NAME} />
      <div>
        <BoardFilter />
        <Space h="xs" />
        <div style={{display:"flex", columnGap: 8}}>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="columns" direction="horizontal" type="COLUMN">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={styles.containerStyle as React.CSSProperties}
                >
                  {Object.entries(columns).map(([columnId], index) => (
                    <BoardColumn key={columnId} boardId={boardId} columnId={columnId} index={index} initCreateCard={initCreateCard} initDeleteColumn={initDeleteColumn} handleSelectCard={handleSelectCard}/>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <CreateColumn handleCreateColumn={handleCreateColumn} createColumnIsPending={createColumnIsPending} />
        </div>
      </div>
      <NewCardModal form={form} opened={createCardModalOpened} close={handleCloseCreateCardModal} handleCreateCard={handleCreateCard} createCardIsPending={createCardIsPending} />
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
      <DeleteColumnModal 
        opened={deleteColumnModalOpened}
        close={handleCloseDeleteColumnModal}
        handleDeleteColumn={handleDeleteColumn}
        deleteColumnIsPending={deleteColumnIsPending}
      />
    </div>
  );
};