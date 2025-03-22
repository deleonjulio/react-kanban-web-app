import axios from 'axios'
export const POST = async (url: string, data?: unknown) => await axios(`${import.meta.env.VITE_API_URL}${url}`, {
  method: 'POST',
  data,
  withCredentials: true
})

export const PATCH = async (url: string, data?: unknown) => await axios(`${import.meta.env.VITE_API_URL}${url}`, {
  method: 'PATCH',
  data,
  withCredentials: true
})

export const PUT = async (url: string, data?: unknown) => await axios(`${import.meta.env.VITE_API_URL}${url}`, {
  method: 'PUT',
  data,
  withCredentials: true
})

export const GET = async (url: string, params?: any) => await axios(`${import.meta.env.VITE_API_URL}${url}`, {
  method: 'GET',
  params: params,
  withCredentials: true
})

export const DELETE = async (url: string) => await axios(`${import.meta.env.VITE_API_URL}${url}`, {
  method: 'DELETE',
  withCredentials: true
})


export const UPLOAD = async (url: string, data?: unknown) => await axios(`${import.meta.env.VITE_API_URL}${url}`, {
  method: 'POST',
  data,
  withCredentials: true,
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})

export const DOWNLOAD = async (url: string, data?: unknown) => await axios(`${import.meta.env.VITE_API_URL}${url}`, {
  method: 'POST',
  data,
  withCredentials: true,
  responseType: "blob"
})