import { Avatar, Center, Grid, Group, Pagination, Paper, Table, Text, Box, LoadingOverlay, Loader } from '@mantine/core';
import dayjs from 'dayjs';
import { useTableFetch } from '../../../hooks';
import { getCardActivities } from '../../../apis';
import { IconArrowRight } from '@tabler/icons-react';

type Activity = {
  _id: string;
  action: string;
  created_by: { name: string; };
  date_created: string;
  action_type: string;
}

const ActionDetails = ({actionType}: {actionType?: string}) => {
  if(actionType === 'create_issue') {
    return (
      <>
        <Text size="sm">{" "} created the</Text>
        <Text fw={700} size="sm">{" "} issue</Text>
      </>
    )
  } else if(actionType === 'update_description') {
    return (
      <>
        <Text size="sm">{" "} updated the</Text>
        <Text fw={700} size="sm">{" "} description</Text>
      </>
    )
  } else if(actionType === 'update_status') {
    return (
      <>
        <Text size="sm">{" "} updated the</Text>
        <Text fw={700} size="sm">{" "} status</Text>
      </>
    )
  }
  
  return null;
}

const ActionDescription = ({activity}: {activity?: Activity}) => {
  const actionType = activity?.action_type;
  if (actionType === 'create_issue') {
    return null;
  } else if(actionType === 'update_description') {
    return null;
  } else if(actionType === 'update_status') {
    return (
      <Group gap="xs">
        <Text size="sm">{activity?.changes?.from}</Text>
        <IconArrowRight size={16} />
        <Text size="sm">{activity?.changes?.to}</Text>
      </Group>
    )
  }

  return null;
}

const Content = ({activity}: {activity?: Activity}) => {
  const USER = activity?.created_by?.name ?? '-'

  return (
    <Grid gutter="0" pb="xs">
      <Grid.Col>
        <Group gap="xs">
          <Group gap={4}>
            <Text fw={700} size="sm">{`${USER} `}</Text>
            <ActionDetails actionType={activity?.action_type} />
          </Group>
        </Group>
      </Grid.Col>
      <Grid.Col>
        <Text size="xs" c="gray.7">{dayjs(activity?.date_created).format('MMM. DD, YYYY HH:mm:ss')}</Text>
      </Grid.Col>
      <Grid.Col pt={8}>
        <ActionDescription activity={activity} />
      </Grid.Col>
    </Grid>
  )
}

export const CardActivity = ({cardId}: {cardId?: string}) => {
  const { data: activities, fetch, isLoading, pageCount, setTableConfig, tableConfig } = useTableFetch({
    endpoint: getCardActivities,
    queryKey: "cardActivities",
    queryParams: { cardId },
    enabled: !!cardId,
  });

  const handleTableChange = (pageNumber: number) => setTableConfig((prev) => ({...prev, currentPage: pageNumber}))

  const rows = activities.map((activity: Activity) => (
    <Table.Tr key={activity._id}>
      <Table.Td style={{justifyContent:"center", display:"flex"}}>
       <Avatar name={activity?.created_by.name} color="initials" />
      </Table.Td>
      <Table.Td>
        <Content activity={activity} />
      </Table.Td>
    </Table.Tr>
  ));

  return (
     <Paper shadow="xs" p="xs">
        <Grid gutter={0}>
          <Grid.Col>
            <Center>
              <Text fw={700} size="md">Activities</Text>
            </Center>
          </Grid.Col>
          <Grid.Col>
            <Center>
              {isLoading && <Box p="xl"><Loader size={50} /></Box>}
              {(!isLoading && rows.length === 0) && <Box p="xl"><Text c="gray.6">No activity found</Text></Box>}
              {(!isLoading && rows.length > 0) && (<Table horizontalSpacing={0} withRowBorders={false}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th w={60}></Table.Th>
                    <Table.Th></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
              </Table>) }
            </Center>
          </Grid.Col>
          <Grid.Col pt={8}>
            <Center>
              {rows.length > 0 && <Pagination value={tableConfig.currentPage} disabled={isLoading} total={pageCount} onChange={handleTableChange} />}
            </Center>
          </Grid.Col>
        </Grid>
      </Paper>
  );
}