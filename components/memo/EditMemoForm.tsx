import { MemoService } from "@/services/MemoService";
import { Memo } from "@/types/types";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

type EditMemoFormProps = {
  id: number;
};

const EditMemoForm: React.FC<EditMemoFormProps> = ({ id }) => {
  const memoId = Number(id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [createdAt, setCreatedAt] = useState<number | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    const loadMemo = async () => {
      if (isNaN(memoId)) {
        Alert.alert("Invalid ID", "Memo ID is not valid.");
        navigation.goBack();
        return;
      }

      const memo = await MemoService.get(memoId);
      if (memo) {
        setTitle(memo.title);
        setDescription(memo.description);
        setCreatedAt(memo.created_at);
      } else {
        Alert.alert("Not Found", `Memo with ID ${memoId} not found.`);
        navigation.goBack();
      }
    };

    loadMemo();
  }, [memoId]);

  const handleUpdate = async () => {
    if (!title.trim()) {
      Alert.alert("Validation", "Title is required.");
      return;
    }

    if (createdAt === null) {
      Alert.alert("Error", "Missing creation timestamp.");
      return;
    }

    const updatedMemo: Memo = {
      id: memoId,
      title,
      description,
      created_at: createdAt,
    };

    await MemoService.update(updatedMemo);
    navigation.goBack();
  };

  return (
    <View className="pt-16 mt-4 px-4 flex-col justify-between h-[100%]">
      <View>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
          placeholderTextColor="#40798C"
          style={{ color: "#000000" }}
          className="rounded font-bold text-xl border-b border-secondary"
        />
        <View className="rounded">
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Description"
            placeholderTextColor="#40798C"
            multiline
            className=" text-lg"
            style={{ height: 600, textAlignVertical: "top", color: "#000000" }}
          />
        </View>
      </View>
      <View className="mb-8">
        <TouchableOpacity
          className="bg-primary py-3 rounded-md mt-2"
          onPress={handleUpdate}
        >
          <Text className="text-center text-white text-lg">Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditMemoForm;
