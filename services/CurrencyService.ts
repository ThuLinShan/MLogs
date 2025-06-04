// src/services/CurrencyService.ts

import { Currency } from "@/types/types";
import * as SQLite from "expo-sqlite";

// ─── Constants ─────────────────────────────────────────────
const DATABASE_NAME = "expenses.db";

const TABLE_CURRENCIES = "currencies";

const COL_ID = "id";
const COL_NAME = "name";
const COL_SYMBOL = "symbol";
const COL_CREATED_AT = "created_at";

// ─── Default Data ──────────────────────────────────────────
const defaultCurrencies: Omit<Currency, "id" | "created_at">[] = [
  { name: "US Dollar", symbol: "$" },
];

// ─── Currency Service ──────────────────────────────────────
export class CurrencyService {
  private static db: SQLite.SQLiteDatabase;

  static async init() {
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    }

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS ${TABLE_CURRENCIES} (
        ${COL_ID} INTEGER PRIMARY KEY AUTOINCREMENT,
        ${COL_NAME} TEXT NOT NULL UNIQUE,
        ${COL_SYMBOL} TEXT NOT NULL,
        ${COL_CREATED_AT} TEXT NOT NULL
      );
    `);

    for (const currency of defaultCurrencies) {
      await this.db.runAsync(
        `INSERT OR IGNORE INTO ${TABLE_CURRENCIES} (${COL_NAME}, ${COL_SYMBOL}, ${COL_CREATED_AT})
         VALUES (?, ?, datetime('now'))`,
        currency.name,
        currency.symbol
      );
    }
  }

  static async getAll(): Promise<Currency[]> {
    return await this.db.getAllAsync<Currency>(
      `SELECT * FROM ${TABLE_CURRENCIES} ORDER BY ${COL_NAME}`
    );
  }

  static async add(
    currency: Omit<Currency, "id" | "created_at">
  ): Promise<number> {
    const result = await this.db.runAsync(
      `INSERT INTO ${TABLE_CURRENCIES} (${COL_NAME}, ${COL_SYMBOL}, ${COL_CREATED_AT})
       VALUES (?, ?, datetime('now'))`,
      currency.name,
      currency.symbol
    );
    return result.lastInsertRowId;
  }

  static async remove(id: number): Promise<void> {
    await this.db.runAsync(
      `DELETE FROM ${TABLE_CURRENCIES} WHERE ${COL_ID} = ?`,
      id
    );
  }
}
