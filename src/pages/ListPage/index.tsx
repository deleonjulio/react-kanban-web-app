import { useEffect, useRef } from 'react';
import { Table, Pagination, Group, Center, Button, LoadingOverlay, Box, Title, Badge, Text, Avatar } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useParams } from 'react-router-dom';
import { fetchList } from '../../apis';
import { PriorityBadge } from '../BoardPage/components';
import { ListFilter } from './components/ListFilter';
import dayjs from 'dayjs';

const CURRENT_DATE = dayjs();

interface ListElement {
  _id: string;
  card_key: string;
  title: string;
  column_info: {
    name: string;
  }
  asignee: string;
  priority?: string;
  due_date?: string;
  date_updated?: string;
  date_created?: string;
}

export const ListPage = () => {
  const { id: boardId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams()
  
  const priority = searchParams.get('priority')
  const page = searchParams.get('page')
  const search = searchParams.get('search')
  const params = { page, priority, search }
  
  const { data: list, isLoading } = useQuery({
    queryKey: [boardId, page, priority, search],
    queryFn: () => boardId ? fetchList(boardId, params) : Promise.reject('Board ID is undefined'),
    enabled: boardId != undefined && page != null,
    retry: false,
    refetchOnWindowFocus: false
  })

  const data = list?.data?.data
  const total = list?.data?.total
  const pageCount = Math.ceil(total / 10);
  
  // this will maintain the previous page count to avoid the flickering of the pagination when the data is loading
  const previousPageCount = useRef(pageCount) 
  const handleTableChange = (page: number) => {
    searchParams.set("page", String(page))
    setSearchParams(searchParams);
    previousPageCount.current =  Math.ceil(total / 10);
  }

  useEffect(() => {
    if(page === null) {
      searchParams.set("page", "1")
      setSearchParams(searchParams);  
    }
  }, [])

  const rows = data?.map((element: ListElement) => (
    <Table.Tr
      key={element._id}
      // bg={selectedRows.includes(element.key) ? 'var(--mantine-color-blue-light)' : undefined}
    >
      {/* <Table.Td>
        <Checkbox
          aria-label="Select row"
          checked={selectedRows.includes(element.key)}
          onChange={(event) =>
            setSelectedRows(
              event.currentTarget.checked
                ? [...selectedRows, element.key]
                : selectedRows.filter((key) => key !== element.key)
            )
          }
        />
      </Table.Td> */}
      <Table.Td w={120} maw={120} align="center">
        <Button fullWidth variant='transparent' size="xs">{element.card_key}</Button>
      </Table.Td>
      <Table.Td w={420} maw={420}>
        <Text size="xs" style={{overflow: "hidden", textOverflow:"ellipsis", whiteSpace: "nowrap"}}>{element.title}</Text>
      </Table.Td>
      <Table.Td w={120} maw={120} align="center">
        <Badge size="sm" variant="light">{element?.column_info?.name}</Badge>
      </Table.Td>
      <Table.Td w={100} maw={100} align="center">
        {element.priority && <PriorityBadge priority={element?.priority} size="sm" />}
      </Table.Td>
      <Table.Td align="center">
        <Avatar size="sm" name="JULIO DE LEON" color="initials" />   
      </Table.Td>
      <Table.Td c={CURRENT_DATE >= dayjs(element.due_date) ? "red" : "dark"}>
        {element?.due_date ? <Text size="xs">{dayjs(element.due_date).format('MMM DD, YYYY')}</Text> : null}
      </Table.Td>
      <Table.Td>
        {element?.date_updated ? <Text size="xs">{dayjs(element.date_updated).format('MMM DD, YYYY')}</Text> : null}
      </Table.Td>
      <Table.Td>
        {element?.date_created ? <Text size="xs">{dayjs(element.date_created).format('MMM DD, YYYY')}</Text>: null}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <div>
      <ListFilter />
      <Group style={{margin: 4}}>
        <Box pos="relative">
        <LoadingOverlay visible={isLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
          <Table.ScrollContainer minWidth={1200} mah={560} mih={isLoading ? 555 : 50} type="native" bg="white" style={{ borderRadius: 8, border: "1px solid #ddd", scrollbarWidth: "thin"}}>
            <Table withColumnBorders stickyHeader horizontalSpacing="xs" verticalSpacing="xs">
              <Table.Thead>
                <Table.Tr>
                  {/* <Table.Th /> */}
                  <Table.Th ta="center" c="dark.3">Key</Table.Th>
                  <Table.Th c="dark.3">Title</Table.Th>
                  <Table.Th ta="center" c="dark.3">Status</Table.Th>
                  <Table.Th ta="center" c="dark.3">Priority</Table.Th>
                  <Table.Th ta="center" c="dark.3">Asignee</Table.Th>
                  <Table.Th c="dark.3">Due date</Table.Th>
                  <Table.Th c="dark.3">Date updated</Table.Th>
                  <Table.Th c="dark.3">Date created</Table.Th>
                </Table.Tr>
              </Table.Thead>
              {data?.length > 0 && <Table.Tbody>{rows}</Table.Tbody>}
            </Table>
            {data?.length === 0 && <Center p={80}><Title order={4}>No data found</Title></Center>}
          </Table.ScrollContainer>
          <Pagination pt="sm" color="cyan" value={Number(page)} total={isLoading ? previousPageCount.current : pageCount} disabled={isLoading} onChange={handleTableChange} size="lg"  />
        </Box>
      </Group>
    </div>
  );
}