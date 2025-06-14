import HomeTodoItem from "@/components/home/HomeTodoItem";
import { icons } from "@/constants/icons";
import { useCurrency } from "@/context/CurrencyContext";
import { ExpenseCategoryService } from "@/services/ExpenseCategoryService";
import { ExpenseItemService } from "@/services/ExpenseItemService";
import { TodoService } from "@/services/TodoService";
import { TodoItemType } from "@/types/types";
import { Link, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Image, ScrollView, Text, View } from "react-native";

export default function Index() {
  const [monthlyTotalExpense, setMonthlyTotalExpense] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [todos, setTodos] = useState<TodoItemType[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [countsLoading, setCountsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dbReady, setDbReady] = useState(false);
  const selectedCurrency = useCurrency();

  const fetchMonthlyTotalExpense = async (date: Date) => {
    const total = await ExpenseItemService.getMonthlyTotalExpense(date);
    setMonthlyTotalExpense(total);
  };

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await TodoService.getAll();
      setTodos(data);
    } catch (err) {
      console.error("Index: Failed to fetch todos", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCounts = useCallback(async () => {
    try {
      setCountsLoading(true); // or omit if you don't want loading state here
      const [completed, total] = await Promise.all([
        TodoService.getCompletedCount(),
        TodoService.getTotalCount(),
      ]);
      setCompletedCount(completed);
      setTotalCount(total);
    } catch (err) {
      console.error("Index: Failed to fetch todo counts", err);
    } finally {
      setCountsLoading(false);
    }
  }, []);

  const handleToggleComplete = async (id: number, current: boolean) => {
    try {
      await TodoService.toggleComplete(id, !current); // update the database
      const updatedTodos = await TodoService.getAll(); // reload the todos
      setTodos(updatedTodos);
      fetchCounts();
    } catch (err) {
      console.error("Index: Failed to toggle complete:", err);
    }
  };

  useEffect(() => {
    const MAX_RETRIES = 3; // Maximum retry attempts
    const RETRY_DELAY = 500; // 500ms interval between retries
    let attempts = 0;

    const initializeServices = async () => {
      while (attempts < MAX_RETRIES) {
        try {
          console.log(
            `Index: Initializing services (Attempt ${attempts + 1})...`
          );

          await Promise.all([
            TodoService.init(),
            ExpenseItemService.init(),
            ExpenseCategoryService.init(),
          ]);

          setDbReady(true);
          console.log("Index: Services initialized successfully.");

          await fetchMonthlyTotalExpense(selectedDate);
          await fetchTodos();
          await fetchCounts();

          return; // Exit loop on success
        } catch (error) {
          attempts++;
          console.error(
            `Index: Initialization failed (Attempt ${attempts})`,
            error
          );

          if (attempts >= MAX_RETRIES) {
            console.error(
              "Index: Maximum retries reached. Initialization failed."
            );
          } else {
            console.log(
              "Index: Retrying service initialization after delay..."
            );
            await new Promise((res) => setTimeout(res, RETRY_DELAY)); // Wait before retrying
          }
        }
      }
    };

    initializeServices();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const MAX_RETRIES = 3;
      const RETRY_DELAY = 500;
      let attempts = 0;

      const fetchData = async () => {
        while (attempts < MAX_RETRIES) {
          try {
            console.log(
              `Index: Fetching data (Attempt ${
                attempts + 1
              }) for selected date:`,
              selectedDate
            );

            await fetchMonthlyTotalExpense(selectedDate);
            await fetchTodos();
            await fetchCounts();

            return; // Exit loop on success
          } catch (error) {
            attempts++;
            console.error(
              `Index: Data fetching failed (Attempt ${attempts})`,
              error
            );
            ``;

            if (attempts >= MAX_RETRIES) {
              console.error(
                "Index: Maximum retries reached. Data fetch failed."
              );
            } else {
              console.log("Index: Retrying data fetch after delay...");
              await new Promise((res) => setTimeout(res, RETRY_DELAY)); // Wait before retrying
            }
          }
        }
      };

      fetchData();
    }, [selectedDate])
  );

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" }); // "June"
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <View className=" h-[100%] flex-col justify-between content-center align-middle">
      <View className="h-[12%] flex-row justify-between items-center">
        <Text className="ms-8 text-primary-100">
          {formatDate(selectedDate)}
        </Text>
        <Link href={`/setting/setting`} className="me-8">
          <Image source={icons.menu} className="size-8" />
        </Link>
      </View>
      <View className=" flex-col justify-between content-center items-center mb-12">
        <Text className="text-primary text-xl mb-3 font-bold">
          This month's Expense
        </Text>
        <View className="px-6 py-2 bg-light_green-700 rounded-xl border-primary border-2">
          <Text className="font-bold text-dark_sec-500 text-4xl">
            {monthlyTotalExpense}
            {selectedCurrency?.symbol ?? ""}
          </Text>
        </View>

        <Link href={`/(tabs)/expense`} className="mt-2">
          <Text className="italic text-action underline ">Go To Expense</Text>
        </Link>
      </View>
      <View className="h-[65%]">
        <View className="w-[80%] rounded-t-lg flex-row justify-between px-6 py-2 items-center bg-dark_sec mx-auto border-b border-dark_sec">
          <Text className="text-light_green">Tasks completed: </Text>
          <Text className="text-light_green">
            {completedCount} / {totalCount}
          </Text>
        </View>
        <ScrollView
          className="bg-dark_sec border-t-4 border-dark_sec"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            minHeight: "100%",
            paddingBottom: 10,
          }}
        >
          <FlatList
            data={todos}
            renderItem={({ item }) => (
              <HomeTodoItem
                item={item}
                onToggleComplete={handleToggleComplete}
              />
            )}
            keyExtractor={(item) => item.id!.toString()}
            scrollEnabled={false}
          />
        </ScrollView>
      </View>
    </View>
  );
}
