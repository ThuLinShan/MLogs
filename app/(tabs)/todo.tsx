import TodoMain from "@/components/todo/TodoMain";
import React from "react";
import { View } from "react-native";

const todo = () => {
  return (
    <View className="flex-1 h-max" style={{ height: "100%" }}>
      <TodoMain />
    </View>
  );
};

export default todo;
