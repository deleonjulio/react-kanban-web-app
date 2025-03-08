import { useEffect, useState } from "react";
import { ActionIcon, Tooltip, TextInput } from "@mantine/core";
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
      scrollContainer.scrollBy({ left: 200, behavior: "smooth" });
    }
  }, [isCreating])

  return (
    <div style={{width: 225}}>
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
        <Tooltip label="Add new column" position="bottom">
          <ActionIcon variant="default" aria-label="Add new column" onClick={() => setIsCreating(true)}>
            <IconPlus color="gray" />
          </ActionIcon>
        </Tooltip>
      )}
     
    </div>
  )
}