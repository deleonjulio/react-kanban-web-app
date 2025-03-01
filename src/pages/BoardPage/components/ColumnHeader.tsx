import { ActionIcon } from "@mantine/core";
import { Menu} from '@mantine/core';
import { IconTrash, IconPlus, IconDots } from '@tabler/icons-react';

export const ColumnHeader = ({ name, open, initDeleteColumn }: { name:string; open: () => void; initDeleteColumn: () => void; }) => {
    return (
        <div style={{flex: 1, display: 'flex', justifyContent: 'space-between'}}>
            <span>{name}</span>
            <Menu shadow="md" width={170}>
                <Menu.Target>
                    <ActionIcon variant="outline" aria-label="Add new card" color="gray.4">
                        <IconDots color="gray" />
                    </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                    <Menu.Item leftSection={<IconPlus size={14} />} onClick={open}>
                        Create new card
                    </Menu.Item>
                    <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={initDeleteColumn} >
                        Delete column
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        </div>
    )
}
