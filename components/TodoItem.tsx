// src/components/TodoItem.tsx
import { TodoItemType } from "@/types/types";
import React from "react";
import { Button, Text, View } from "react-native";

type TodoItemProps = {
  item: TodoItemType;
  onDelete: (id: number) => void;
  onToggleComplete: (id: number, current: boolean) => void;
};

const TodoItem: React.FC<TodoItemProps> = ({
  item,
  onDelete,
  onToggleComplete,
}) => (
  <View className="pb-10 border-b border-gray-300 mb-2">
    <Text
      className={`font-bold text-lg ${
        item.completed ? "line-through text-gray-400" : ""
      }`}
    >
      {item.title}
    </Text>
    {item.remind_at && (
      <Text className="text-sm text-blue-500">
        🔔 Remind at: {item.remind_at}
      </Text>
    )}
    <Text className="text-xs text-gray-500 mt-1">
      Created at: {item.created_at}
    </Text>

    <View className="flex-row gap-2 mt-2">
      <Button
        title={item.completed ? "Mark Incomplete" : "Mark Complete"}
        onPress={() => onToggleComplete(item.id!, item.completed)}
      />
      <Button title="Delete" color="red" onPress={() => onDelete(item.id!)} />
    </View>
  </View>
);

export default TodoItem;
