import { POST, DELETE, PUT } from "../utils/request"

export const createColumn = ({boardId, name}: { boardId: string; name: string; onSuccess: () => void; }) => {
  return POST(`/boards/${boardId}/columns`, { name });
}

export const updateColumnOrder = ({ boardId, columnOrder }: { boardId?: string; columnOrder: string[]}) => {
  return PUT(`/board/${boardId}/column/order/`, columnOrder);
}

export const deleteColumn = ({boardId, columnId}: { boardId: string; columnId: string; }) => {
  return DELETE(`/boards/${boardId}/columns/${columnId}`);
}