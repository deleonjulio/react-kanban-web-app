import { Badge } from "@mantine/core";
import { PRIORITY_OPTIONS } from "../../../config";

export const PriorityBadge = ({priority: initialPriority, size}: {priority?: string | null; size?: string}) => {
    const priority = PRIORITY_OPTIONS.find(p => p.value === initialPriority)?.label ?? null

    let priorityColor = "green";

    if(priority === "High") {
        priorityColor = "red"
    } else if (priority === "Normal") {
        priorityColor = "yellow"
    }

    return <Badge style={{margin: 0, visibility: priority ? 'visible' : 'hidden'}} size={size} color={priorityColor}>{priority}</Badge>
}