// src/components/MemoList.tsx
import { Memo } from "@/types/types";
import React, { useEffect, useState } from "react";
import { Button, FlatList, Text, TextInput, View } from "react-native";
import { MemoService } from "../services/MemoService";

const MemoList: React.FC = () => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const initializeDatabase = async () => {
      await MemoService.init();
      const fetchedMemos = await MemoService.getAll();
      setMemos(fetchedMemos);
    };
    initializeDatabase();
  }, []);

  const handleAdd = async () => {
    if (title.trim()) {
      const newMemo = {
        title,
        description,
      };
      const id = await MemoService.add(newMemo);
      const created_at = Math.floor(Date.now() / 1000); // Epoch seconds
      setMemos([
        {
          id,
          title,
          description,
          created_at,
        },
        ...memos,
      ]);
      setTitle("");
      setDescription("");
    }
  };

  const handleDelete = async (id: number) => {
    await MemoService.remove(id);
    setMemos(memos.filter((memo) => memo.id !== id));
  };

  return (
    <View className="">
      <View className="my-5">
        <Text className="text-primary font-bold">Memo</Text>
      </View>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        className="border border-gray-300 rounded p-2 mb-2"
      />

      <View className="border border-gray-300 rounded p-2 mb-2">
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Description"
          multiline
        />
      </View>

      <Button title="Add Memo" onPress={handleAdd} />

      <View className="bg-blue-100 p-4 mt-3 rounded">
        <FlatList
          data={memos}
          renderItem={({ item }) => (
            <View className="mb-3 border-b border-gray-300 pb-2">
              <Text className="text-lg font-bold text-gray-800">
                {item.title}
              </Text>
              <Text className="text-gray-600 mb-1">{item.description}</Text>
              <Text className="text-xs text-gray-500">
                Created At: {new Date(item.created_at * 1000).toLocaleString()}
              </Text>
              <Button title="Delete" onPress={() => handleDelete(item.id)} />
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />
      </View>
    </View>
  );
};

export default MemoList;
