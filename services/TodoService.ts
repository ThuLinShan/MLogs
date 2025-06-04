// services/TodoService.ts
import { TodoItemType } from "@/types/types";
import * as SQLite from "expo-sqlite";

// ─── Constants ─────────────────────────────────────────────
const DATABASE_NAME = "todo.db";

const TABLE_TODOS = "todos";

const COL_ID = "id";
const COL_TITLE = "title";
const COL_DESCRIPTION = "description";
const COL_CREATED_AT = "created_at";
const COL_COMPLETED = "completed";
const COL_REMIND_AT = "remind_at";

let db: SQLite.SQLiteDatabase;

// ─── Service ───────────────────────────────────────────────
export const TodoService = {
  async init(): Promise<void> {
    console.log("TodoService.init() is invoked");
    db = await SQLite.openDatabaseAsync(DATABASE_NAME);

    db.execSync(`
      CREATE TABLE IF NOT EXISTS ${TABLE_TODOS} (
        ${COL_ID} INTEGER PRIMARY KEY AUTOINCREMENT,
        ${COL_TITLE} TEXT NOT NULL,
        ${COL_DESCRIPTION} TEXT,
        ${COL_CREATED_AT} TEXT NOT NULL,
        ${COL_COMPLETED} INTEGER NOT NULL DEFAULT 0,
        ${COL_REMIND_AT} TEXT
      );
    `);

    console.log("TodoService.init() is successful");
  },

  async add(todo: Omit<TodoItemType, "id" | "created_at">): Promise<number> {
    console.log("TodoService.add() is invoked:", todo);

    if (!db) throw new Error("Database not initialized");

    const now = new Date().toISOString();

    const result = db.runSync(
      `INSERT INTO ${TABLE_TODOS} 
      (${COL_TITLE}, ${COL_DESCRIPTION}, ${COL_CREATED_AT}, ${COL_COMPLETED}, ${COL_REMIND_AT})
       VALUES (?, ?, ?, ?, ?)`,
      todo.title,
      todo.description,
      now,
      todo.completed ? 1 : 0,
      todo.remind_at ?? "NA"
    );
    console.log("TodoService.add() is successful");
    return result.lastInsertRowId!;
  },

  async getAll(): Promise<TodoItemType[]> {
    if (!db) throw new Error("Database not initialized");

    const raw = await db.getAllAsync<any>(
      `SELECT * FROM ${TABLE_TODOS} ORDER BY ${COL_ID} DESC`
    );

    return raw.map((row) => ({
      ...row,
      completed: !!row[COL_COMPLETED], // Convert 0/1 to boolean
      remind_at: row[COL_REMIND_AT] ?? null,
    }));
  },

  async remove(id: number): Promise<void> {
    if (!db) throw new Error("Database not initialized");
    await db.runAsync(`DELETE FROM ${TABLE_TODOS} WHERE ${COL_ID} = ?`, id);
  },

  async toggleComplete(id: number, completed: boolean): Promise<void> {
    if (!db) throw new Error("Database not initialized");
    await db.runAsync(
      `UPDATE todos SET completed = ? WHERE id = ?`,
      completed ? 1 : 0,
      id
    );
  },
};
