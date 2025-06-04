import { ExpenseCategory } from "@/types/types";
import * as SQLite from "expo-sqlite";

const defaultCategories = [
  "Food",
  "Transportation",
  "Medication",
  "Cloth",
  "School",
  "Tax",
  "Other",
];

export class ExpenseCategoryService {
  private static db: SQLite.SQLiteDatabase;

  static async init() {
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync("expenses.db");
    }

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL
      );
    `);

    // Insert default categories if they don't exist
    for (const name of defaultCategories) {
      await this.db.runAsync(
        `INSERT OR IGNORE INTO categories (name, created_at) VALUES (?, datetime('now'))`,
        name
      );
    }
  }

  static async getAll(): Promise<ExpenseCategory[]> {
    const rows = await this.db.getAllAsync<ExpenseCategory>(
      "SELECT * FROM categories ORDER BY name"
    );
    return rows;
  }

  static async add(name: string): Promise<number> {
    const result = await this.db.runAsync(
      'INSERT INTO categories (name, created_at) VALUES (?, datetime("now"))',
      name
    );
    return result.lastInsertRowId; // Return the new ID
  }

  static async remove(id: number): Promise<void> {
    await this.db.runAsync("DELETE FROM categories WHERE id = ?", id);
  }
}
