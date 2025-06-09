// src/services/CurrencyService.ts

import { Currency } from "@/types/types";
import * as SQLite from "expo-sqlite";
import { AppConfigService } from "./AppConfigService";

// ─── Constants ─────────────────────────────────────────────
const DATABASE_NAME = "expenses.db";

const TABLE_CURRENCIES = "currencies";

const COL_ID = "id";
const COL_NAME = "name";
const COL_SYMBOL = "symbol";
const COL_CREATED_AT = "created_at";

// ─── Default Data ──────────────────────────────────────────
// ─── Default Data ──────────────────────────────────────────
const defaultCurrencies: Omit<Currency, "id" | "created_at">[] = [
  { name: "US Dollar", symbol: "$" },
  { name: "Euro", symbol: "€" },
  { name: "Japanese Yen", symbol: "¥" },
  { name: "British Pound", symbol: "£" },
  { name: "Australian Dollar", symbol: "A$" },
  { name: "Canadian Dollar", symbol: "C$" },
  { name: "Swiss Franc", symbol: "CHF" },
  { name: "Chinese Yuan", symbol: "¥" },
  { name: "Indian Rupee", symbol: "₹" },
  { name: "Singapore Dollar", symbol: "S$" },
];

// ─── Currency Service ──────────────────────────────────────
export class CurrencyService {
  private static db: SQLite.SQLiteDatabase;

  static async init() {
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync(DATABASE_NAME, {
        useNewConnection: true,
      });
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

    // Initialize AppConfig
    await AppConfigService.init();

    // Set US Dollar as default selected currency (if not already set)
    const existingCurrencyId = await AppConfigService.get(
      "selected_currency_id"
    );
    if (!existingCurrencyId) {
      const usd = await this.db.getFirstAsync<{ id: number }>(
        `SELECT id FROM ${TABLE_CURRENCIES} WHERE name = ?`,
        "US Dollar"
      );
      if (usd) {
        await AppConfigService.set("selected_currency_id", usd.id.toString());
      }
    }
  }

  static async getAll(): Promise<Currency[]> {
    return await this.db.getAllAsync<Currency>(
      `SELECT * FROM ${TABLE_CURRENCIES} ORDER BY ${COL_NAME}`
    );
  }

  static async setCurrency(currencyId: number): Promise<void> {
    await AppConfigService.set("selected_currency_id", currencyId.toString());
  }

  static async getSelectedCurrency(): Promise<Currency | null> {
    const selectedId = await AppConfigService.get("selected_currency_id");
    if (!selectedId) return null;

    const currency = await this.db.getFirstAsync<Currency>(
      `SELECT * FROM ${TABLE_CURRENCIES} WHERE id = ?`,
      Number(selectedId)
    );
    return currency ?? null;
  }

  static async add(
    currency: Omit<Currency, "id" | "created_at">
  ): Promise<number> {
    try {
      const result = await this.db.runAsync(
        `INSERT INTO ${TABLE_CURRENCIES} (${COL_NAME}, ${COL_SYMBOL}, ${COL_CREATED_AT})
       VALUES (?, ?, datetime('now'))`,
        currency.name,
        currency.symbol
      );
      return result.lastInsertRowId;
    } catch (error: any) {
      if (error.message?.includes("UNIQUE constraint failed")) {
        throw new Error(`Currency '${currency.name}' already exists.`);
      }
      throw error;
    }
  }
  static async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = undefined as unknown as SQLite.SQLiteDatabase;
    }
  }

  static async remove(id: number): Promise<void> {
    // Check if this is the currently selected currency
    const selectedId = await AppConfigService.get("selected_currency_id");

    // Delete the currency
    await this.db.runAsync(
      `DELETE FROM ${TABLE_CURRENCIES} WHERE ${COL_ID} = ?`,
      id
    );

    if (selectedId && Number(selectedId) === id) {
      const result = await this.db.getFirstAsync<{ total: number }>(
        `SELECT COUNT(*) as total FROM ${TABLE_CURRENCIES}`
      );

      if (!result || result.total <= 1) {
        throw new Error("At least one currency must remain.");
      }

      // If it was selected, pick the next available currency (by name order)
      const nextCurrency = await this.db.getFirstAsync<Currency>(
        `SELECT * FROM ${TABLE_CURRENCIES} ORDER BY ${COL_NAME} LIMIT 1`
      );

      if (nextCurrency) {
        await AppConfigService.set(
          "selected_currency_id",
          nextCurrency.id.toString()
        );
      } else {
        // No currencies left, clear selection
        await AppConfigService.set("selected_currency_id", "");
      }
    }
  }
}
