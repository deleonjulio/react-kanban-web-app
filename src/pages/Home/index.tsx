import { useMutation } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { Navigate, useNavigate, useLoaderData } from "react-router-dom"
import { createBoard, deleteBoard, fetchBoard } from "../../apis";
import { useTableFetch } from "../../hooks";
import { Table, Button, Menu, Text, Pagination, ActionIcon, Paper, Group, Modal, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import dayjs from "dayjs"
import { Head } from "../../components";
// import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline"
// import Logo from '../../assets/img1.svg?react'
import { errorHandler } from "../../utils/helper"

import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';

type Rows = {
  _id: string;
  name: string;
  date_created: string;
  date_updated: string;
}

const styles = {
    container: {
        paddingTop: '6rem',
        minHeight: '100vh', 
        backgroundColor: '#f5f5f4',
    },
    emptyContainer: {
        flex: 1,       
        paddingLeft: '2.5rem',
        paddingRight: '2.5rem',
        paddingTop: '4rem',
        paddingBottom: '4rem',
    },
    emptyTable: {
        display: 'flex',          
        flexDirection: 'column',  
        justifyContent: 'center', 
        alignItems: 'center',     
        textAlign: 'center',  
    }
}

type UserAuthentication = {
  authenticated: boolean
  email: string
}

export const Home = () => {
  const user = useLoaderData() as UserAuthentication;
  const navigate = useNavigate()
  const { data, fetch, isLoading, pageCount, setTableConfig, tableConfig } = useTableFetch({endpoint: fetchBoard})
  const handleTableChange = (pageNumber: number) => setTableConfig((prev) => ({...prev, currentPage: pageNumber}))

  const { mutate: deleteBoardMutate, isPending: deleteBoardIsPending } = useMutation({
    mutationFn: deleteBoard,
    onSuccess: async (response) => { 
      if(response?.data?.message === 'Board deleted successfully.') {
        notifications.show({
          position: 'top-right',
          color: "green",
          message: response.data.message
        })
        fetch()
      }
    },
    onError: (error: AxiosError) => errorHandler(error)
  })

  const openDeleteModal = (id: string) => modals.openConfirmModal({
      title: 'Delete Board',
      children: (
        <Text size="sm">
          Are you sure you want to delete this board? This action is irreversable.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: "Cancel" },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteBoardMutate(id),
  });

  const [opened, { open, close }] = useDisclosure(false);
  const form = useForm({
      mode: 'uncontrolled',
      initialValues: {
          name: '',
      },
      validate: {
          name: (value) => (value.length < 1 ? 'Required' : null),
      }
  });

  const { mutate: createBoardMutate, isPending: createBoardIsPending } = useMutation({
      mutationFn: createBoard,
      onSuccess: (response) => {
          form.reset()
          close()
          navigate(`/boards/${response?.data.id}`)
      }, onError: (error: AxiosError) => {
          errorHandler(error);
      },
  })

  const onSubmit = (values: { name: string }) => {
      createBoardMutate(values)
  }

  const rows = data.map((element: Rows) => (
    <Table.Tr 
      key={element._id} 
    >
      <Table.Td>
        <div>
          {element?.name}
        </div>
      </Table.Td>
      <Table.Td>
        <div className="text-center text-gray-500">
          {dayjs(element?.date_updated).format('MMM DD, YYYY')}
        </div>
      </Table.Td>
      <Table.Td className="text-right">
        <Menu shadow="xs" width={125} position="bottom-end">
          <Menu.Target>
            <ActionIcon aria-label="Menu" variant="white">
              {/* <EllipsisHorizontalIcon /> */}
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={() => navigate(`/boards/${element?._id}`)}>
              <span className="font-medium">Edit</span>
            </Menu.Item>
            <Menu.Item disabled={deleteBoardIsPending} onClick={() => openDeleteModal(element?._id)} color="red">
              <span className="font-medium">Delete board</span>
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </Table.Tr>
  ));

  if(!user.authenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={styles.container}>
      <Head title="Boards"/>
      <div className="p-4">
        <div>
          <div className="flex justify-between">
            <div>
              {/* <Label type="title-1">Quizzes</Label> */}
            </div>
            <Button variant="filled" color="cyan" className={`${rows.length === 0 && 'invisible'}`} onClick={() => open()}>Create Board</Button>
          </div>
          <div className="flex pt-4">
            {rows.length > 0 ? (
              <Table highlightOnHover withTableBorder className="bg-white" verticalSpacing="xs">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>
                      <div className="text-center">Title</div>
                    </Table.Th>
                    <Table.Th>
                      <div className="text-center">Updated</div>
                    </Table.Th>
                    <Table.Th/>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
              </Table>
            ) : (
              <Paper radius="xs" withBorder style={styles.emptyContainer}>
                <div style={styles.emptyTable}>
                  {/* <Logo className="h-52 w-52" /> */}
                  <div className="font-medium text-lg">
                    You don't have any boards
                  </div>
                  <div className="text-gray-500">
                    Click the create button and start creating your board.
                  </div>
                  <div className="pt-2">
                    <Button size="md" onClick={() => open()} color="cyan">Create a Board</Button>
                  </div>
                </div>
              </Paper>
            )}
          </div>
          <Modal opened={opened} onClose={close} title="New Board">
                <form onSubmit={form.onSubmit((values: { name: string }) => onSubmit(values))}>
                    <TextInput 
                        disabled={createBoardIsPending}
                        key={form.key('name')}
                        {...form.getInputProps('name')}
                        label="Board name" 
                    />
                    <Group mt="lg">
                        <Button type="submit" disabled={createBoardIsPending}>Create</Button>
                        <Button variant="outline" onClick={close}>Cancel</Button>
                    </Group>
                </form>
            </Modal>
          <div className="flex justify-center pt-2">
           {rows.length > 0 && <Pagination color="cyan" value={tableConfig.currentPage} disabled={isLoading} total={pageCount} onChange={handleTableChange} size="lg" />}
          </div>
        </div>
      </div>
    </div>
  )
}