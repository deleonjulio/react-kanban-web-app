import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { Avatar, Group, Paper, Space, Text } from "@mantine/core";
import { notifications } from '@mantine/notifications';
import { useQuery, useMutation } from "@tanstack/react-query";
import { getBoard, updateColumnOrder, createCard, getCards, getCard, updateCardLocation, deleteCard, updateCard, deleteColumn } from "../../apis";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from '@mantine/form';
import dayjs from "dayjs";
import { NewCardModal, CardModal, DeleteCardModal, ColumnHeader, PriorityBadge, BoardNotFound, DeleteColumnModal } from "./components";
import { Head } from "../../components";
import type { Board, Card, SelectedCard, UpdateCardPayload } from "../../types";
import { styles } from "./style";
import { errorHandler } from "../../utils/helper";
import { AxiosError } from "axios";

const CURRENT_DATE = dayjs();

export const BoardPage = () => { 
  const { id: boardId } = useParams();

  const [searchParams, setSearchParams] = useSearchParams();

  const [createCardModalOpened, { open: openCreateCardModal, close: closeCreateCardModal }] = useDisclosure(false);
  const [cardModalOpened, { open: openCardModal, close: closeCardModal }] = useDisclosure(false);
  const [deleteCardModalOpened, { open: openDeleteCardModal, close: closeDeleteCardModal }] = useDisclosure(false);
  const [deleteColumnModalOpened, { open: openDeleteColumnModal, close: closeDeleteColumnModal }] = useDisclosure(false);
  const [selectedCard, setSelectedCard] = useState<SelectedCard | null>(null)
  const [columnToBeDeleted, setColumnToBeDeleted] = useState<string | null>(null);
  const [cardCreationColumnId, setCardCreationColumnId] = useState<string | null>(null)

  const [columns, setColumns] = useState<Board>({});

  const columnList = Object.keys(columns);

  const { data, error: errorGetBoard } = useQuery({
    queryKey: [boardId],
    queryFn: () => getBoard(boardId),
    enabled: boardId != undefined,
    retry: false,
    refetchOnWindowFocus: false
  })
  
  const BOARD_NAME = data?.data?.name

  const { data: cards } = useQuery({
    queryKey: ['cards'],
    queryFn: () => getCards(boardId),
    enabled: columnList.length > 0,
    retry: false,
    refetchOnWindowFocus: false
  })
  
  const { data: initialSelectedCard, isFetching: getCardIsFetching, error: getCardError } = useQuery({
    queryKey: [searchParams?.get('cardId')],
    queryFn: () => {
      const columnId = searchParams?.get('columnId');
      const cardId = searchParams?.get('cardId');
      if (boardId && columnId && cardId) {
        return getCard({ boardId, columnId, cardId });
      }
    },
    enabled: searchParams?.get('columnId') !== null && searchParams?.get('cardId') !== null,
    retry: false,
    refetchOnWindowFocus: false,
  })

  const handleSelectCard = (item: Card) => setSearchParams({ columnId: item?.column_id, cardId: item?._id })

  useEffect(() => {
    if(searchParams?.get('columnId') === null && searchParams?.get('cardId') === null) {
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
    if(data?.data) {
      const { data: initialBoardData } = data;
      const boardData: Board = {};

      initialBoardData?.columns?.forEach((column: { _id: string; name: string; }) => {
        boardData[column._id] = {
          name: column.name,
          items: []
        }

      })

      setColumns(boardData);      
    }
  }, [data])

  useEffect(() => {
    if(cards?.data) {
      const cardsData = cards.data;
      const updatedColumns: Board = { ...columns };
      cardsData.forEach(({ _id, cards }: { _id: string; cards: any; }) => {
        if (updatedColumns[_id]) {
          updatedColumns[_id].items = cards;
        }
      });

      setColumns(updatedColumns);
    }
  }, [cards])

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

  const handleUpdateColumnOrder = (reorderedColumns: Board) => {
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
      setColumns(updatedColumns);
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
            setColumns(updatedColumns);
        }
        closeDeleteCardModal()
        handleCloseCardModal()
        notifications.show({
            title: 'Delete',
            message: 'Card deleted successfully.',
            position: "top-right",
            color: "green"
        })
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

  const { mutate: deleteColumnMutate, isPending: deleteColumnIsPending } = useMutation({
    mutationFn: deleteColumn,
    onSuccess: (response, variable) => {
      console.log(response);
        let updatedColumns = { ...columns }
        if(variable?.columnId) {
            delete updatedColumns[variable?.columnId]
            setColumns(updatedColumns);
        }
        handleCloseDeleteColumnModal()
        notifications.show({
            title: 'Delete',
            message: 'Column deleted successfully.',
            position: "top-right",
            color: "green"
        })
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
      setColumns(reorderedColumns);

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
        setColumns({
          ...columns,
          [source.droppableId]: {
            ...sourceColumn,
            items: sourceItems,
          },
        });

        if (sourceColumnId && destinationColumnId) {
          updateCardLocationMutate({ boardId, sourceColumnId, destinationColumnId, destinationIndex: destination.index, cardId: movedItem._id });
        }
      } else {
        // Different columns
        destinationItems.splice(destination.index, 0, movedItem);
        setColumns({
          ...columns,
          [source.droppableId]: {
            ...sourceColumn,
            items: sourceItems,
          },
          [destination.droppableId]: {
            ...destinationColumn,
            items: destinationItems,
          },
        });
        
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
          
          setColumns(updatedColumns);
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
    <div style={styles.containerStyle as React.CSSProperties}>
      <Head title={BOARD_NAME} />
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="columns" direction="horizontal" type="COLUMN">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={styles.containerStyle as React.CSSProperties}
            >
              {Object.entries(columns).map(([columnId, column], index) => (
                <Draggable key={columnId} draggableId={columnId} index={index}>
                  {(provided) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={{ ...styles.columnStyle as React.CSSProperties, ...provided.draggableProps.style }}
                    >
                      <div
                        {...provided.dragHandleProps}
                        style={styles.columnHeaderStyle as React.CSSProperties}
                      >
                        <ColumnHeader name={column.name} initCreateCard={() => initCreateCard(columnId)} initDeleteColumn={() => initDeleteColumn(columnId)} />
                      </div>
                      <Droppable droppableId={columnId} type="ITEM">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            style={styles.itemListStyle as React.CSSProperties}
                          >
                            {column.items.map((item, index: number) => (
                              <Draggable
                                key={item._id}
                                draggableId={item._id}
                                index={index}
                              >
                                {(provided) => (
                                  <Paper
                                    // bd="0.5px gray solid"
                                    onClick={() => handleSelectCard(item)}
                                    shadow="sm" 
                                    withBorder
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      ...(styles.itemStyle),
                                      ...provided.draggableProps.style,
                                    }}
                                  >
                                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                                      <Text fw={900} size="xs" c="gray.7">{item?.card_key}</Text>
                                      <PriorityBadge priority={item?.priority} size="xs" />
                                    </div>
                                    <Text size="sm">
                                      {item.title}
                                    </Text>
                                    <Group gap="xs" justify="space-between">
                                      <Text size="xs" c={CURRENT_DATE >= dayjs(item.due_date) ? "red" : "gray"}>
                                        {item.due_date && dayjs(item.due_date).format('MMM. DD, YYYY')}
                                      </Text>
                                      <Avatar size="sm" name="JULIO" color="initials" />
                                    </Group>
                                  </Paper>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
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