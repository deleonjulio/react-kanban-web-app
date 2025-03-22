import React, { useReducer, useContext, createContext, type ReactNode } from 'react';

export type Card = {
  _id?: string;
  board_id?: string;
  column_id?: string;
  board_key?: string;
  card_no?: number;
  card_key?: string;
  title?: string;
  content?: string;
  formatted_content?: string | null;
  asignee?: string | null;
  priority?: string | null;
  due_date?: string | null;
  date_created?: string;
  date_updated?: string;
  date_deleted?: string | null;
  deleted?: boolean;
  created_by?: string;
};

type Column = {
  name: string;
  items: Card[];
};

// type BoardColumns = Record<string, Column>;
export type BoardColumns = { 
    [key: string]: Column
}

type ColumnsAction =
  | { type: 'LIST'; boardData: BoardColumns; }

const initialColumns: BoardColumns = {};

const ColumnsContext = createContext<BoardColumns | undefined>(undefined);
const ColumnsDispatchContext = createContext<React.Dispatch<ColumnsAction> | undefined>(undefined);

interface ColumnsProviderProps {
  readonly children: ReactNode;
}

export function ColumnsProvider({ children }: ColumnsProviderProps) {
  const [columns, dispatch] = useReducer(columnsReducer, initialColumns);

  return (
    <ColumnsContext.Provider value={columns}>
      <ColumnsDispatchContext.Provider value={dispatch}>
        {children}
      </ColumnsDispatchContext.Provider>
    </ColumnsContext.Provider>
  );
}

export const useColumns = () => {
  const context = useContext(ColumnsContext);
  if (context === undefined) {
    throw new Error('useColumns must be used within a ColumnsProvider');
  }
  return context;
};

export const useColumnsDispatch = () => {
  const context = useContext(ColumnsDispatchContext);
  if (context === undefined) {
    throw new Error('useColumnsDispatch must be used within a ColumnsProvider');
  }
  return context;
};

const columnsReducer = (state: BoardColumns, action: ColumnsAction): BoardColumns => {
  switch (action.type) {
    case 'LIST':
      return {
        ...action.boardData
      };
  }
};
