// src/services/AppConfigService.ts

import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";
// ─── Constants ─────────────────────────────────────────────
const DATABASE_NAME = "expenses.db";
const TABLE_APP_CONFIG = "app_config";

// ─── AppConfig Service ─────────────────────────────────────
export class AppConfigService {
  private static db: SQLite.SQLiteDatabase;
  static async ensureDbReady() {
    if (!this.db) {
      console.log(
        "AppConfigService: Database is not initialized, initializing..."
      );
      await this.init();
    }
    console.log("AppConfigService: Database is ready");
  }

  static async appInit() {
    const retries = 5;
    const delay = 500; // milliseconds
    let db: SQLite.SQLiteDatabase | undefined;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        if (!db) {
          db = await SQLite.openDatabaseAsync("expenses.db", {
            useNewConnection: true,
          });
        }

        await db.runAsync("BEGIN TRANSACTION"); // Start transaction

        await db.execAsync(`
        CREATE TABLE IF NOT EXISTS app_config (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          value TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS currencies (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          symbol TEXT NOT NULL,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS expense_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          price REAL NOT NULL,
          quantity INTEGER NOT NULL,
          category_id INTEGER NOT NULL,
          currency_id INTEGER NOT NULL,
          created_at TEXT NOT NULL,
          FOREIGN KEY (category_id) REFERENCES categories(id),
          FOREIGN KEY (currency_id) REFERENCES currencies(id)
        );

        CREATE TABLE IF NOT EXISTS todos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          created_at TEXT NOT NULL,
          completed INTEGER DEFAULT 0,
          deadline TEXT
        );

        CREATE TABLE IF NOT EXISTS memos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
      `);

        await db.runAsync("COMMIT"); // Commit the transaction
        console.log("All tables created successfully.");
        return db; // Exit loop on success
      } catch (error) {
        if (db) {
          await db.runAsync("ROLLBACK"); // Rollback only if db exists
        }
        console.error(`appInit() failed (Attempt ${attempt}): `, error);

        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, delay)); // Wait before retrying
        } else {
          throw new Error(
            "Database initialization failed after multiple retries."
          );
        }
      }
    }
  }

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
    try {
      await this.ensureDbReady(); // Ensure DB is ready before query
      const result = await this.db.getFirstAsync<{ value: string }>(
        `SELECT value FROM ${TABLE_APP_CONFIG} WHERE key = ?`,
        key
      );
      return result?.value ?? null;
    } catch (error) {
      console.error(`Error fetching key "${key}":`, error);
      return null;
    }
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

  static async exportDatabase(): Promise<void> {
    try {
      const tables = [
        "app_config",
        "currencies",
        "categories",
        "expense_items",
        "memos",
        "todos",
      ];
      const dbData: Record<string, any[]> = {};

      for (const table of tables) {
        const result = await this.db.getAllAsync(`SELECT * FROM ${table}`);
        dbData[table] = result;
      }

      const jsonString = JSON.stringify(dbData, null, 2);
      const fileUri = `${FileSystem.documentDirectory}backup.json`;

      await FileSystem.writeAsStringAsync(fileUri, jsonString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      console.log("Export successful. File saved at:", fileUri);
    } catch (error) {
      console.error("Export failed:", error);
    }
  }

  static async importDatabase(fileUri: string): Promise<void> {
    try {
      const jsonString = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      const dbData = JSON.parse(jsonString);

      for (const [table, rows] of Object.entries(dbData)) {
        if (Array.isArray(rows)) {
          const typedRows = rows as Array<{ key: string; value: string }>;

          for (const row of typedRows) {
            await this.db.runAsync(
              `INSERT INTO ${table} (key, value) VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
              row.key,
              row.value
            );
          }
        }
      }

      console.log("Import successful.");
    } catch (error) {
      console.error("Import failed:", error);
    }
  }
}
