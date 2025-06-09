import { icons } from "@/constants/icons";
import { TodoItemType } from "@/types/types";
import { format, isToday } from "date-fns";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

type HomeTodoItemProps = {
  item: TodoItemType;
  onToggleComplete: (id: number, current: boolean) => void;
};

const HomeTodoItem: React.FC<HomeTodoItemProps> = ({
  item,
  onToggleComplete,
}) => (
  <View
    className={`py-4 px-8 border-b border-primary flex-row flex-wrap justify-between align-middle items-center rounded-lg mb-2 ${
      item.completed ? "bg-dark" : ""
    }`}
  >
    <View
      className="flex flex-wrap flex-col items-start "
      style={{ width: "75%" }}
    >
      <Text
        className={`font-normal text-lg text-white`}
        style={{ maxWidth: "100%" }}
        numberOfLines={0}
      >
        {item.title}
      </Text>
      {item.deadline != null &&
        !isNaN(item.deadline) &&
        (() => {
          const remindDate = new Date(item.deadline);

          // Check if remindDate is valid
          if (isNaN(remindDate.getTime())) {
            // Invalid date, don't render anything or handle fallback
            return null;
          }

          const displayTime = isToday(remindDate)
            ? format(remindDate, "HH:mm")
            : format(remindDate, "yyyy/MM/dd HH:mm");

          const now = new Date();
          const isOverdue = remindDate < now && !item.completed;

          return (
            <Text
              className={`text-sm ms-5 pt-1 ${
                isOverdue ? "text-red-500" : "text-blue_green"
              }`}
            >
              Do at: {displayTime}
            </Text>
          );
        })()}
    </View>
    <View className="w-25 flex-col justify-between">
      <TouchableOpacity
        className="relative border-action rounded-lg p-1"
        onPress={() => onToggleComplete(item.id!, item.completed)}
      >
        <View className="p-3 border border-action rounded-full" />
        {item.completed && (
          <View className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-[20%]">
            <Image source={icons.mark} className="size-8" />
          </View>
        )}
      </TouchableOpacity>
    </View>
  </View>
);

export default HomeTodoItem;
