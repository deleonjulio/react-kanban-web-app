import { useEffect } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { styles } from "../style";
import { ColumnHeader } from "./ColumnHeader";
import { PriorityBadge } from "./PriorityBadge";
import { Paper, Text, Group, Avatar } from "@mantine/core";
import dayjs from "dayjs";
import { getColumnCards } from "../../../apis";
import { useQuery } from "@tanstack/react-query";
import { BoardColumns, useColumns, useColumnsDispatch } from "../../../providers/ColumnsProvider";
import { getColumnCardsOlder } from "../../../apis";
import { useSearchParams } from "react-router-dom";

const CURRENT_DATE = dayjs();

export const BoardColumn = ({
    boardId,
    columnId,
    index,
    initCreateCard,
    initDeleteColumn,
    handleSelectCard,
}: any) => {
    const scrollContainer = document.getElementById(`column-${columnId}`);
    const [searchParams] = useSearchParams();

    const priority = searchParams.get('priority')

    const columnFilters = {
        priority
    }

    const columns = useColumns()
    const columnsDispatch = useColumnsDispatch()

    const column = columns?.[columnId]
    const lastCard = column?.items[column?.items?.length - 1];

    const { data: cards, error: errorGetColumnCards } = useQuery({
        queryKey: [boardId, columnId, priority],
        queryFn: () => getColumnCards({boardId, columnId, columnFilters}),
        enabled: boardId !== undefined && columnId !== undefined,
        retry: false,
        refetchOnWindowFocus: false
    })

    const { data: olderCards, refetch, isFetching: getColumnCardsOlderIsPending } = useQuery({
        queryKey: ["columnCardsOlder", boardId, columnId, priority],
        queryFn: () => getColumnCardsOlder({boardId, columnId, columnFilters, cardId: lastCard._id}),
        enabled: false, // Disabled by default, only fetch when triggered
    });
    
    const handleScroll = (event: React.UIEvent<HTMLDivElement, UIEvent>) => {
        const target = event.currentTarget;
        const isBottom = target.scrollHeight - target.scrollTop <= target.clientHeight;
        if (isBottom && !getColumnCardsOlderIsPending) {
            if(lastCard?._id) {
                refetch()
            }
        }
    };
    
    useEffect(() => {
        if(cards?.data) {
            if (scrollContainer) {
                scrollContainer.scrollTop = 0;
            }

            const cardsData = cards.data?.data;
            const updatedColumns: BoardColumns = { ...columns };
            updatedColumns[columnId].items = cardsData

            columnsDispatch({type: "LIST", boardData: updatedColumns})
        }
    }, [cards])

    useEffect(() => {
        if(olderCards?.data?.data) {
            const updatedColumns = {
                ...columns,
                [columnId]: {
                    ...column,
                    items: [...column.items, ...olderCards?.data?.data]
                }
            };
            columnsDispatch({ type: "LIST", boardData: updatedColumns });
        }
    }, [olderCards])

    return (
        <Draggable key={columnId} draggableId={columnId} index={index}>
            {(provided) => (
            <div 
                id={`column-${columnId}`}
                onScroll={handleScroll}
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
                    {column.items.map((item: any, index: number) => (
                        <Draggable
                        key={item._id}
                        draggableId={item._id}
                        index={index}
                        >
                        {(provided) => (
                            <Paper
                            bd="0.5px gray solid"
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
    )
}