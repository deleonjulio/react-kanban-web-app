import { notifications } from "@mantine/notifications"
import { AxiosError } from "axios"

export const errorHandler = (error: AxiosError) => {
  if(error?.status === 401) {
    notifications.show({
      color: "red",
      position:'top-right',
      message: 'Unauthorized',
    })
    window.location.replace('/login');
  } else {
    if(error?.message) {
      notifications.show({
        color: "red",
        position:'top-right',
        message: error.message,
      })
    } else {
      notifications.show({
        color: "red",
        position:'top-right',
        message: 'Something went wrong.',
      })
    }
  }
}