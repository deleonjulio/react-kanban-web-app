import { Modal, TextInput, Group, Button } from "@mantine/core";
export const NewCardModal = ({
    form,
    startingColumn, 
    opened, 
    close, 
    handleCreateCard, 
    createCardIsPending
  }: { 
    form: any;
    startingColumn: string; 
    opened: boolean; 
    close: () => void; 
    handleCreateCard: ({columnId, title}: { columnId: string; title: string}) => void; 
    createCardIsPending: boolean; 
  }) => {
  
    const onSubmit = ({title}: { title: string; }) => {  
      handleCreateCard({columnId: startingColumn, title})
    }
  
    return (
      <Modal closeOnEscape={false} withCloseButton={false} closeOnClickOutside={false} opened={opened} onClose={close} title="New Card" size="md">
        <form onSubmit={form.onSubmit((values: { title: string; }) => onSubmit(values))}>
            <TextInput 
                disabled={createCardIsPending}
                key={form.key('title')}
                {...form.getInputProps('title')}
                label="Title" 
            />
            <Group mt="lg">
                <Button type="submit" disabled={createCardIsPending}>Create</Button>
                <Button variant="outline" onClick={close}>Cancel</Button>
            </Group>
        </form>
      </Modal>
    );
  }