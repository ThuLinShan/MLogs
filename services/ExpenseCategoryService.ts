// services/ExpenseCategoryService.ts
import { ExpenseCategory } from "@/types/types";
import * as SQLite from "expo-sqlite";

// Constants
const DB_NAME = "expenses.db";
const TABLE_CATEGORIES = "categories";

const COL_ID = "id";
const COL_NAME = "name";
const COL_CREATED_AT = "created_at";

const DEFAULT_CATEGORIES = [
  "Food",
  "Transportation",
  "Medication",
  "Cloth",
  "School",
  "Tax",
  "Other",
];

let db: SQLite.SQLiteDatabase;

const ensureDbReady = () => {
  if (!db) throw new Error("ExpenseCategoryService: Database not initialized");
};

export const ExpenseCategoryService = {
  async init(): Promise<void> {
    if (db) return;

    try {
      db = await SQLite.openDatabaseAsync(DB_NAME, {
        useNewConnection: true,
      });

      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS ${TABLE_CATEGORIES} (
          ${COL_ID} INTEGER PRIMARY KEY AUTOINCREMENT,
          ${COL_NAME} TEXT NOT NULL UNIQUE,
          ${COL_CREATED_AT} TEXT NOT NULL
        );
      `);

      for (const name of DEFAULT_CATEGORIES) {
        await db.runAsync(
          `INSERT OR IGNORE INTO ${TABLE_CATEGORIES} (${COL_NAME}, ${COL_CREATED_AT}) VALUES (?, datetime('now'))`,
          name
        );
      }

      console.log("ExpenseCategoryService: DB initialized and table ensured");
    } catch (error) {
      console.error("ExpenseCategoryService.init() failed:", error);
      throw new Error("ExpenseCategoryService: Initialization failed");
    }
  },

  async close(): Promise<void> {
    if (!db) return;

    try {
      await db.closeAsync();
      console.log("ExpenseCategoryService: DB connection closed");
    } catch (error) {
      console.error("ExpenseCategoryService.close() failed:", error);
    } finally {
      db = undefined!;
    }
  },

  async getAll(): Promise<ExpenseCategory[]> {
    ensureDbReady();

    try {
      const result = await db.getAllAsync<ExpenseCategory>(
        `SELECT * FROM ${TABLE_CATEGORIES} ORDER BY ${COL_NAME}`
      );
      return result;
    } catch (error) {
      console.error("ExpenseCategoryService.getAll() failed:", error);
      return [];
    }
  },

  async add(name: string): Promise<number> {
    ensureDbReady();

    try {
      const result = await db.runAsync(
        `INSERT INTO ${TABLE_CATEGORIES} (${COL_NAME}, ${COL_CREATED_AT}) VALUES (?, datetime('now'))`,
        name
      );
      return result.lastInsertRowId!;
    } catch (error) {
      console.error("ExpenseCategoryService.add() failed:", error);
      return -1;
    }
  },

  async remove(id: number): Promise<void> {
    ensureDbReady();

    try {
      await db.runAsync(
        `DELETE FROM ${TABLE_CATEGORIES} WHERE ${COL_ID} = ?`,
        id
      );
      console.log(`ExpenseCategoryService.remove(): id=${id} deleted`);
    } catch (error) {
      console.error("ExpenseCategoryService.remove() failed:", error);
    }
  },
};
