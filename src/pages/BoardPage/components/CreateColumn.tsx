import { useEffect, useState } from "react";
import { ActionIcon, TextInput, Button } from "@mantine/core";
import { IconPlus, IconCheck, IconX } from '@tabler/icons-react';
import { useForm } from '@mantine/form';

export const CreateColumn = ({
  handleCreateColumn,
  createColumnIsPending
}: {
  handleCreateColumn: ({ name, onSuccess }: { name: string; onSuccess: () => void; }) => void;
  createColumnIsPending: boolean;
}) => {
  const scrollContainer = document.getElementById("board-container");

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
        name: '',
    },
    validate: {
        name: (value) => (value.length < 1 ? '' : null),
    }
  });

  const [isCreating, setIsCreating] = useState(false);

  const resetCreateColumn = () => {
    if(createColumnIsPending) return;
    setIsCreating(false)
    form.reset();
  }

  const onSubmit = ({ name }: { name: string; }) => {  
    handleCreateColumn({ name, onSuccess: resetCreateColumn });
  }

  useEffect(() =>{
    if (scrollContainer) {
      // NOT WORKING CURRENTLY
      scrollContainer.scrollBy({ left: 200, behavior: "smooth" });
    }
  }, [isCreating])

  return (
    <div style={{width: "inherit"}}>
      {isCreating ? (
        <div onMouseLeave={resetCreateColumn}>
          <form
            onSubmit={form.onSubmit((values: { name: string; }) => onSubmit(values))} 
            style={{display:"flex", flexDirection:"column", gap: 8, paddingBottom: 38 }}
          >
            <TextInput
              disabled={createColumnIsPending}
              placeholder="Enter column name"
              key={form.key('name')}
              {...form.getInputProps('name')}
              autoFocus 
            />
            <div style={{display:"flex", gap: 4, justifyContent:"center"}}>
              <ActionIcon loading={createColumnIsPending} variant="default" type="submit" disabled={createColumnIsPending}>
                <IconCheck />
              </ActionIcon>
              <ActionIcon variant="default" onClick={resetCreateColumn} disabled={createColumnIsPending}>
                <IconX />
              </ActionIcon>
            </div>
          </form>
        </div>
      ) : (
        <Button leftSection={<IconPlus size={18} color="gray"/>} size="sm" variant="default" onClick={() => setIsCreating(true)}>Add new column</Button>
      )}
     
    </div>
  )
}