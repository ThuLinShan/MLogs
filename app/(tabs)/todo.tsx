import TodoList from "@/components/TodoList";
import React from "react";
import { ScrollView, View } from "react-native";

const todo = () => {
  return (
    <ScrollView
      className="flex-1  px-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        minHeight: "110%",
        paddingBottom: 20,
      }}
    >
      <View className="mt-10">
        <TodoList />
      </View>
    </ScrollView>
  );
};

export default todo;
