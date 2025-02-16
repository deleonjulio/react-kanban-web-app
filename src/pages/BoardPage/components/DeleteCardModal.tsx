import { Group, Modal, Text, Button, SimpleGrid} from "@mantine/core"
import { SelectedCard } from "../../../types";

export const DeleteCardModal = ({
    opened,
    close,
    selectedCard,
    handleDeleteCard,
    deleteCardIsPending
}: {
    opened: boolean;
    close: () => void;
    selectedCard: SelectedCard | null,
    handleDeleteCard: ({columnId, cardId} : { columnId?: string, cardId?: string}) => void;
    deleteCardIsPending: boolean
}) => {
    const card = selectedCard;
    
    return (
        <Modal title="Delete Card" opened={opened} onClose={close} centered>
            <SimpleGrid>
                <Text size="sm">
                    Please confirm that you wish delete this card.
                    <br/>
                    Deleting a card removes it permanently from the project.
                </Text>
                <Group justify="flex-end">
                    <Button variant="default" disabled={deleteCardIsPending}>Cancel</Button>
                    <Button variant="outline" color="red" onClick={() => handleDeleteCard({columnId: card?.column_id, cardId: card?._id})} disabled={deleteCardIsPending} loading={deleteCardIsPending}>Delete</Button>
                </Group>
            </SimpleGrid>
        </Modal>
    )
}