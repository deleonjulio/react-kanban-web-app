import { Group, Modal, Text, Button, SimpleGrid} from "@mantine/core"

export const DeleteColumnModal = ({
    opened,
    close,
    handleDeleteColumn,
    deleteColumnIsPending
}: {
    opened: boolean;
    close: () => void;
    handleDeleteColumn: () => void;
    deleteColumnIsPending: boolean
}) => {
    
    return (
        <Modal title="Delete Column" opened={opened} onClose={close} centered>
            <SimpleGrid>
                <Text size="sm">
                    Please confirm that you wish delete this column.
                    <br/>
                    Deleting a column removes it permanently from the project.
                </Text>
                <Group justify="flex-end">
                    <Button variant="default" onClick={close} disabled={deleteColumnIsPending}>Cancel</Button>
                    <Button variant="outline" color="red" onClick={handleDeleteColumn} disabled={deleteColumnIsPending} loading={deleteColumnIsPending}>Delete</Button>
                </Group>
            </SimpleGrid>
        </Modal>
    )
}