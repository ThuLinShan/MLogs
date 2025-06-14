// src/components/TodoList.tsx
import { icons } from "@/constants/icons";
import { TodoItemType } from "@/types/types";
import { useFocusEffect } from "@react-navigation/native";
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
import { TodoService } from "../../services/TodoService";
import ClearCompletedButton from "./ClearCompletedButton ";
import TodoItem from "./TodoItem";

const TodoMain: React.FC = () => {
  const [todos, setTodos] = useState<TodoItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [todayCompletedCount, setTodayCompletedCount] = useState(0);
  const [todayTotalCount, setTodayTotalCount] = useState(0);
  const [countsLoading, setCountsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [dbReady, setDbReady] = useState(false);

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await TodoService.getAll();
      setTodos(data);
    } catch (err) {
      console.error("TodoMain: Failed to fetch todos", err);
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
      console.error("TodoMain: Failed to fetch counts", err);
    } finally {
      setCountsLoading(false);
    }
  }, []);

  const fetchTodayCounts = useCallback(async () => {
    try {
      const [completed, total] = await Promise.all([
        TodoService.getTodaysCompletedTasksCount(),
        TodoService.getTodaysTasksCount(),
      ]);
      setTodayCompletedCount(completed);
      setTodayTotalCount(total);
    } catch (err) {
      console.error("TodoMain: Failed to fetch counts", err);
    } finally {
    }
  }, []);

  useEffect(() => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 500;
    let attempts = 0;

    const initializeServices = async () => {
      while (attempts < MAX_RETRIES) {
        try {
          console.log(
            `TodoMain: Initializing TodoService (Attempt ${attempts + 1})...`
          );

          await TodoService.init();
          setDbReady(true);

          await fetchTodos();
          await fetchCounts();
          await fetchTodayCounts();

          console.log("TodoMain: TodoService initialized successfully.");
          return; // Exit loop on success
        } catch (err) {
          attempts++;
          console.error(
            `TodoMain: Initialization failed (Attempt ${attempts})`,
            err
          );

          if (attempts >= MAX_RETRIES) {
            console.error(
              "TodoMain: Maximum retries reached. Initialization failed."
            );
          } else {
            console.log("TodoMain: Retrying initialization after delay...");
            await new Promise((res) => setTimeout(res, RETRY_DELAY)); // Wait before retrying
          }
        }
      }
    };

    initializeServices();

    return () => {
      TodoService.close().then(() => {
        console.log("TodoMain: DB closed on unmount");
      });
    };
  }, [fetchTodos, fetchCounts]);

  useFocusEffect(
    useCallback(() => {
      if (!dbReady) return; // Skip if DB is not ready

      const MAX_RETRIES = 3;
      const RETRY_DELAY = 500;
      let attempts = 0;

      const fetchData = async () => {
        while (attempts < MAX_RETRIES) {
          try {
            console.log(
              `TodoMain: Fetching todos and counts (Attempt ${attempts + 1})...`
            );

            await fetchTodos();
            await fetchCounts();
            await fetchTodayCounts();

            console.log("TodoMain: Data fetching completed.");
            return; // Exit loop on success
          } catch (err) {
            attempts++;
            console.error(
              `TodoMain: Data fetching failed (Attempt ${attempts})`,
              err
            );

            if (attempts >= MAX_RETRIES) {
              console.error(
                "TodoMain: Maximum retries reached. Data fetch failed."
              );
            } else {
              console.log("TodoMain: Retrying data fetch after delay...");
              await new Promise((res) => setTimeout(res, RETRY_DELAY)); // Wait before retrying
            }
          }
        }
      };

      fetchData();
    }, [dbReady, fetchTodos, fetchCounts, fetchTodayCounts, refreshTrigger])
  );

  const handleDelete = async (id: number) => {
    await TodoService.remove(id);
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => !prev);
  };

  const handleToggleComplete = async (id: number, current: boolean) => {
    try {
      await TodoService.toggleComplete(id, !current); // update the database
      const updatedTodos = await TodoService.getAll(); // reload the todos
      setTodos(updatedTodos);
      fetchCounts();
      fetchTodayCounts();
    } catch (err) {
      console.error("Failed to toggle complete:", err);
    }
  };

  return (
    <View className="py-12 px-1">
      <View
        className="flex-row justify-between items-center p-5 rounded-xl border-b-4 border-r-2 border-dark bg-dark_sec"
        style={{ height: "12%" }}
      >
        <View className="flex-col justify-center items-start">
          <Text className="text-white text-l font-normal">ToDo</Text>
          {totalCount === 0 ? (
            <Text className="text-light_green text-base font-normal mt-1">
              There is no task right now.
            </Text>
          ) : (
            <Text className="text-light_green text-2xl font-bold">
              {completedCount} out of {totalCount} completed
            </Text>
          )}
        </View>

        {/* <View className="flex-col justify-center text-center items-center">
          <Text className="text-light_green mb-1 text-sm">test</Text>
          <TouchableOpacity className="bg-white border-2 border-light_green p-1 rounded-full w-[60px] flex-row justify-center items-center">
            <Image source={icons.calendar} className="size-8 " />
          </TouchableOpacity>
        </View> */}
      </View>

      <View className="flex-row justify-between content-center ">
        <Text className="text-light_green text-sm mt-4 ms-4 mb-2 font-bold">
          Today tasks: {todayCompletedCount}/{todayTotalCount}
        </Text>
        <ClearCompletedButton onClear={handleRefresh} />
      </View>

      <View
        className=" px-3 py-5 rounded-2xl bg-dark_sec "
        style={{ height: "77%" }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            minHeight: "100%",
            paddingBottom: 10,
          }}
        >
          <FlatList
            data={todos}
            renderItem={({ item }) => (
              <TodoItem
                item={item}
                onDelete={handleDelete}
                onToggleComplete={handleToggleComplete}
              />
            )}
            keyExtractor={(item) => item.id!.toString()}
            scrollEnabled={false}
          />
        </ScrollView>
        {/* Add Item Button */}
        <Link href={`/todo/add_todo`} asChild>
          <TouchableOpacity
            className="bg-action p-4 flex-row justify-center items-center w-[120px] rounded-full absolute right-6"
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

export default TodoMain;
