import { CurrencyService } from "@/services/CurrencyService";
import { ExpenseCategoryService } from "@/services/ExpenseCategoryService";
import { ExpenseItemService } from "@/services/ExpenseItemService";
import { Currency, ExpenseCategory, ExpenseItemType } from "@/types/types";
import { router, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import CurrencySelector from "../setting/CurrencySelector";
import CategorySelector from "./CategorySelector";

type EditExpenseFormProps = {
  expenseid: number;
};

const EditExpenseForm: React.FC<EditExpenseFormProps> = ({ expenseid }) => {
  const id = Number(expenseid); // Get expense ID from URL params
  const navigation = useNavigation();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<number | null>(
    null
  );
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

  useEffect(() => {
    fetchExistingExpense();
  }, [id]);

  const fetchExistingExpense = async () => {
    if (!id) return;

    const expense = await ExpenseItemService.getById(Number(id));
    if (!expense) return;

    setName(expense.name);
    setPrice(expense.price.toString());
    setQuantity(expense.quantity.toString());
    setSelectedCategoryId(expense.category_id);
    setSelectedCurrencyId(expense.currency_id);

    ExpenseCategoryService.init();
    CurrencyService.init();
    const fetchedCategories = await ExpenseCategoryService.getAll();
    const fetchedCurrencies = await CurrencyService.getAll();
    setCategories(fetchedCategories);
    setCurrencies(fetchedCurrencies);
  };

  const updateExpense = async () => {
    if (!name || !price || !selectedCategoryId || !selectedCurrencyId) return;

    const updatedExpense: ExpenseItemType = {
      id: Number(id), // Ensure it's a number
      name,
      price: parseFloat(price),
      quantity: parseInt(quantity) || 1,
      category_id: selectedCategoryId,
      currency_id: selectedCurrencyId!,
      total: parseFloat(price) * (parseInt(quantity) || 1), // ✅ Include `total` field
      created_at: Date.now() / 1000, // ✅ Ensure `created_at` exists
    };

    await ExpenseItemService.update(updatedExpense);
    console.log("Expense updated successfully");
    navigation.goBack();
  };

  return (
    <View className="py-12 px-4">
      <View className="flex-row justify-between">
        <Text className="text-light_green font-bold text-2xl my-5 ms-5">
          Edit Expense
        </Text>
        <TouchableOpacity
          className="flex flex-row items-center justify-center z-50"
          onPress={router.back}
        >
          <Text className="text-white underline me-2 font-semibold text-base">
            Back
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        className="rounded-lg text-lg"
        placeholder="Name"
        placeholderTextColor="#CFE0C3"
        value={name}
        onChangeText={setName}
        style={{
          borderWidth: 1,
          borderColor: "#CFE0C3",
          marginBottom: 10,
          padding: 8,
          color: "white",
        }}
      />

      <TextInput
        className="rounded-lg text-lg"
        placeholder="Price"
        placeholderTextColor="#CFE0C3"
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
        style={{
          borderWidth: 1,
          borderColor: "#CFE0C3",
          marginBottom: 10,
          padding: 8,
          color: "white",
        }}
      />

      <Text className="text-light_green my-2">Quantity</Text>
      <TextInput
        className="rounded-lg text-lg"
        placeholder="Quantity"
        placeholderTextColor="#CFE0C3"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
        style={{
          borderWidth: 1,
          borderColor: "#CFE0C3",
          marginBottom: 10,
          padding: 8,
          color: "white",
        }}
      />

      <View className="flex-row my-2 align-middle items-center">
        <Text className="text-light_green me-2">Category: </Text>
        <TouchableOpacity onPress={() => setCategoryModalVisible(true)}>
          {selectedCategoryId && (
            <Text
              className="underline text-action"
              style={{ marginVertical: 5 }}
            >
              {categories.find((c) => c.id === selectedCategoryId)?.name}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className="bg-action py-3 rounded-md mt-6"
        onPress={updateExpense}
      >
        <Text className="text-center text-white text-lg">Update Expense</Text>
      </TouchableOpacity>

      <Modal
        visible={categoryModalVisible}
        animationType="slide"
        transparent={true}
      >
        <CategorySelector
          onSelect={(category) => setSelectedCategoryId(category.id!)}
          onClose={() => setCategoryModalVisible(false)}
        />
      </Modal>

      <Modal
        transparent={true}
        visible={currencyModalVisible}
        animationType="slide"
      >
        <CurrencySelector
          onSelect={(currency) => setSelectedCurrencyId(currency.id!)}
          onClose={() => setCurrencyModalVisible(false)}
        />
      </Modal>
    </View>
  );
};

export default EditExpenseForm;
