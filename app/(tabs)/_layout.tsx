import { icons } from "@/constants/icons";
import { Tabs } from "expo-router";
import React from "react";
import { Image, Text, View } from "react-native";

const TabIcon = ({ focused, icon, title }: any) => {
  if (focused) {
    return (
      <View className="w-[115px] flex flex-row flex-1 min-h-16 mt-4 justify-center items-center rounded-full overflow-hidden bg-light_green ">
        <Image source={icon} tintColor="" className="size-5" />
        <Text className="text-primary text-base ml-2">{title}</Text>
      </View>
    );
  } else {
    return (
      <View className="size-full justify-center items-center mt-4 rounded-full">
        <Image source={icon} tintColor="" className="size-5"></Image>
      </View>
    );
  }
};

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderRadius: 50,
          marginHorizontal: 10,
          marginBottom: 36,
          height: 50,
          position: "absolute",
          overflow: "hidden",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.home} title="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="expense"
        options={{
          title: "Expense",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.dollar} title="Expense" />
          ),
        }}
      />
      <Tabs.Screen
        name="todo"
        options={{
          title: "To Do",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.checked} title="To Do" />
          ),
        }}
      />
      <Tabs.Screen
        name="memo"
        options={{
          title: "Memo",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.note} title="Memo" />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;
