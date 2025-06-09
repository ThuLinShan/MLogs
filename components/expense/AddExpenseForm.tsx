import { CurrencyService } from "@/services/CurrencyService";
import { ExpenseCategoryService } from "@/services/ExpenseCategoryService";
import { ExpenseItemService } from "@/services/ExpenseItemService";
import { Currency, ExpenseCategory } from "@/types/types";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import CurrencySelector from "../setting/CurrencySelector";
import CategorySelector from "./CategorySelector";

const AddExpenseForm: React.FC = () => {
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

  const navigation = useNavigation();

  const fetchInitialData = async () => {
    console.log("Expense.tsx.fetchInitialData() is initiated");

    const fetchedCategories = await ExpenseCategoryService.getAll();
    const fetchedCurrencies = await CurrencyService.getAll();
    const selectedCurrency = await CurrencyService.getSelectedCurrency();

    setCategories(fetchedCategories);
    setCurrencies(fetchedCurrencies);

    // Set default selected category
    if (fetchedCategories.length > 0) {
      setSelectedCategoryId(fetchedCategories[0].id!);
    }

    // Set selected currency from app config if exists
    if (selectedCurrency) {
      setSelectedCurrencyId(selectedCurrency.id);
    } else if (fetchedCurrencies.length > 0) {
      // fallback to first currency
      setSelectedCurrencyId(fetchedCurrencies[0].id!);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log("Expense screen focused – reloading items.");
      fetchInitialData();
      return () => {}; // optional cleanup
    }, [])
  );

  const loadCategories = async () => {
    await ExpenseCategoryService.init();
    const cats = await ExpenseCategoryService.getAll();
    setCategories(cats);
  };

  const loadCurrencies = async () => {
    await CurrencyService.init();
    const data = await CurrencyService.getAll();
    setCurrencies(data);
  };
  const addItem = async () => {
    console.log("expense.addItem() is invoked:");
    console.log(
      "parameters: ",
      name,
      price,
      selectedCategoryId,
      selectedCurrencyId
    );

    if (!name || !price || !selectedCategoryId || !selectedCurrencyId) return;

    await ExpenseItemService.add({
      name,
      price: parseFloat(price),
      quantity: parseInt(quantity) || 1,
      category_id: selectedCategoryId,
      currency_id: selectedCurrencyId!, // ← NEW
      total: parseFloat(price) * (parseInt(quantity) || 1),
    });

    setName("");
    setPrice("");
    setQuantity("1");
    console.log("Add Expense is successful");
    navigation.goBack(); // ✅ Go back to previous screen
  };

  useEffect(() => {
    loadCategories();
    loadCurrencies();
  }, []);
  return (
    <View className="py-12 px-4 ">
      <Text className="text-light_green font-bold text-2xl my-5 ms-5 ">
        Add Expense
      </Text>
      <TextInput
        className="rounded-lg"
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
        className="rounded-lg"
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
      <Text className="text-light_green  my-2">Quantity</Text>
      <TextInput
        className="rounded-lg"
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
      {/* {selectedCurrencyId && (
        <Text
          className="text-light_green font-bold"
          style={{ marginVertical: 5 }}
        >
          Currency: {currencies.find((c) => c.id === selectedCurrencyId)?.name}
        </Text>
      )} */}

      <Text className="text-light_green">Category</Text>
      <TouchableOpacity
        className="bg-light_green py-3 rounded-md mt-2"
        onPress={() => setCategoryModalVisible(true)}
      >
        <Text className="text-center text-dark text-lg">
          {selectedCategoryId && (
            <Text className="text-dark" style={{ marginVertical: 5 }}>
              {categories.find((c) => c.id === selectedCategoryId)?.name}
            </Text>
          )}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-action py-3 rounded-md mt-6"
        onPress={addItem}
      >
        <Text className="text-center text-white text-lg">Add Expense</Text>
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
export default AddExpenseForm;
