// services/ExpenseCategoryService.ts
import { ExpenseCategory } from "@/types/types";
import * as SQLite from "expo-sqlite";

// Constants
const DB_NAME = "expenses.db";
const TABLE_CATEGORIES = "categories";
const TABLE_EXPENSE_ITEMS = "expense_items";

const COL_ID = "id";
const COL_NAME = "name";
const COL_CREATED_AT = "created_at";
const COL_CATEGORY_ID = "category_id";

const DEFAULT_CATEGORIES = [
  "Food",
  "Transportation",
  "Medication",
  "Cloth",
  "School",
  "Tax",
  "Other",
  "None",
];

// Protected category that cannot be deleted
const PROTECTED_CATEGORY = "None";

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
      // First, check if the category is protected
      const category = await db.getFirstAsync<ExpenseCategory>(
        `SELECT * FROM ${TABLE_CATEGORIES} WHERE ${COL_ID} = ?`,
        id
      );

      if (!category) {
        console.warn(
          `ExpenseCategoryService.remove(): Category with id=${id} not found`
        );
        return;
      }

      if (category.name === PROTECTED_CATEGORY) {
        console.warn(
          `ExpenseCategoryService.remove(): Cannot delete protected category "${PROTECTED_CATEGORY}"`
        );
        throw new Error(
          `Cannot delete the "${PROTECTED_CATEGORY}" category as it is protected`
        );
      }

      // Get the "None" category ID
      const noneCategory = await db.getFirstAsync<ExpenseCategory>(
        `SELECT * FROM ${TABLE_CATEGORIES} WHERE ${COL_NAME} = ?`,
        PROTECTED_CATEGORY
      );

      if (!noneCategory) {
        throw new Error(
          `Protected category "${PROTECTED_CATEGORY}" not found in database`
        );
      }

      // Update all expense items using this category to use "None" category
      await db.runAsync(
        `UPDATE ${TABLE_EXPENSE_ITEMS} SET ${COL_CATEGORY_ID} = ? WHERE ${COL_CATEGORY_ID} = ?`,
        noneCategory.id!, // Add ! here
        id
      );
      // Delete the category
      await db.runAsync(
        `DELETE FROM ${TABLE_CATEGORIES} WHERE ${COL_ID} = ?`,
        id
      );

      console.log(
        `ExpenseCategoryService.remove(): id=${id} deleted and related expense items updated to "None" category`
      );
    } catch (error) {
      console.error("ExpenseCategoryService.remove() failed:", error);
      throw error; // Re-throw to let the caller handle the error
    }
  },

  // Helper method to check if a category can be deleted
  async canDelete(id: number): Promise<boolean> {
    ensureDbReady();

    try {
      const category = await db.getFirstAsync<ExpenseCategory>(
        `SELECT * FROM ${TABLE_CATEGORIES} WHERE ${COL_ID} = ?`,
        id
      );

      return category ? category.name !== PROTECTED_CATEGORY : false;
    } catch (error) {
      console.error("ExpenseCategoryService.canDelete() failed:", error);
      return false;
    }
  },

  // Helper method to get the "None" category ID
  async getNoneCategoryId(): Promise<number> {
    ensureDbReady();

    try {
      const noneCategory = await db.getFirstAsync<ExpenseCategory>(
        `SELECT * FROM ${TABLE_CATEGORIES} WHERE ${COL_NAME} = ?`,
        PROTECTED_CATEGORY
      );

      if (!noneCategory) {
        throw new Error(
          `Protected category "${PROTECTED_CATEGORY}" not found in database`
        );
      }

      return noneCategory.id!;
    } catch (error) {
      console.error(
        "ExpenseCategoryService.getNoneCategoryId() failed:",
        error
      );
      throw error;
    }
  },
};
