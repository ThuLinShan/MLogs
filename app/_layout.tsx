import { CurrencyProvider } from "@/context/CurrencyContext";
import { AppConfigService } from "@/services/AppConfigService";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import "./globals.css";

export default function RootLayout() {
  (async () => {
    const retries = 5;
    const delay = 500; // milliseconds

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await AppConfigService.appInit(); // Run the main initialization logic
        console.log("AppConfigService initialized successfully.");
        return; // Exit loop on success
      } catch (error) {
        console.error(
          `AppConfigService.appInit() failed (Attempt ${attempt}): `,
          error
        );
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, delay)); // Wait before retrying
        } else {
          throw new Error("App initialization failed after multiple retries.");
        }
      }
    }
  })();

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
