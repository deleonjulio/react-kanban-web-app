import { UpdateCardPayload } from "../types";
import { POST, DELETE, GET, PUT } from "../utils/request"

export const createBoard = (payload: { name: string; }) => {
  return POST('/board', payload);
}

export const fetchBoard = (query: string) => {
  return GET(`/board${query}`)
}

export const deleteBoard = (boardId?: string) => {
  return DELETE(`/board/${boardId}`);
}

export const getBoard = (boardId?: string) => {
  return GET(`/board/${boardId}`);
}

export const updateColumnOrder = ({ boardId, columnOrder }: { boardId?: string; columnOrder: string[]}) => {
  return PUT(`/board/${boardId}/column/order/`, columnOrder);
}

export const updateCardLocation = ({ 
  boardId, 
  sourceColumnId, 
  destinationColumnId, 
  destinationIndex, 
  cardId 
}: { 
  boardId?: string; 
  sourceColumnId: string;
  destinationColumnId: string; 
  destinationIndex: number;
  cardId: string;
}) => {
  return PUT(`/board/${boardId}/card/order/`, { sourceColumnId, destinationColumnId, destinationIndex, cardId });
}

export const createCard = (payload: { columnId: string; title: string; }) => {
  return POST(`/column/${payload.columnId}`, payload);
}

export const getCards = (boardId?: string) => {
  return GET(`/board/${boardId}/cards`);
}

export const getCard = (cardId?: string) => {
  return GET(`/card/${cardId}`);
}

export const deleteCard = ({ columnId, cardId } : { columnId?: string, cardId?: string}) => {
  return DELETE(`/column/${columnId}/card/${cardId}`);
}

export const updateCard = ({payload, onSuccess}: {payload: UpdateCardPayload, onSuccess: () => void; }) => {
  return PUT(`/card/${payload?._id}`, { ...payload })
}