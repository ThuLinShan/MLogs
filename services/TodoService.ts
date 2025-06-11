// services/TodoService.ts
import { TodoItemType } from "@/types/types";
import * as SQLite from "expo-sqlite";

const DATABASE_NAME = "expenses.db";
const TABLE_TODOS = "todos";

const COL_ID = "id";
const COL_TITLE = "title";
const COL_DESCRIPTION = "description";
const COL_CREATED_AT = "created_at";
const COL_COMPLETED = "completed";
const COL_DEADLINE = "deadline";

let db: SQLite.SQLiteDatabase;

const ensureDbReady = () => {
  if (!db) throw new Error("TodoService: Database not initialized");
  console.log("TodoService: Database is ready");
};

export const TodoService = {
  async init(): Promise<void> {
    if (db) return;
    try {
      db = await SQLite.openDatabaseAsync(DATABASE_NAME, {
        useNewConnection: true,
      });
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS ${TABLE_TODOS} (
          ${COL_ID} INTEGER PRIMARY KEY AUTOINCREMENT,
          ${COL_TITLE} TEXT NOT NULL,
          ${COL_DESCRIPTION} TEXT,
          ${COL_CREATED_AT} TEXT NOT NULL,
          ${COL_COMPLETED} INTEGER NOT NULL DEFAULT 0,
          ${COL_DEADLINE} INTEGER
        );
      `);
      console.log("TodoService: Table ensured");
    } catch (error) {
      console.error("TodoService: Failed to open or initialize DB", error);
      throw new Error("TodoService DB initialization failed");
    }
  },

  async close(): Promise<void> {
    if (!db) return;
    try {
      await db.closeAsync();
      console.log("TodoService: DB closed");
    } catch (err) {
      console.error("TodoService.close() failed:", err);
    } finally {
      db = undefined!;
    }
  },
  async add(todo: Omit<TodoItemType, "id" | "created_at">): Promise<number> {
    ensureDbReady();
    const now = new Date().toISOString();
    try {
      const result = await db.runAsync(
        `INSERT INTO ${TABLE_TODOS} 
          (${COL_TITLE}, ${COL_DESCRIPTION}, ${COL_CREATED_AT}, ${COL_COMPLETED}, ${COL_DEADLINE})
         VALUES (?, ?, ?, ?, ?)`,
        todo.title,
        todo.description,
        now,
        todo.completed ? 1 : 0,
        todo.deadline ?? null
      );
      return result.lastInsertRowId!;
    } catch (err) {
      console.error("TodoService.add() failed:", err);
      return -1;
    }
  },

  async getCompletedCount(): Promise<number> {
    ensureDbReady();
    try {
      const result = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM ${TABLE_TODOS} WHERE ${COL_COMPLETED} = 1`
      );
      return result?.count ?? 0;
    } catch (err) {
      console.error("TodoService.getCompletedCount() failed:", err);
      return 0;
    }
  },

  async getTotalCount(): Promise<number> {
    ensureDbReady();
    try {
      const result = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM ${TABLE_TODOS}`
      );
      return result?.count ?? 0;
    } catch (err) {
      console.error("TodoService.getTotalCount() failed:", err);
      return 0;
    }
  },

  async getAll(): Promise<TodoItemType[]> {
    ensureDbReady();
    try {
      const raw = await db.getAllAsync<any>(
        `SELECT * FROM ${TABLE_TODOS}
         ORDER BY 
           CASE WHEN ${COL_DEADLINE} IS NULL THEN 1 ELSE 0 END,
           ${COL_DEADLINE} ASC,
           ${COL_CREATED_AT} ASC`
      );
      console.log("TodoService.getAll(): ", raw);
      return raw.map((row) => ({
        ...row,
        completed: !!row[COL_COMPLETED],
        deadline: row[COL_DEADLINE] ?? null,
      }));
    } catch (err) {
      console.error("TodoService.getAll() failed:", err);
      return [];
    }
  },

  async remove(id: number): Promise<void> {
    ensureDbReady();
    try {
      await db.runAsync(`DELETE FROM ${TABLE_TODOS} WHERE ${COL_ID} = ?`, id);
      console.log(`TodoService.remove() success: id=${id}`);
    } catch (err) {
      console.error("TodoService.remove() failed:", err);
    }
  },
  async removeCompleted(): Promise<void> {
    ensureDbReady();
    try {
      const result = await db.runAsync(
        `DELETE FROM ${TABLE_TODOS} WHERE ${COL_COMPLETED} = 1`
      );
      console.log(
        `TodoService.removeCompleted(): deleted ${result.changes} rows`
      );
    } catch (err) {
      console.error("TodoService.removeCompleted() failed:", err);
    }
  },

  async toggleComplete(id: number, completed: boolean): Promise<void> {
    ensureDbReady();
    try {
      await db.runAsync(
        `UPDATE ${TABLE_TODOS} SET ${COL_COMPLETED} = ? WHERE ${COL_ID} = ?`,
        completed ? 1 : 0,
        id
      );
      console.log(
        `TodoService.toggleComplete(): id=${id}, status=${completed}`
      );
    } catch (err) {
      console.error("TodoService.toggleComplete() failed:", err);
    }
  },

  async getTodaysTasksCount(): Promise<number> {
    ensureDbReady();
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const startEpoch = startOfDay.getTime();
      const endEpoch = endOfDay.getTime();

      const result = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count 
         FROM ${TABLE_TODOS} 
         WHERE ${COL_DEADLINE} IS NOT NULL 
           AND ${COL_DEADLINE} BETWEEN ? AND ?`,
        startEpoch,
        endEpoch
      );
      console.log(
        "TodoService.getTodaysTasksCount(): success",
        startEpoch,
        endEpoch,
        result
      );
      return result?.count ?? 0;
    } catch (err) {
      console.error("TodoService.getTodaysTasksCount() failed:", err);
      return 0;
    }
  },

  async getTodaysCompletedTasksCount(): Promise<number> {
    ensureDbReady();
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const startEpoch = startOfDay.getTime();
      const endEpoch = endOfDay.getTime();

      const result = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count 
         FROM ${TABLE_TODOS}
         WHERE ${COL_DEADLINE} IS NOT NULL 
           AND ${COL_DEADLINE} BETWEEN ? AND ?
           AND ${COL_COMPLETED} = 1`,
        startEpoch,
        endEpoch
      );
      return result?.count ?? 0;
    } catch (err) {
      console.error("TodoService.getTodaysCompletedTasksCount() failed:", err);
      return 0;
    }
  },
};
