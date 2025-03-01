import { UpdateCardPayload } from "../types";
import { POST, DELETE, GET, PUT, PATCH } from "../utils/request"

export const createBoard = (payload: { name: string; }) => {
  return POST('/boards', payload);
}

export const getBoard = (boardId?: string) => {
  return GET(`/boards/${boardId}`);
}

export const fetchBoard = (query: string) => {
  return GET(`/board${query}`)
}

export const deleteBoard = (boardId?: string) => {
  return DELETE(`/board/${boardId}`);
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

export const createCard = ({boardId, columnId, title}: { boardId: string; columnId: string; title: string; }) => {
  return POST(`/boards/${boardId}/columns/${columnId}/cards`, { title });
}

export const getCard = ({boardId, columnId, cardId}: { boardId: string; columnId: string; cardId: string }) => {
  return GET(`/boards/${boardId}/columns/${columnId}/cards/${cardId}`);
}

export const updateCard = ({boardId, columnId, cardId, payload, onSuccess}: { boardId: string; columnId: string; cardId: string; payload: UpdateCardPayload, onSuccess: () => void; }) => {
  return PATCH(`/boards/${boardId}/columns/${columnId}/cards/${cardId}`, { ...payload })
}

export const deleteCard = ({boardId, columnId, cardId}: { boardId: string; columnId: string; cardId: string }) => {
  return DELETE(`/boards/${boardId}/columns/${columnId}/cards/${cardId}`);
}

export const getCards = (boardId?: string) => {
  return GET(`/board/${boardId}/cards`);
}

export const getCardActivities = (query: string) => {
  return GET(`/activity/card${query}`)
}

export const deleteColumn = ({boardId, columnId}: { boardId: string; columnId: string; }) => {
  return DELETE(`/boards/${boardId}/columns/${columnId}`);
}