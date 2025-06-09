// src/services/MemoService.ts

import { Memo } from "@/types/types";
import * as SQLite from "expo-sqlite";

const DATABASE_NAME = "expenses.db";
const TABLE_MEMOS = "memos";

const COL_ID = "id";
const COL_TITLE = "title";
const COL_DESCRIPTION = "description";
const COL_CREATED_AT = "created_at";

let db: SQLite.SQLiteDatabase;

const ensureDbReady = () => {
  if (!db) throw new Error("Database not initialized");
  console.log("MemoService.ensureDbReady(): database is ready");
};

export const MemoService = {
  async init(): Promise<void> {
    if (db) return;
    try {
      db = await SQLite.openDatabaseAsync(DATABASE_NAME, {
        useNewConnection: true,
      });
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS ${TABLE_MEMOS} (
          ${COL_ID} INTEGER PRIMARY KEY AUTOINCREMENT,
          ${COL_TITLE} TEXT NOT NULL,
          ${COL_DESCRIPTION} TEXT NOT NULL,
          ${COL_CREATED_AT} INTEGER NOT NULL
        );
      `);
    } catch (err) {
      console.error("MemoService initialization failed:", err);
    }
  },

  async close(): Promise<void> {
    if (!db) return;
    try {
      await db.closeAsync();
      console.log("MemoService: DB closed");
    } catch (err) {
      console.error("MemoService.close() failed:", err);
    } finally {
      db = undefined!;
    }
  },

  async get(id: number): Promise<Memo | null> {
    ensureDbReady();
    try {
      const memo = await db.getFirstAsync<Memo>(
        `SELECT * FROM ${TABLE_MEMOS} WHERE ${COL_ID} = ?`,
        id
      );
      return memo ?? null;
    } catch (err) {
      console.error("MemoService.get failed:", err);
      return null;
    }
  },

  async getAll(): Promise<Memo[]> {
    ensureDbReady();
    try {
      return await db.getAllAsync<Memo>(
        `SELECT * FROM ${TABLE_MEMOS} ORDER BY ${COL_CREATED_AT} DESC`
      );
    } catch (err) {
      console.error("MemoService.getAll failed:", err);
      return [];
    }
  },

  async add(memo: Omit<Memo, "id" | "created_at">): Promise<number> {
    ensureDbReady();
    try {
      const nowEpochSeconds = Math.floor(Date.now() / 1000);
      const result = await db.runAsync(
        `INSERT INTO ${TABLE_MEMOS} (${COL_TITLE}, ${COL_DESCRIPTION}, ${COL_CREATED_AT}) VALUES (?, ?, ?)`,
        memo.title,
        memo.description,
        nowEpochSeconds
      );
      return result.lastInsertRowId!;
    } catch (err) {
      console.error("MemoService.add failed:", err);
      return -1;
    }
  },

  async remove(id: number): Promise<void> {
    ensureDbReady();
    try {
      await db.runAsync(`DELETE FROM ${TABLE_MEMOS} WHERE ${COL_ID} = ?`, id);
    } catch (err) {
      console.error("MemoService.remove failed:", err);
    }
  },

  async update(memo: Memo): Promise<void> {
    ensureDbReady();
    try {
      await db.runAsync(
        `UPDATE ${TABLE_MEMOS} SET ${COL_TITLE} = ?, ${COL_DESCRIPTION} = ? WHERE ${COL_ID} = ?`,
        memo.title,
        memo.description,
        memo.id
      );
    } catch (err) {
      console.error("MemoService.update failed:", err);
    }
  },
};
