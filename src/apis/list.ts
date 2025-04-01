import { GET } from "../utils/request"

export const fetchList = (boardId: string, params: any) => {
  return GET(`/board/${boardId}/list`, params)
}
