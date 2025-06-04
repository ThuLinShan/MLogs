// src/components/TodoList.tsx
import { TodoItemType } from "@/types/types";
import React, { useEffect, useState } from "react";
import { Button, FlatList, TextInput, View } from "react-native";
import { TodoService } from "../services/TodoService";
import CustomDateTimePicker from "./CustomDateTimePicker";
import TodoItem from "./TodoItem";

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<TodoItemType[]>([]);
  const [title, setTitle] = useState("");
  const [remindAtDate, setRemindAtDate] = useState<Date | null>(null);

  useEffect(() => {
    const initializeDatabase = async () => {
      await TodoService.init();
      const fetchedTodos = await TodoService.getAll();
      setTodos(fetchedTodos);
    };
    initializeDatabase();
  }, []);

  const handleAdd = async () => {
    if (title) {
      const remindAtISO = remindAtDate ? remindAtDate.toISOString() : null;
      const newTodo = {
        title,
        completed: false,
        description: "", // you no longer care about this
        remind_at: remindAtISO,
      };
      console.log("TodoList.handleAdd() called with:", newTodo);
      const id = await TodoService.add(newTodo);
      setTodos([
        {
          id,
          title,
          description: "",
          completed: false,
          remind_at: remindAtISO,
          created_at: new Date().toISOString(),
        },
        ...todos,
      ]);
      setTitle("");
      setRemindAtDate(null);
    }
  };

  const handleDelete = async (id: number) => {
    await TodoService.remove(id);
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const handleToggleComplete = async (id: number, current: boolean) => {
    await TodoService.toggleComplete(id, !current);
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !current } : todo
      )
    );
  };

  return (
    <View className="p-4">
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        className="border border-gray-300 rounded p-2 mb-2"
      />

      <CustomDateTimePicker
        label="Remind At"
        date={remindAtDate}
        onConfirm={setRemindAtDate}
      />

      <Button title="Add Todo" onPress={handleAdd} />

      <View className="bg-light_green p-4 mt-3 rounded">
        <FlatList
          data={todos}
          renderItem={({ item }) => (
            <TodoItem
              item={item}
              onDelete={handleDelete}
              onToggleComplete={handleToggleComplete}
            />
          )}
          keyExtractor={(item) => item.id!.toString()}
          scrollEnabled={false}
        />
      </View>
    </View>
  );
};

export default TodoList;
