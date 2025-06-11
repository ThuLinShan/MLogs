import MemoMain from "@/components/memo/MemoMain";
import { icons } from "@/constants/icons";
import { Link } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

const memo = () => {
  return (
    <View className="flex-1 bg-white">
      {/* Your existing content (like ScrollView, FlatList, etc.) */}
      <ScrollView
        className="flex-1  px-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          minHeight: "110%",
          paddingBottom: 20,
        }}
      >
        <View className="mt-10">
          <MemoMain />
        </View>
      </ScrollView>
      {/* Fixed-position Add Button */}
      <View
        className=""
        style={{
          position: "absolute",
          bottom: 122,
          right: 24,
          zIndex: 50,
        }}
      >
        <Link href={`/memo/add_memo`} asChild>
          <TouchableOpacity className="bg-white border-1 border-white-100 p-4 flex-row justify-center items-center w-[120px] rounded-full shadow-lg">
            <Text className="text-primary px-2">Add Item</Text>
            <Image source={icons.plus} className="size-5 mr-1 mt-0.5" />
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

export default memo;
