import { icons } from "@/constants/icons";
import { ExpenseItemService } from "@/services/ExpenseItemService"; // adjust the path if needed
import { ExpenseItemType } from "@/types/types";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, Modal, Text, TouchableOpacity, View } from "react-native";

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
  const [modalVisible, setModalVisible] = useState(false);

  const handleIncrement = async () => {
    await ExpenseItemService.incrementQuantity(item.id!);
    onQuantityChange();
  };

  const handleDecrement = async () => {
    await ExpenseItemService.decrementQuantity(item.id!);
    onQuantityChange();
  };
  const handleNavigateToEdit = () => {
    router.push({
      pathname: "/expense/[id]",
      params: { id: item.id.toString() },
    });
  };

  return (
    <View className="p-4 flex-row flex-wrap justify-between align-middle border-1 border-b border-dark">
      {/* Name and Price Section */}
      <View
        className="flex-col items-start justify-center content-center"
        style={{ width: "40%" }}
      >
        <Text className="text-light_green text-lg flex-shrink">
          {item.name}
        </Text>
        <View className="flex-row">
          <Text className="text-white text-sm flex-shrink w-[30%] bg-blue_green rounded text-center items-center align-middle content-center me-2">
            {categoryName}{" "}
          </Text>
          <Text className="text-action">
            {" ("}
            {item.price}
            {currencySymbol}
            {")"}
          </Text>
        </View>
      </View>

      {/* Quantity Section */}
      <View className="flex-row items-center justify-center bg-action h-[35px] mt-2 rounded-md">
        <TouchableOpacity className="px-2" onPress={handleDecrement}>
          <Text className="text-dark_sec text-2xl font-bold">−</Text>
        </TouchableOpacity>
        <Text className="text-white mx-2">x{item.quantity}</Text>
        <TouchableOpacity className="px-2" onPress={handleIncrement}>
          <Text className="text-dark_sec text-2xl font-bold">+</Text>
        </TouchableOpacity>
      </View>

      {/* Total */}
      <View className="w-2/12 overflow-hidden justify-center">
        <Text className="text-white">
          {item.total}
          {currencySymbol}
        </Text>
      </View>

      {/* More Button */}
      <View className="w-25 flex-col justify-between">
        <TouchableOpacity
          className="bg-dark_sec py-2"
          onPress={() => setModalVisible(true)}
        >
          <Image source={icons.more} className="size-8" />
        </TouchableOpacity>
      </View>

      {/* Modal Popup */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="absolute top-1/3 left-1/4 w-1/2 bg-dark border-action rounded-lg p-4">
          {/* Link-based navigation instead of function call */}
          <TouchableOpacity
            className="p-2 rounded"
            onPress={() => {
              handleNavigateToEdit();
              setModalVisible(false);
            }}
          >
            <Text className="text-white text-center">Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="p-2 bg-red mt-2 rounded"
            onPress={() => {
              onDelete(item.id!);
              setModalVisible(false);
            }}
          >
            <Text className="text-white text-center">Delete</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="p-2 mt-2 bg-gray rounded"
            onPress={() => setModalVisible(false)}
          >
            <Text className="text-white text-center">Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default ExpenseItem;
