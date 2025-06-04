// src/services/MemoService.ts

import { Memo } from "@/types/types";
import * as SQLite from "expo-sqlite";

// ─── Constants ─────────────────────────────────────────────
const DATABASE_NAME = "expenses.db";

const TABLE_MEMOS = "memos";

const COL_ID = "id";
const COL_TITLE = "title";
const COL_DESCRIPTION = "description";
const COL_CREATED_AT = "created_at";

// ─── Memo Service ──────────────────────────────────────────
export class MemoService {
  private static db: SQLite.SQLiteDatabase;

  static async init() {
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    }

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS ${TABLE_MEMOS} (
        ${COL_ID} INTEGER PRIMARY KEY AUTOINCREMENT,
        ${COL_TITLE} TEXT NOT NULL,
        ${COL_DESCRIPTION} TEXT NOT NULL,
        ${COL_CREATED_AT} INTEGER NOT NULL
      );
    `);
  }

  static async getAll(): Promise<Memo[]> {
    return await this.db.getAllAsync<Memo>(
      `SELECT * FROM ${TABLE_MEMOS} ORDER BY ${COL_CREATED_AT} DESC`
    );
  }

  static async add(memo: Omit<Memo, "id" | "created_at">): Promise<number> {
    const nowEpochSeconds = Math.floor(Date.now() / 1000); // Epoch seconds
    const result = await this.db.runAsync(
      `INSERT INTO ${TABLE_MEMOS} (${COL_TITLE}, ${COL_DESCRIPTION}, ${COL_CREATED_AT})
       VALUES (?, ?, ?)`,
      memo.title,
      memo.description,
      nowEpochSeconds
    );
    return result.lastInsertRowId!;
  }

  static async remove(id: number): Promise<void> {
    await this.db.runAsync(
      `DELETE FROM ${TABLE_MEMOS} WHERE ${COL_ID} = ?`,
      id
    );
  }

  static async update(memo: Memo): Promise<void> {
    await this.db.runAsync(
      `UPDATE ${TABLE_MEMOS}
       SET ${COL_TITLE} = ?, ${COL_DESCRIPTION} = ?
       WHERE ${COL_ID} = ?`,
      memo.title,
      memo.description,
      memo.id
    );
  }
}
