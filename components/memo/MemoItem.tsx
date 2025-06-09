import { icons } from "@/constants/icons";
import { Memo } from "@/types/types";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

type MemoItemProps = {
  item: Memo;
  onDelete: (id: number) => void;
};

const MemoItem: React.FC<MemoItemProps> = ({ item, onDelete }) => {
  const router = useRouter();

  const handleNavigateToEdit = () => {
    router.push({
      pathname: "/memo/[id]",
      params: { id: item.id.toString() },
    });
  };

  return (
    <View className="mb-2 border-b border-gray-300 pb-4 flex-row justify-between content-center">
      {/* Tappable Area (Title + Description) */}
      <TouchableOpacity
        style={{ width: "75%" }}
        onPress={handleNavigateToEdit}
        activeOpacity={0.7}
      >
        {item.title?.trim() ? (
          <Text className="text-dark-100 text-lg font-bold">{item.title}</Text>
        ) : null}

        <Text className="text-dark_sec-100">
          {item.description.split(/\s+/).length > 12
            ? item.description.split(/\s+/).slice(0, 12).join(" ") + "..."
            : item.description}
        </Text>
      </TouchableOpacity>

      {/* Trash Icon */}
      <View className="mt-4">
        <TouchableOpacity
          className="border-action rounded-lg p-1"
          onPress={() => onDelete(item.id!)}
        >
          <Image source={icons.trash} className="size-8" tintColor="#40798C" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MemoItem;
