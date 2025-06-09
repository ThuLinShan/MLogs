import EditMemoForm from "@/components/memo/EditMemoForm";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const EditMemoPage = () => {
  const { id } = useLocalSearchParams();

  if (!id) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">No memo ID provided</Text>
      </View>
    );
  }

  const memoId = parseInt(Array.isArray(id) ? id[0] : id, 10);

  return (
    <View className="flex-1 p-4 bg-white">
      <EditMemoForm id={memoId} />
    </View>
  );
};

export default EditMemoPage;
