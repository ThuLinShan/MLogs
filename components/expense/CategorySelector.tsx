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
    try {
      await ExpenseCategoryService.remove(id);
      setCategories(categories.filter((cat) => cat.id !== id));
    } catch (error) {
      // Handle the error (e.g., show alert for protected categories)
      console.error("Failed to delete category:", error);
      // You might want to show an alert or toast here
    }
  };

  const handleCategorySelect = (category: ExpenseCategory) => {
    onSelect(category);
    console.log("CategorySelector.onSelect(): id: ", category.id);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  const canDeleteCategory = (categoryName: string) => {
    return categoryName !== "None";
  };

  return (
    <View
      className="flex-1 justify-center items-center drop-shadow-lg"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <View className="w-full max-h-[80%] bg-dark_sec p-6 rounded-lg ">
        <TextInput
          placeholder="New Category"
          value={newCategoryName}
          placeholderTextColor="#40798C"
          onChangeText={setNewCategoryName}
          className="bg-white text-black rounded px-3 py-3 mb-2"
        />
        <TouchableOpacity
          className="bg-primary mb-8 items-center py-3 rounded-md"
          onPress={handleAddCategory}
        >
          <Text className="text-white">Add Category</Text>
        </TouchableOpacity>
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id!.toString()}
          renderItem={({ item }) => (
            <View className="flex-row justify-between items-center mb-4 pb-2 ">
              <Text
                className="text-white text-lg"
                onPress={() => handleCategorySelect(item)}
              >
                {item.name}
              </Text>
              {canDeleteCategory(item.name) && (
                <TouchableOpacity
                  className=""
                  onPress={() => handleDeleteCategory(item.id!)}
                >
                  <Text className="text-action-500 underline">Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          className="mb-4"
          style={{ maxHeight: 300 }} // optional: restrict FlatList height
        />

        <TouchableOpacity
          className="items-center py-3 rounded-md bg-dark"
          onPress={handleClose}
        >
          <Text className="text-white">Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CategorySelector;
