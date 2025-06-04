import MemoList from "@/components/MemoList";
import React from "react";
import { ScrollView, View } from "react-native";

const memo = () => {
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
        <MemoList />
      </View>
    </ScrollView>
  );
};

export default memo;
