export type TodoItemType = {
  id?: number;
  title: string;
  description: string;
  created_at?: string;
  completed: boolean;
  remind_at?: string | null; // ISO 8601 string, nullable
};

// src/services/types.ts
export type ExpenseCategory = {
  id?: number;
  name: string;
};

export type ExpenseItem = {
  id?: number;
  name: string;
  price: number;
  quantity: number;
  category_id: number;
  currency_id: number;
  created_at: number;
  total: number;
};

export type Currency = {
  id: number;
  name: string;
  symbol: string;
  created_at?: string;
};

export type Memo = {
  id: number;
  title: string;
  description: string;
  created_at: number; //For using Epoch value.
};
