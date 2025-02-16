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
}

type SelectedCard = Card & {
    content?: string
    formatted_content?: string;
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
}

export type { Board, Column, Card, SelectedCard, UpdateCardPayload }