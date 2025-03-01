import { createBrowserRouter } from 'react-router-dom'
import { Home, BoardPage, Login } from '../pages'
import { GET } from '../utils/request';

async function loader () {
    let data = {
      authenticated: false,
      email: null,
    };
  
    try {
      const url = '/authenticate'
      const response = await GET(url);
      if(response?.data?.data?.email) {
        data = {
          authenticated: true,
          email: response.data.data.email
        }
      }
    } catch (error) {
      console.log(error)
    }
  
    return data
  }

const routes = [{
    path: '/',
    errorElement: <>Page not found</>,
    children: [
            { path: '',  element: <Home />, loader },
            { path: '/login',  element: <Login /> },
            { path: 'board/:id', element: <BoardPage /> },
        ]
    }
]

const Root = createBrowserRouter([...routes])

export default Root
