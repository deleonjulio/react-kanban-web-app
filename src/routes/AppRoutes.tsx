import { createBrowserRouter } from 'react-router-dom'

import { Home, BoardPage, Login } from '../pages'

const routes = [
    {
        path: '/login', 
        element: <Login />
    },
    {
        path: '/', 
        element: <Home />
    },
    {
        path: 'board/:id', 
        element: <BoardPage />
    },
]

const Root = createBrowserRouter([...routes])

export default Root
