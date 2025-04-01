import { createBrowserRouter, Outlet } from 'react-router-dom'
import {  Login, Home, OverviewPage, BoardPage, ListPage, MembersPage } from '../pages'
import { GET } from '../utils/request';
import { Navbar } from '../components';
import { AppShell, Burger, Group, Skeleton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
// import { MantineLogo } from '@mantinex/mantine-logo';


const Main = () => {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 240, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          {/* <MantineLogo size={30} /> */}
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <Navbar />
      </AppShell.Navbar>
      <AppShell.Main> 
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
  // return (
  //   <div style={{ display: "flex", height: "100vh" }}>
  //     <div style={{ width: "inherit", height: "100vh", position: "sticky", top: 0, background: "#e5e7eb", }}>
  //       <Navbar />
  //     </div>
  //     <div style={{ flex: 1, background: "#f3f4f6", overflowY: "auto" }}>
  //       <Outlet />
  //     </div>
  //   </div>
  // )
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
            { path: '/login',  element: <Login /> },
            { path: '/boards',  element: <Home />, loader },
            {
              path: '/', 
              element: <Main />,
              children: [
                { path: 'overview/:id',  element: <OverviewPage /> },
                { path: 'board/:id',  element: <BoardPage /> },
                { path: 'list/:id',  element: <ListPage /> },
                { path: 'members/:id',  element: <MembersPage /> },
                
              ]
            }
        ]
    }
]

const Root = createBrowserRouter([...routes])

export default Root
