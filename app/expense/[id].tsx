import EditExpenseForm from "@/components/expense/EditExpenseForm";
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

const EditExpenseScreen = () => {
  const { id } = useLocalSearchParams(); // Extracts `id` from the route

  if (!id) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">No Expense Item ID provided</Text>
      </View>
    );
  }

  const expenseId = parseInt(Array.isArray(id) ? id[0] : id, 10);

  return (
    <View className="flex-1 p-4 bg-dark">
      <EditExpenseForm expenseid={expenseId} />
    </View>
  );
};

export default EditExpenseScreen;
