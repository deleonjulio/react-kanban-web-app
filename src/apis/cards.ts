import { POST, GET, PATCH, DELETE } from "../utils/request";
import { UpdateCardPayload } from "../types";

export const createCard = ({boardId, columnId, title}: { boardId: string; columnId: string; title: string; }) => {
  return POST(`/boards/${boardId}/columns/${columnId}/cards`, { title });
}

export const getCard = ({boardId, cardKey}: { boardId: string; cardKey: string; }) => {
  return GET(`/boards/${boardId}/cards/${cardKey}`);
}

export const updateCard = ({boardId, columnId, cardId, payload, onSuccess}: { boardId: string; columnId: string; cardId: string; payload: UpdateCardPayload, onSuccess: () => void; }) => {
  return PATCH(`/boards/${boardId}/columns/${columnId}/cards/${cardId}`, { ...payload })
}

export const deleteCard = ({boardId, columnId, cardId}: { boardId: string; columnId: string; cardId: string }) => {
  return DELETE(`/boards/${boardId}/columns/${columnId}/cards/${cardId}`);
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
    cardId?: string;
  }) => {
    return PATCH(`/boards/${boardId}/columns/${sourceColumnId}/cards/${cardId}/move/`, { destinationColumnId, destinationIndex });
}

export const getCardActivities = (query: string) => {
  return GET(`/activity/card${query}`)
}
