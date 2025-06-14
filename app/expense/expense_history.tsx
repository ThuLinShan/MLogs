import { useCurrency } from "@/context/CurrencyContext";
import { ExpenseItemService } from "@/services/ExpenseItemService";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

const ExpenseHistoryScreen = () => {
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<"year" | "month">("year");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [categoryTotals, setCategoryTotals] = useState<{
    [key: string]: number;
  }>({});

  const selectedCurrency = useCurrency();
  const [chartData, setChartData] = useState({
    labels: ["Loading..."],
    datasets: [{ data: [0] }],
  });

  const updateChartData = (data: { [key: string]: number }) => {
    console.log("ExpenseHistoryScreen.updateChartData(): is invoked.");

    let labels: string[] = [];
    let values: number[] = [];

    if (viewType === "year") {
      labels = Array.from({ length: 12 }, (_, i) =>
        new Date(selectedYear, i).toLocaleString("en", { month: "short" })
      );
      values = labels.map((_, index) => {
        const key = `${selectedYear}-${(index + 1)
          .toString()
          .padStart(2, "0")}`;
        return isFinite(data[key]) ? data[key] : 0;
      });
    } else {
      // Generate labels for each day of the selected month
      const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
      labels = Array.from(
        { length: daysInMonth },
        (_, i) => `${i + 1}${getDaySuffix(i + 1)}`
      );
      values = labels.map((_, index) => {
        const key = `${index + 1}${getDaySuffix(index + 1)}`;
        return isFinite(data[key]) ? data[key] : 0;
      });
    }

    console.log("ExpenseHistoryScreen.updateChartData(): labels:", labels);
    console.log("ExpenseHistoryScreen.updateChartData(): values:", values);

    setChartData({ labels, datasets: [{ data: values }] });
  };

  const getDaySuffix = (day: number): string => {
    if (day >= 11 && day <= 13) return "th"; // Special case for 11th, 12th, 13th
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      let expenseData =
        viewType === "year"
          ? await ExpenseItemService.fetchExpensesByMonth(selectedYear)
          : await ExpenseItemService.fetchExpensesByDay(
              selectedYear,
              selectedMonth
            );

      let categoryData = await ExpenseItemService.fetchExpensesByCategory(
        selectedYear,
        viewType === "month" ? selectedMonth : undefined
      );

      console.log(
        "ExpenseHistoryScreen.useEffect(): expenseData:",
        expenseData
      );
      console.log(
        "ExpenseHistoryScreen.useEffect(): categoryData:",
        categoryData
      );

      updateChartData(expenseData);
      setCategoryTotals(categoryData);

      setLoading(false);
    };

    fetchData();
  }, [viewType, selectedYear, selectedMonth]);

  const totalExpense = chartData.datasets[0].data.reduce(
    (sum, value) => sum + value,
    0
  );

  return (
    <View className="flex-col h-[100%] bg-dark_sec pt-8">
      <View className="mt-8 mx-auto">
        <View className="flex-row justify-between">
          <Text className=" text-2xl font-bold text-light_green ms-4">
            Expense History
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
        <View className="flex-row mt-6">
          <TouchableOpacity
            className={`m-2 px-3 py-1 rounded-md ${
              viewType === "year" ? "bg-action" : "bg-dark_sec"
            }`}
            onPress={() => setViewType("year")}
          >
            <Text className="text-white">By Year</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`m-2 px-3 py-1 rounded-md ${
              viewType === "month" ? "bg-action" : "bg-dark_sec"
            }`}
            onPress={() => setViewType("month")}
          >
            <Text className="text-white">By Month</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row">
          <Picker
            selectedValue={selectedYear}
            style={{ width: 200, color: "white" }} // Explicitly set width and color
            onValueChange={(itemValue: number) => setSelectedYear(itemValue)}
          >
            {Array.from({ length: 10 }, (_, i) => {
              const year = new Date().getFullYear() - i;
              return <Picker.Item key={year} label={`${year}`} value={year} />;
            })}
          </Picker>
          {viewType === "month" && (
            <Picker
              selectedValue={selectedMonth}
              style={{ width: 200, color: "white" }} // Consistent styling
              onValueChange={(itemValue: number) => setSelectedMonth(itemValue)}
            >
              {Array.from({ length: 12 }, (_, i) => {
                const monthName = new Date(2025, i).toLocaleString("en", {
                  month: "long",
                }); // Converts to "January", "February"
                return (
                  <Picker.Item key={i + 1} label={monthName} value={i + 1} />
                );
              })}
            </Picker>
          )}
        </View>
        {loading ? (
          <Text>Loading data...</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              data={chartData}
              width={Math.max(screenWidth, chartData.labels.length * 40)} // Expands width dynamically
              // withVerticalLabels={viewType === "month" ? false : true}
              height={250}
              yAxisSuffix={
                selectedCurrency ? ` ${selectedCurrency.symbol}` : "$"
              }
              chartConfig={{
                backgroundColor: "#1F363D",
                backgroundGradientFrom: "#1F363D",
                backgroundGradientTo: "#16262B",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(239, 101, 77, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(207, 224, 195, ${opacity})`,
                propsForDots: { r: "1", strokeWidth: "1", stroke: "#EF654D" },
              }}
              bezier
              style={{
                marginVertical: 10,
              }}
            />
          </ScrollView>
        )}
        {/* <Text className="text-sm text-action-100">
          {viewType === "year"
            ? `Expenses for ${selectedYear}`
            : `Expenses for ${new Date(
                selectedYear,
                selectedMonth - 1
              ).toLocaleString("en", { month: "long" })}`}
        </Text> */}
      </View>
      <View className="px-4">
        <Text className="text-lg text-light_green font-bold">
          Total Expense: {totalExpense}{" "}
          {selectedCurrency ? `${selectedCurrency.symbol}` : ``}
        </Text>
        <ScrollView
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{
            minHeight: "100%",
            paddingBottom: 10,
          }}
        >
          {Object.entries(categoryTotals).map(([category, total]) => (
            <View
              key={category}
              className="p-2 border-b border-gray-700 flex-row justify-between"
            >
              <Text className="text-light_green">{category}: </Text>
              <Text className="text-light_green">
                {selectedCurrency
                  ? `${total} ${selectedCurrency.symbol}`
                  : `$${total}`}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default ExpenseHistoryScreen;
