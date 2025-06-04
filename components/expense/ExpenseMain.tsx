import ExpenseItemComponent from "@/components/ExpenseItem";
import { icons } from "@/constants/icons";
import { CurrencyService } from "@/services/CurrencyService";
import { ExpenseCategoryService } from "@/services/ExpenseCategoryService";
import { ExpenseItemService } from "@/services/ExpenseItemService";
import { Currency, ExpenseCategory, ExpenseItem } from "@/types/types";
import { useFocusEffect } from "@react-navigation/native";
import { format } from "date-fns";
import { Link } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const ExpenseMain: React.FC = () => {
  const [items, setItems] = useState<ExpenseItem[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [monthlyTotalExpense, setMonthlyTotalExpense] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const totalExpense = items.reduce((acc, item) => acc + item.total, 0);

  const getStartOfDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
  const getEndOfDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

  const fetchExpensesInRange = async (startEpoch: number, endEpoch: number) => {
    const data = await ExpenseItemService.fetchExpensesInRange(
      startEpoch,
      endEpoch
    );
    const enriched = data.map((item) => ({
      ...item,
      total: item.price * item.quantity,
    }));
    setItems(enriched);
  };

  const fetchMonthlyTotalExpense = async (date: Date) => {
    await ExpenseItemService.init();
    const total = await ExpenseItemService.getMonthlyTotalExpense(date);
    setMonthlyTotalExpense(total);
  };

  const handleDateConfirm = (date: Date) => {
    setSelectedDate(date);
    fetchMonthlyTotalExpense(date);

    const startEpoch = Math.floor(getStartOfDay(date).getTime() / 1000);
    const endEpoch = Math.floor(getEndOfDay(date).getTime() / 1000);

    fetchExpensesInRange(startEpoch, endEpoch);
    setDatePickerVisible(false);
  };

  const fetchExpensesForSelectedDate = async (date: Date) => {
    const startEpoch = Math.floor(getStartOfDay(date).getTime() / 1000);
    const endEpoch = Math.floor(getEndOfDay(date).getTime() / 1000);
    await fetchExpensesInRange(startEpoch, endEpoch);
  };

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

  const deleteItem = async (id: number) => {
    await ExpenseItemService.remove(id);
    await await fetchExpensesForSelectedDate(selectedDate);
  };

  useEffect(() => {
    (async () => {
      await ExpenseItemService.init();
      await loadCategories();
      await loadCurrencies();
      await fetchExpensesForSelectedDate(selectedDate);
      await fetchMonthlyTotalExpense(selectedDate);
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchExpensesForSelectedDate(selectedDate);
      return () => {};
    }, [selectedDate])
  );

  return (
    <View className="py-12 px-1">
      {/* Inlined ExpenseHeader content */}
      <View className="flex-row justify-between items-center p-5 rounded-xl border-b-4 border-r-2 border-dark">
        <View className="flex-col justify-center items-center">
          <Text className="text-white text-l font-thin">Monthly Total</Text>
          <Text className="text-white text-2xl font-bold">
            {monthlyTotalExpense.toFixed(2)} {currencies[0]?.symbol ?? ""}
          </Text>
        </View>
        <View className="flex-col justify-center text-center items-center">
          <Text className="text-action mb-1 text-sm">
            {format(selectedDate, "PPP")}
          </Text>
          <TouchableOpacity
            onPress={() => setDatePickerVisible(true)}
            className="bg-white border-2 border-action p-1 rounded-full w-[80px] items-center"
          >
            <Image source={icons.calendar} className="size-8 mr-1 mt-0.5" />
          </TouchableOpacity>
        </View>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={() => setDatePickerVisible(false)}
          date={selectedDate}
        />
      </View>

      <Text className="text-white text-sm mt-4 ms-4 mb-2">
        Daily Total: {totalExpense}
        {currencies[0]?.symbol ?? ""}
      </Text>

      <View
        className="bg-dark_sec px-3 py-5 rounded-2xl "
        style={{ height: "77%" }}
      >
        <ScrollView
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{
            minHeight: "100%",
            paddingBottom: 10,
          }}
        >
          <FlatList
            data={items}
            extraData={items}
            keyExtractor={(item) => item.id!.toString()}
            scrollEnabled={false}
            renderItem={({ item }) => {
              const category = categories.find(
                (c) => c.id === item.category_id
              );
              const currency = currencies.find(
                (c) => c.id === item.currency_id
              );

              return (
                <ExpenseItemComponent
                  item={item}
                  onDelete={deleteItem}
                  categoryName={category?.name}
                  currencyName={currency?.name}
                  currencySymbol={currency?.symbol}
                  onQuantityChange={async () => {
                    await fetchExpensesForSelectedDate(selectedDate);
                    await fetchMonthlyTotalExpense(selectedDate);
                  }}
                />
              );
            }}
          />
        </ScrollView>

        {/* Add Item Button */}
        <Link href={`/expense/add_expense`} asChild>
          <TouchableOpacity
            className="bg-action p-4 flex-row justify-center items-center w-[120px] rounded-full absolute right-6 border-2 border-dark_sec"
            style={{ bottom: -20 }}
          >
            <Text className="text-white px-2">Add Item</Text>
            <Image source={icons.plus} className="size-5 mr-1 mt-0.5" />
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

export default ExpenseMain;
