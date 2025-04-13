import { memo, useEffect } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { ColumnHeader } from "./ColumnHeader";
import { getColumnCards } from "../../../apis";
import { useQuery } from "@tanstack/react-query";
import { useColumns, useColumnsDispatch } from "../../../providers/ColumnsProvider";
import { getColumnCardsOlder } from "../../../apis";
import { useSearchParams, useParams } from "react-router-dom";
import { ItemList } from "./ItemList";
import { Text, LoadingOverlay, Box } from "@mantine/core";

export const BoardColumn = memo(function BoardColumn({
  column, 
  index, 
  initCreateCard, 
  initDeleteColumn 
}: any) {
  const [searchParams] = useSearchParams();

  const priority = searchParams.get('priority')

  const columnFilters = { priority }

  const { id: boardId } = useParams();
  const columns = useColumns()
  const columnsDispatch = useColumnsDispatch()

  const lastCard = column?.items ? column.items[column?.items?.length - 1] : null;

  const { data: cards, isFetching: getColumnCardsIsFetching } = useQuery({
    queryKey: [boardId, column._id, priority],
    queryFn: () => getColumnCards({boardId, columnId: column._id, columnFilters}),
    enabled: boardId !== undefined && column._id !== undefined,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 0
  })

  const { data: olderCards, refetch } = useQuery({
    queryKey: ["columnCardsOlder", boardId, column?._id, priority],
    queryFn: () => getColumnCardsOlder({boardId, columnId: column._id, columnFilters, cardId: lastCard._id}),
    enabled: false, // Disabled by default, only fetch when triggered
  });

  const loadMore = () => refetch()

  useEffect(() => {
    if(cards?.data) {
      const cardsData = cards.data?.data;
      columnsDispatch({
        type: "INITIAL_LOAD", columns: {
          [column._id]: {
              ...columns?.columns[column?._id],
              items: cardsData
          }
        }
      })
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
    <Box pos="relative">
      <LoadingOverlay visible={getColumnCardsIsFetching} zIndex={1000} overlayProps={{ radius: "md", blur: 1 }} />
        <Draggable isDragDisabled={getColumnCardsIsFetching} draggableId={column?._id} index={index}>
          {provided => (
            <div className="column" {...provided.draggableProps} ref={provided.innerRef}>
              <div {...provided.dragHandleProps} style={{paddingLeft: 10, paddingRight: 10, display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <Text fw={"bold"} my={14}>{column.title}</Text>
                <ColumnHeader name={column.name} initCreateCard={() => initCreateCard(column?._id) } initDeleteColumn={() => initDeleteColumn(column?._id)} />
              </div>
            <ItemList column={column} index={index} loadMore={loadMore} />
          </div>
        )}
      </Draggable>
    </Box>
  )
});