import { memo, useEffect } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { ColumnHeader } from "./ColumnHeader";
import { getColumnCards } from "../../../apis";
import { useQuery } from "@tanstack/react-query";
import { useColumns, useColumnsDispatch } from "../../../providers/ColumnsProvider";
import { getColumnCardsOlder } from "../../../apis";
import { useSearchParams, useParams } from "react-router-dom";
import { ItemList } from "./ItemList";

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

  const lastCard = column?.items[column?.items?.length - 1];

  const { data: cards, error: errorGetColumnCards } = useQuery({
    queryKey: [boardId, column._id, priority],
    queryFn: () => getColumnCards({boardId, columnId: column._id, columnFilters}),
    enabled: boardId !== undefined && column._id !== undefined,
    retry: false,
    refetchOnWindowFocus: false,
  })

  const { data: olderCards, refetch, isFetching: getColumnCardsOlderIsPending } = useQuery({
    queryKey: ["columnCardsOlder", boardId, column?._id, priority],
    queryFn: () => getColumnCardsOlder({boardId, columnId: column._id, columnFilters, cardId: lastCard._id}),
    enabled: false, // Disabled by default, only fetch when triggered
  });

  const loadMore = () => refetch()

  useEffect(() => {
    if(cards?.data) {
      const cardsData = cards.data?.data;
      columnsDispatch({
        type: "INITIAL_LOAD", column: {
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
      <Draggable draggableId={column?._id} index={index}>
        {provided => (
          <div className="column" {...provided.draggableProps} ref={provided.innerRef}>
            <div {...provided.dragHandleProps} style={{paddingLeft: 16, paddingRight: 16, display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <h4>{column.title}</h4>
            <ColumnHeader name={column.name} initCreateCard={() => initCreateCard(column?._id) } initDeleteColumn={() => initDeleteColumn(column?._id)} />
            </div>
          <ItemList column={column} index={index} loadMore={loadMore} />
        </div>
        )}
    </Draggable>
  )
});