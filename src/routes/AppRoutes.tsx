import { createBrowserRouter, Outlet } from 'react-router-dom'
import { Home, BoardPage, Login } from '../pages'
import { GET } from '../utils/request';
import { Navbar } from '../components';

const Main = () => {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: "inherit", height: "100vh", position: "sticky", top: 0, background: "#e5e7eb", }}>
        <Navbar />
      </div>
      <div style={{ flex: 1, background: "#f3f4f6", overflowY: "auto" }}>
        <Outlet />
      </div>
    </div>
  )
}

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
            // { path: '/',  element: <Home />, loader },
            // { path: '/boards',  element: <Home />, loader },
            // { path: '/login',  element: <Login /> },
            // { path: '/boards/:id', element: <BoardPage /> },

            { path: '/',  element: <Home />, loader },
            // { path: '/boards',  element: <Home />, loader },
            { path: '/login',  element: <Login /> },
            // { path: '/boards/:id', element: <BoardPage /> },
            {
              path: '/boards/', 
              element: <Main />,
              children: [
                { path: '',  element: <Home />, loader },
                { path: ':id',  element: <BoardPage /> },
              ]
            }
        ]
    }
]

const Root = createBrowserRouter([...routes])

export default Root
