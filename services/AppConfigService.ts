// src/services/AppConfigService.ts

import * as SQLite from "expo-sqlite";

// ─── Constants ─────────────────────────────────────────────
const DATABASE_NAME = "expenses.db";
const TABLE_APP_CONFIG = "app_config";

// ─── AppConfig Service ─────────────────────────────────────
export class AppConfigService {
  private static db: SQLite.SQLiteDatabase;

  static async init() {
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync(DATABASE_NAME, {
        useNewConnection: true,
      });
    }

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS ${TABLE_APP_CONFIG} (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
  }

  static async set(key: string, value: string): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO ${TABLE_APP_CONFIG} (key, value)
       VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      key,
      value
    );
  }

  static async get(key: string): Promise<string | null> {
    const result = await this.db.getFirstAsync<{ value: string }>(
      `SELECT value FROM ${TABLE_APP_CONFIG} WHERE key = ?`,
      key
    );
    return result?.value ?? null;
  }

  static async remove(key: string): Promise<void> {
    await this.db.runAsync(
      `DELETE FROM ${TABLE_APP_CONFIG} WHERE key = ?`,
      key
    );
  }

  static async close(): Promise<void> {
    if (this.db) {
      try {
        await this.db.closeAsync();
        console.log("AppConfigService: DB closed");
      } catch (err) {
        console.error("AppConfigService.close() failed:", err);
      } finally {
        this.db = undefined!;
      }
    }
  }
}
