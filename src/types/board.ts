import { DateValue } from "@mantine/dates";

type Board = { 
    [key: string]: Column
}

type Column = {
    name: string;
    items: Card[]
}

type Card = {
    _id: string;
    title: string;
    column_id: string;
    priority?: string | null;
    due_date?: DateValue | null;
    card_key: string;
}

type SelectedCard = Card & {
    content?: string
    formatted_content?: string;
    priority?: string | null;
    due_date?: DateValue | null;
    created_by?: {
        name?: string;
    }
    date_created?: string;
}

type UpdateCardPayload = {
    _id?: string;
    column_id?: string;
    title?: string;
    content?: string;
    formatted_content?: string;
    priority?: string | null;
    due_date?: DateValue | null;
}

type ColumnFilters = {
    priority?: string | null
}

export type { Board, Column, Card, SelectedCard, UpdateCardPayload, ColumnFilters }