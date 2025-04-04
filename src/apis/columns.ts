import { ColumnFilters } from "../types";
import { POST, GET, DELETE, PUT } from "../utils/request"

export const createColumn = ({boardId, name}: { boardId: string; name: string; onSuccess: () => void; }) => {
  return POST(`/boards/${boardId}/columns`, { name });
}

export const updateColumnOrder = ({ boardId, columnOrder }: { boardId?: string; columnOrder: string[]}) => {
  return PUT(`/board/${boardId}/column/order/`, columnOrder);
}

export const deleteColumn = ({boardId, columnId}: { boardId: string; columnId: string; }) => {
  return DELETE(`/boards/${boardId}/columns/${columnId}`);
}

export const getColumnCards = ({boardId, columnId, columnFilters}: { boardId: string; columnId: string; columnFilters: ColumnFilters }) => {
  return GET(`/boards/${boardId}/columns/${columnId}`, columnFilters);
}

export const getColumnCardsOlder = ({boardId, columnId, columnFilters, cardId}: { boardId: string; columnId: string; columnFilters: ColumnFilters, cardId?: string; }) => {
  return GET(`/boards/${boardId}/columns/${columnId}/cards/${cardId}/old`, columnFilters);
}