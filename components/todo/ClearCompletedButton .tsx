import { TodoService } from "@/services/TodoService";
import React, { useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

const ClearCompletedButton = ({ onClear }: { onClear?: () => void }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleConfirmDelete = async () => {
    try {
      await TodoService.removeCompleted();
      if (onClear) onClear();
    } catch (err) {
      console.error("Failed to remove completed todos", err);
    } finally {
      setModalVisible(false);
    }
  };

  return (
    <View className="">
      <TouchableOpacity className="" onPress={() => setModalVisible(true)}>
        <Text className="mt-3 me-4 mb-2 text-red-600 underline font-bold">
          Remove Marked Tasks
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-xl p-6 w-4/5 shadow-lg">
            <Text className="text-lg font-semibold text-center mb-3">
              Confirm Deletion
            </Text>
            <Text className="text-base text-gray-700 text-center mb-5">
              Are you sure you want to delete all completed tasks?
            </Text>
            <View className="flex-row justify-end space-x-3">
              <Pressable
                className="bg-gray-200 px-4 py-2 me-2 rounded-md"
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-gray-700 font-bold">Cancel</Text>
              </Pressable>
              <Pressable
                className="bg-red-600 px-4 py-2 rounded-md"
                onPress={handleConfirmDelete}
              >
                <Text className="text-white font-bold">Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ClearCompletedButton;
