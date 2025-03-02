import { POST, DELETE, GET } from "../utils/request"

export const createBoard = (payload: { name: string; }) => {
  return POST('/boards', payload);
}

export const getBoard = (boardId?: string) => {
  return GET(`/boards/${boardId}`);
}

export const deleteBoard = (boardId?: string) => {
  return DELETE(`/board/${boardId}`);
}

export const fetchBoard = (query: string) => {
  return GET(`/board${query}`)
}

export const getCards = (boardId?: string) => {
  return GET(`/board/${boardId}/cards`);
}