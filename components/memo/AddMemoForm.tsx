import { MemoService } from "@/services/MemoService";
import { router, useNavigation } from "expo-router";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

const AddMemoForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const navigation = useNavigation();

  const handleAdd = async () => {
    const memoTitle = title?.trim() ?? "";
    const memoDescription = description?.trim() ?? "";

    if (!memoDescription) {
      console.warn("Description is required.");
      return;
    }

    const newMemo = {
      title: memoTitle,
      description: memoDescription,
    };

    await MemoService.add(newMemo);

    setTitle("");
    setDescription("");
    navigation.goBack();
  };

  return (
    <View className="pt-16 mt-4 px-4 flex-col justify-between h-[100%]">
      <View>
        <TextInput
          value={title}
          placeholderTextColor="#40798C"
          onChangeText={setTitle}
          placeholder="Title"
          className="rounded font-bold text-xl"
          style={{ color: "#000000" }}
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
      <View className="mb-16">
        <TouchableOpacity
          className="bg-primary py-3 rounded-md mt-2"
          onPress={handleAdd}
        >
          <Text className="text-center text-white text-lg">Save</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="border-2 border-primary rounded-lg my-4  py-3.5 flex flex-row items-center justify-center z-50"
          onPress={router.back}
        >
          <Text className="text-primary font-semibold text-base">Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddMemoForm;
