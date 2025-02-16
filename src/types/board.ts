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
    created_by?: {
        name?: string;
    }
    date_created?: string;
}

export type { Board, Column, Card, SelectedCard}