import { ExpenseItemType } from "@/types/types";
import {
  getCurrentEpoch,
  getEpochRangeForThisMonth,
  getEpochRangeForToday,
} from "@/utils/util";
import * as SQLite from "expo-sqlite";

const DATABASE_NAME = "expenses.db";
const TABLE_EXPENSE_ITEMS = "expense_items";
const TABLE_CATEGORIES = "categories";
const TABLE_CURRENCIES = "currencies";

const COL_ID = "id";
const COL_NAME = "name";
const COL_PRICE = "price";
const COL_QUANTITY = "quantity";
const COL_CATEGORY_ID = "category_id";
const COL_CURRENCY_ID = "currency_id";
const COL_CREATED_AT = "created_at";

let db: SQLite.SQLiteDatabase;

const ensureDbReady = () => {
  if (!db) throw new Error("Database not initialized");
  console.log("ExpenseItemService.ensureDbReady(): database is ready");
};

const calculateTotal = (item: ExpenseItemType) => ({
  ...item,
  total: item.quantity * item.price,
});

const fetchExpensesInRange = async (
  startEpoch: number,
  endEpoch: number
): Promise<ExpenseItemType[]> => {
  ensureDbReady();
  try {
    const items = await db.getAllAsync<ExpenseItemType>(
      `SELECT * FROM ${TABLE_EXPENSE_ITEMS} WHERE ${COL_CREATED_AT} BETWEEN ? AND ?`,
      startEpoch,
      endEpoch
    );
    return items.map(calculateTotal);
  } catch (err) {
    console.error("fetchExpensesInRange failed:", err);
    return [];
  }
};

const getEpochRangeFromDateRange = (start: Date, end: Date) => [
  Math.floor(start.getTime() / 1000),
  Math.floor(end.getTime() / 1000),
];

export const ExpenseItemService = {
  async init(): Promise<void> {
    if (db) return;
    try {
      db = await SQLite.openDatabaseAsync(DATABASE_NAME, {
        useNewConnection: true,
      });
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS ${TABLE_EXPENSE_ITEMS} (
          ${COL_ID} INTEGER PRIMARY KEY AUTOINCREMENT,
          ${COL_NAME} TEXT NOT NULL,
          ${COL_PRICE} REAL NOT NULL,
          ${COL_QUANTITY} INTEGER NOT NULL DEFAULT 1,
          ${COL_CATEGORY_ID} INTEGER NOT NULL,
          ${COL_CURRENCY_ID} INTEGER NOT NULL,
          ${COL_CREATED_AT} INTEGER NOT NULL,
          FOREIGN KEY (${COL_CATEGORY_ID}) REFERENCES ${TABLE_CATEGORIES}(${COL_ID}),
          FOREIGN KEY (${COL_CURRENCY_ID}) REFERENCES ${TABLE_CURRENCIES}(${COL_ID})
        );
      `);
    } catch (err) {
      console.error("Database initialization failed:", err);
    }
  },
  async close(): Promise<void> {
    if (!db) return;
    try {
      await db.closeAsync();
      console.log("ExpenseItemService: DB closed");
    } catch (err) {
      console.error("ExpenseItemService.close() failed:", err);
    } finally {
      db = undefined!;
    }
  },

  async add(item: Omit<ExpenseItemType, "id" | "created_at">): Promise<number> {
    ensureDbReady();
    try {
      const epoch = getCurrentEpoch();
      const result = await db.runAsync(
        `INSERT INTO ${TABLE_EXPENSE_ITEMS} (${COL_NAME}, ${COL_PRICE}, ${COL_QUANTITY}, ${COL_CATEGORY_ID}, ${COL_CURRENCY_ID}, ${COL_CREATED_AT}) VALUES (?, ?, ?, ?, ?, ?)`,
        item.name,
        item.price,
        item.quantity,
        item.category_id,
        item.currency_id,
        epoch
      );
      return result.lastInsertRowId!;
    } catch (err) {
      console.error("add failed:", err);
      return -1;
    }
  },

  async fetchExpensesInRange(
    startEpoch: number,
    endEpoch: number
  ): Promise<ExpenseItemType[]> {
    return fetchExpensesInRange(startEpoch, endEpoch);
  },

  async resetAndSeedMockData(): Promise<void> {
    ensureDbReady();
    try {
      await db.execAsync(`DELETE FROM ${TABLE_EXPENSE_ITEMS};`);
      const now = new Date();
      const baseTime =
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 9
        ).getTime() / 1000;
      const insertSQL = `
        INSERT INTO ${TABLE_EXPENSE_ITEMS} 
        (${COL_NAME}, ${COL_PRICE}, ${COL_QUANTITY}, ${COL_CATEGORY_ID}, ${COL_CURRENCY_ID}, ${COL_CREATED_AT})
        VALUES (?, ?, ?, ?, ?, ?);
      `;
      for (let day = 0; day < 10; day++) {
        const dayEpoch = baseTime + day * 86400;
        for (let i = 0; i < 10; i++) {
          const item: ExpenseItemType = {
            name: `Mock Item ${day * 10 + i + 1}`,
            price: parseFloat((Math.random() * 100).toFixed(2)),
            quantity: Math.floor(Math.random() * 5) + 1,
            category_id: 1,
            currency_id: 1,
            created_at: dayEpoch + i * 300,
            total: 0,
          };
          await db.runAsync(
            insertSQL,
            item.name,
            item.price,
            item.quantity,
            item.category_id,
            item.currency_id,
            item.created_at
          );
        }
      }
    } catch (err) {
      console.error("resetAndSeedMockData failed:", err);
    }
  },

  async getAll(): Promise<ExpenseItemType[]> {
    ensureDbReady();
    try {
      const items = await db.getAllAsync<ExpenseItemType>(
        `SELECT * FROM ${TABLE_EXPENSE_ITEMS} ORDER BY ${COL_CREATED_AT} DESC`
      );
      return items.map(calculateTotal);
    } catch (err) {
      console.error("getAll failed:", err);
      return [];
    }
  },

  async remove(id: number): Promise<void> {
    ensureDbReady();
    try {
      await db.runAsync(
        `DELETE FROM ${TABLE_EXPENSE_ITEMS} WHERE ${COL_ID} = ?`,
        id
      );
    } catch (err) {
      console.error("remove failed:", err);
    }
  },

  async getThisMonthExpense(): Promise<number> {
    const [start, end] = getEpochRangeForThisMonth();
    return fetchExpensesInRange(start, end).then((items) =>
      items.reduce((sum, i) => sum + i.total, 0)
    );
  },

  async getTodayExpense(): Promise<ExpenseItemType[]> {
    const [start, end] = getEpochRangeForToday();
    return fetchExpensesInRange(start, end);
  },

  async updateQuantity(id: number, newQuantity: number): Promise<void> {
    ensureDbReady();
    try {
      await db.runAsync(
        `UPDATE ${TABLE_EXPENSE_ITEMS} SET ${COL_QUANTITY} = ? WHERE ${COL_ID} = ?`,
        newQuantity,
        id
      );
    } catch (err) {
      console.error("updateQuantity failed:", err);
    }
  },

  async incrementQuantity(id: number): Promise<void> {
    ensureDbReady();
    console.log("ExpenseItemService.incrementQuantity() is invoked");
    try {
      await db.runAsync(
        `UPDATE ${TABLE_EXPENSE_ITEMS} SET ${COL_QUANTITY} = ${COL_QUANTITY} + 1 WHERE ${COL_ID} = ?`,
        id
      );
      console.log("ExpenseItemService.incrementQuantity() is successful");
    } catch (err) {
      console.error("incrementQuantity failed:", err);
    }
  },

  async decrementQuantity(id: number): Promise<void> {
    ensureDbReady();
    try {
      await db.runAsync(
        `UPDATE ${TABLE_EXPENSE_ITEMS} SET ${COL_QUANTITY} = CASE WHEN ${COL_QUANTITY} > 1 THEN ${COL_QUANTITY} - 1 ELSE 1 END WHERE ${COL_ID} = ?`,
        id
      );
    } catch (err) {
      console.error("decrementQuantity failed:", err);
    }
  },

  async getDailyTotalExpense(date: Date): Promise<number> {
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const end = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59
    );
    return this.getTotalExpenseByRange(start, end);
  },

  async getMonthlyTotalExpense(date: Date): Promise<number> {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
      23,
      59,
      59
    );
    return this.getTotalExpenseByRange(start, end);
  },

  async getYearlyTotalExpense(date: Date): Promise<number> {
    const start = new Date(date.getFullYear(), 0, 1);
    const end = new Date(date.getFullYear(), 11, 31, 23, 59, 59);
    return this.getTotalExpenseByRange(start, end);
  },

  async getTotalExpenseByRange(start: Date, end: Date): Promise<number> {
    const [startEpoch, endEpoch] = getEpochRangeFromDateRange(start, end);
    const items = await fetchExpensesInRange(startEpoch, endEpoch);
    return items.reduce((sum, i) => sum + i.total, 0);
  },

  // New method to update category for expense items
  async updateCategoryForItems(
    fromCategoryId: number,
    toCategoryId: number
  ): Promise<void> {
    ensureDbReady();
    try {
      await db.runAsync(
        `UPDATE ${TABLE_EXPENSE_ITEMS} SET ${COL_CATEGORY_ID} = ? WHERE ${COL_CATEGORY_ID} = ?`,
        toCategoryId,
        fromCategoryId
      );
      console.log(
        `ExpenseItemService.updateCategoryForItems(): Updated items from category ${fromCategoryId} to ${toCategoryId}`
      );
    } catch (err) {
      console.error("updateCategoryForItems failed:", err);
      throw err;
    }
  },

  // Method to get count of items using a specific category
  async getItemCountByCategory(categoryId: number): Promise<number> {
    ensureDbReady();
    try {
      const result = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM ${TABLE_EXPENSE_ITEMS} WHERE ${COL_CATEGORY_ID} = ?`,
        categoryId
      );
      return result?.count || 0;
    } catch (err) {
      console.error("getItemCountByCategory failed:", err);
      return 0;
    }
  },

  async fetchExpensesByMonth(year: number): Promise<{ [key: string]: number }> {
    ensureDbReady();
    try {
      const expenses = await db.getAllAsync<ExpenseItemType>(
        `SELECT ${COL_CREATED_AT}, ${COL_PRICE}, ${COL_QUANTITY} FROM ${TABLE_EXPENSE_ITEMS}`
      );

      if (!expenses || expenses.length === 0) return {}; // Handle empty results

      const monthlyTotals: { [key: string]: number } = {};

      expenses.forEach((expense) => {
        if (
          !expense.created_at ||
          expense.price == null ||
          expense.quantity == null
        )
          return;

        const date = new Date(expense.created_at * 1000);
        if (date.getFullYear() === year) {
          const month = date.getMonth() + 1;
          const key = `${year}-${month < 10 ? `0${month}` : month}`;
          monthlyTotals[key] =
            (monthlyTotals[key] || 0) + expense.price * expense.quantity;
        }
      });

      return monthlyTotals;
    } catch (err) {
      console.error("fetchExpensesByMonth failed:", err);
      return {};
    }
  },

  async fetchExpensesByWeek(
    year: number,
    month: number
  ): Promise<{ [key: string]: number }> {
    ensureDbReady();
    try {
      const expenses = await db.getAllAsync<ExpenseItemType>(
        `SELECT ${COL_CREATED_AT}, ${COL_PRICE}, ${COL_QUANTITY} FROM ${TABLE_EXPENSE_ITEMS}`
      );

      if (!expenses || expenses.length === 0) return {};

      const weeklyTotals: { [key: string]: number } = {};

      expenses.forEach((expense) => {
        if (
          !expense.created_at ||
          expense.price == null ||
          expense.quantity == null
        )
          return;

        const date = new Date(expense.created_at * 1000);
        if (date.getFullYear() === year && date.getMonth() + 1 === month) {
          const week = Math.ceil(date.getDate() / 7);
          const key = `Week ${week}`;
          weeklyTotals[key] =
            (weeklyTotals[key] || 0) + expense.price * expense.quantity;
        }
      });

      return weeklyTotals;
    } catch (err) {
      console.error("fetchExpensesByWeek failed:", err);
      return {};
    }
  },
};
