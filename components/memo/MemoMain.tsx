// src/components/MemoList.tsx
import { Memo } from "@/types/types";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { MemoService } from "../../services/MemoService";
import MemoItem from "./MemoItem";

const MemoMain: React.FC = () => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [dbReady, setDbReady] = useState(false);

  const fetchMemos = useCallback(async () => {
    try {
      const data = await MemoService.getAll();
      setMemos(data);
    } catch (err) {
      console.error("Memo: Failed to fetch memos", err);
    }
  }, []);

  useEffect(() => {
    const initializeDatabase = async () => {
      await MemoService.init();
      setDbReady(true);
      await fetchMemos();
    };
    initializeDatabase();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!dbReady) return; // Skip if DB not ready
      fetchMemos();
    }, [dbReady, fetchMemos])
  );

  const handleDelete = async (id: number) => {
    await MemoService.remove(id);
    setMemos(memos.filter((memo) => memo.id !== id));
  };

  return (
    <View className="">
      <View className="p-4 mt-3 rounded">
        <FlatList
          data={memos}
          renderItem={({ item }) => (
            <MemoItem item={item} onDelete={handleDelete} />
          )}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text className="text-center text-gray-500 mt-6">Add a memo</Text>
          }
        />
      </View>
    </View>
  );
};

export default MemoMain;
