import { GET, POST } from "../utils/request"

export const login = (payload: { email: string, password: string }) => {
  return POST('/login', payload);
}

export const logout = async () => {
  return POST('/logout');
}

export const isAuthenticated = () => {
  return GET('/authenticate')
}