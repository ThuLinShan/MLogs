import { icons } from "@/constants/icons";
import { ExpenseItemService } from "@/services/ExpenseItemService"; // adjust the path if needed
import { ExpenseItemType } from "@/types/types";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

type ExpenseItemProps = {
  item: ExpenseItemType;
  onDelete: (id: number) => void;
  onQuantityChange: () => void; // callback to reload data
  categoryName?: string;
  currencyName?: string;
  currencySymbol?: string;
};

const ExpenseItem: React.FC<ExpenseItemProps> = ({
  item,
  onDelete,
  onQuantityChange,
  categoryName,
  currencySymbol,
}) => {
  const handleIncrement = async () => {
    await ExpenseItemService.incrementQuantity(item.id!);
    onQuantityChange(); // ✅ this triggers parent to re-fetch and update
  };

  const handleDecrement = async () => {
    await ExpenseItemService.decrementQuantity(item.id!);
    onQuantityChange(); // ✅ this triggers parent to re-fetch and update
  };

  return (
    <View className="p-4 flex-row flex-wrap justify-between align-middle border-1 border-b border-dark">
      {/* Name and Price Section (40%) */}
      <View
        className="flex-col items-start justify-center content-center"
        style={{ width: "40%" }}
      >
        <Text className="text-light_green text-lg flex-shrink">
          {item.name}
        </Text>
        <View className="flex-row">
          {/* <Text className="text-white text-sm flex-shrink w-[30%] bg-blue_green rounded text-center items-center align-middle content-center me-2">
            {categoryName}{" "}
          </Text> */}
          <Text className="text-action">
            {" ("}
            {item.price}
            {currencySymbol}
            {")"}
          </Text>
        </View>
      </View>

      {/* Quantity with + / - buttons (20%) */}
      <View className="flex-row items-center justify-center bg-action h-[35px] mt-2 rounded-md">
        <TouchableOpacity className="px-2" onPress={handleDecrement}>
          <Text className="text-dark_sec text-2xl font-bold">−</Text>
        </TouchableOpacity>
        <Text className="text-white mx-2">x{item.quantity}</Text>
        <TouchableOpacity className="px-2" onPress={handleIncrement}>
          <Text className="text-dark_sec text-2xl font-bold">+</Text>
        </TouchableOpacity>
      </View>

      {/* Total (25%) */}
      <View className="w-2/12 overflow-hidden justify-center">
        <Text className="text-white">
          {item.total}
          {currencySymbol}
        </Text>
      </View>

      {/* Delete Button (15%) */}
      <View className="w-25  flex-col justify-between">
        <TouchableOpacity
          className="bg-dark  border-action rounded-lg p-1"
          onPress={() => onDelete(item.id!)}
        >
          <Image source={icons.trash} className="size-8" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ExpenseItem;
