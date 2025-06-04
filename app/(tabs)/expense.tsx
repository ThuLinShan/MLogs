import ExpenseMain from "@/components/expense/ExpenseMain";
import { View } from "react-native";

const ExpenseScreen = () => {
  return (
    <View className="flex-1  bg-dark_sec h-max" style={{ height: "100%" }}>
      <ExpenseMain />
    </View>
  );
};

export default ExpenseScreen;
