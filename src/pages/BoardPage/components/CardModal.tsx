import { Divider, Modal, Title, Paper, SimpleGrid, Text, Grid, Button, Flex } from "@mantine/core";
import dayjs from "dayjs";
import { SelectedCard } from "../../../types";
import { IconTrash, IconEdit } from "@tabler/icons-react";


export const CardModal = ({
    opened,
    close,
    selectedCard,
    boardName,
    initDeleteCard,
}: {
    opened: boolean; 
    close: () => void; 
    selectedCard: SelectedCard | null;
    boardName: string;
    initDeleteCard: () => void;
}) => {

    const card = selectedCard;

    return (
        <Modal title={<Text size="sm" fw={700}>{boardName}</Text>} closeOnEscape={false} closeOnClickOutside={false} opened={opened} onClose={close} size="64rem">
            <SimpleGrid cols={1} spacing="xs" verticalSpacing="xs">
                <Divider />
                <Grid>
                    <Grid.Col span={{ xs: 12, sm:8, md: 9, lg: 9 }}><Title order={4}> {selectedCard?.title}</Title></Grid.Col>
                    <Grid.Col span={{ xs: 12, sm:4, md: 3, lg: 3 }}>
                        <Flex justify="flex-end" align="center" gap="md" h="100%">
                            <Button leftSection={<IconEdit size={14} />} variant="default">
                                Edit
                            </Button>
                            <Button color="red" leftSection={<IconTrash size={14} />} variant="outline" onClick={initDeleteCard}>
                                Delete
                            </Button>
                        </Flex>
                    </Grid.Col>
                </Grid>
               
                <Paper shadow="xs" p="md">
                    <Text size="sm" fw={700}>{card?.created_by?.name ?? '-'}</Text>
                    <Text size="xs" c="gray.7">Created {dayjs(card?.date_created).format('MMM. DD, YYYY HH:mm:ss')}</Text>
                </Paper>
            </SimpleGrid>
        </Modal>
    )
}