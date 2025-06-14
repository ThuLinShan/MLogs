import { CurrencyProvider } from "@/context/CurrencyContext";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import "./globals.css";

export default function RootLayout() {
  return (
    <CurrencyProvider>
      <StatusBar hidden={true} />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="expense/add_expense"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="expense/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="todo/add_todo" options={{ headerShown: false }} />
        <Stack.Screen name="memo/add_memo" options={{ headerShown: false }} />
        <Stack.Screen name="memo/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="setting/setting" options={{ headerShown: false }} />
        <Stack.Screen
          name="expense/expense_history"
          options={{ headerShown: false }}
        />
      </Stack>
    </CurrencyProvider>
  );
}
