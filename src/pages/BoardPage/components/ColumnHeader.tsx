import { Tooltip, ActionIcon } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";


export const ColumnHeader = ({ name, index, open }: { name:string; index: number; open: () => void }) => {
    if(index === 0) {
      return (
        <div style={{flex: 1, display: 'flex', justifyContent: 'space-between'}}>
          <span>
            {name}
          </span>
          <Tooltip label="New card" position="bottom">
            <ActionIcon variant="outline" aria-label="Add new card" color="gray" onClick={open}>
              <IconPlus color="gray" />
            </ActionIcon>
          </Tooltip>
        </div>
      )
    }

    return name
  }