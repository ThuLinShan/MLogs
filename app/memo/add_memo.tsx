import AddMemoForm from "@/components/memo/AddMemoForm";
import React from "react";
import { View } from "react-native";

const AddMemo = () => {
  return (
    <>
      <View className="h-[100%]">
        <AddMemoForm />
      </View>
    </>
  );
};

export default AddMemo;
