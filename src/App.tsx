import { HelmetProvider } from 'react-helmet-async'
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import Root from './routes/AppRoutes';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import './App.css';
import { ColumnsProvider } from './providers/ColumnsProvider';

const queryClient = new QueryClient()

const App = () => {
    return (
        <HelmetProvider>
            <QueryClientProvider client={queryClient}>
                <MantineProvider>
                    <ModalsProvider>
                        <Notifications />
                        <ColumnsProvider>
                            <RouterProvider router={Root} />
                        </ColumnsProvider>
                    </ModalsProvider>
                </MantineProvider>
            </QueryClientProvider>
        </HelmetProvider>
    );
};

export default App;
