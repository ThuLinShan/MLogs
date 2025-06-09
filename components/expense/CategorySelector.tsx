// src/components/CategorySelector.tsx

import { ExpenseCategory } from "@/types/types";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ExpenseCategoryService } from "../../services/ExpenseCategoryService";

type CategorySelectorProps = {
  onSelect: (category: ExpenseCategory) => void;
  onClose: () => void;
};

const CategorySelector: React.FC<CategorySelectorProps> = ({
  onSelect,
  onClose,
}) => {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      await ExpenseCategoryService.init();
      const data = await ExpenseCategoryService.getAll();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (newCategoryName.trim() === "") return;

    const id = await ExpenseCategoryService.add(newCategoryName);

    setCategories([...categories, { id, name: newCategoryName }]);
    setNewCategoryName("");
  };

  const handleDeleteCategory = async (id: number) => {
    await ExpenseCategoryService.remove(id);
    setCategories(categories.filter((cat) => cat.id !== id));
  };

  return (
    <View
      className="flex-1 justify-center items-center drop-shadow-lg"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <View className="w-full max-h-[80%] bg-dark_sec p-6 rounded-lg ">
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id!.toString()}
          renderItem={({ item }) => (
            <View className="flex-row justify-between items-center mb-2">
              <Text
                className="text-white text-lg"
                onPress={() => {
                  onSelect(item);
                  console.log("CategorySelector.onSelect(): id: ", item.id);
                  onClose(); // Close modal after select
                }}
              >
                {item.name}
              </Text>
              <TouchableOpacity
                className=""
                onPress={() => handleDeleteCategory(item.id!)}
              >
                <Text className="text-action-500 underline">Delete</Text>
              </TouchableOpacity>
            </View>
          )}
          className="mb-4"
          style={{ maxHeight: 200 }} // optional: restrict FlatList height
        />

        <TextInput
          placeholder="New Category"
          value={newCategoryName}
          onChangeText={setNewCategoryName}
          className="bg-white text-black rounded px-3 py-2 mb-8"
        />
        <TouchableOpacity
          className="bg-primary mb-4 items-center py-2 rounded-md"
          onPress={handleAddCategory}
        >
          <Text className="text-white">Add Category</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-primary mb-4 items-center py-2 rounded-md"
          onPress={onClose}
        >
          <Text className="text-white">Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CategorySelector;
