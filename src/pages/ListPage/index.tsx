import { useEffect } from 'react';
import { Table, Pagination, Group } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useParams } from 'react-router-dom';
import { fetchList } from '../../apis';
import { PriorityBadge } from '../BoardPage/components';
import dayjs from 'dayjs';

const CURRENT_DATE = dayjs();

export const ListPage = () => {
  // const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const { id: boardId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams()

  const page = searchParams.get('page')
  const params = { page }

  useEffect(() => {
    searchParams.set("page", 1)
    setSearchParams(searchParams);
  }, [])
  
  const { data: list, isLoading, error: errorFetchList } = useQuery({
    queryKey: [boardId, page],
    queryFn: () => fetchList(boardId, params),
    enabled: boardId != undefined && page != null,
    retry: false,
    refetchOnWindowFocus: false
  })


  const data = list?.data?.data
  const total = list?.data?.total
  // console.log(data, total)
  const pageCount = Math.ceil(total / 12);

  const handleTableChange = (page: string) => {
    console.log(page, 'WHAT')
    searchParams.set("page", page)
    setSearchParams(searchParams);
  }
  
  const rows = data?.map((element) => (
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
      <Table.Td>{element.card_key}</Table.Td>
      <Table.Td>{element.title}</Table.Td>
      <Table.Td>{element.status}</Table.Td>
      <Table.Td>{element.asignee}</Table.Td>
      <Table.Td align="center">{element.priority && <PriorityBadge priority={element?.priority} />}</Table.Td>
      <Table.Td c={CURRENT_DATE >= dayjs(element.due_date) ? "red" : "dark"}>{element?.due_date ? dayjs(element.due_date).format('MMM DD, YYYY') : null}</Table.Td>
      <Table.Td>{element?.date_updated ? dayjs(element.date_updated).format('MMM DD, YYYY') : null}</Table.Td>
      <Table.Td>{element?.date_created ? dayjs(element.date_created).format('MMM DD, YYYY') : null}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Group justify='center'>
      <Table.ScrollContainer minWidth={1400} mah={500} mih={50} type="native" bg="white" style={{ borderRadius: 8, border: "1px solid #ddd"}}>
        <Table withColumnBorders stickyHeader horizontalSpacing="xs" verticalSpacing="xs">
          <Table.Thead>
            <Table.Tr>
              {/* <Table.Th /> */}
              <Table.Th c="dark.3">Key</Table.Th>
              <Table.Th c="dark.3" w={300}>Title</Table.Th>
              <Table.Th c="dark.3">Status</Table.Th>
              <Table.Th c="dark.3">Asignee</Table.Th>
              <Table.Th ta="center" c="dark.3">Priority</Table.Th>
              <Table.Th c="dark.3">Due date</Table.Th>
              <Table.Th c="dark.3">Date updated</Table.Th>
              <Table.Th c="dark.3">Date created</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      {data?.length > 0 && <Pagination color="cyan" value={Number(page)} total={pageCount} disabled={isLoading} onChange={handleTableChange} size="lg"  />}
    </Group>
  );
}