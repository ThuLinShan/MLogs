import { CurrencyService } from "@/services/CurrencyService";
import { ExpenseItemService } from "@/services/ExpenseItemService";
import { Currency } from "@/types/types";
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
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(
    null
  );
  const [chartData, setChartData] = useState({
    labels: ["Loading..."],
    datasets: [{ data: [0] }],
  });

  const loadSelectedCurrency = async () => {
    await CurrencyService.init(); // Initialize DB and default currency
    const currency = await CurrencyService.getSelectedCurrency();
    console.log(
      "ExpenseMain.loadSelectedCurrency: is successful. currency: ",
      currency
    );
    setSelectedCurrency(currency);
    console.log(
      "ExpenseMain.loadSelectedCurrency: selectedCurrency: ",
      selectedCurrency
    );
    await CurrencyService.close();
  };

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
      labels = Array.from({ length: 4 }, (_, i) => `Week ${i + 1}`);
      values = labels.map((_, index) => {
        const key = `Week ${index + 1}`;
        return isFinite(data[key]) ? data[key] : 0;
      });
    }

    console.log("ExpenseHistoryScreen.updateChartData(): labels:", labels);
    console.log("ExpenseHistoryScreen.updateChartData(): values:", values);

    setChartData({ labels, datasets: [{ data: values }] });
  };

  useEffect(() => {
    loadSelectedCurrency();
    const fetchData = async () => {
      setLoading(true);
      let expenseData =
        viewType === "year"
          ? await ExpenseItemService.fetchExpensesByMonth(selectedYear)
          : await ExpenseItemService.fetchExpensesByWeek(
              selectedYear,
              selectedMonth
            );

      console.log(
        "ExpenseHistoryScreen.useEffect(): expenseData:",
        expenseData
      );
      updateChartData(expenseData);
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
          <LineChart
            data={chartData}
            width={screenWidth - 20}
            height={250}
            yAxisSuffix={selectedCurrency ? ` ${selectedCurrency.symbol}` : "$"}
            chartConfig={{
              backgroundColor: "#1F363D",
              backgroundGradientFrom: "#1F363D",
              backgroundGradientTo: "#16262B",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(	239, 101, 77, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(207, 224, 195, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: { r: "6", strokeWidth: "2", stroke: "#EF654D" },
            }}
            bezier
            style={{
              marginVertical: 10,
              borderRadius: 16,
            }}
          />
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
      <ScrollView
        className="mx-4"
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{
          minHeight: "80%",
          paddingBottom: 10,
        }}
      >
        {/* Total Expense */}
        <Text className="me-4 text-lg font-bold text-action">
          Total Expense:{" "}
          {selectedCurrency
            ? `${totalExpense} ${selectedCurrency.symbol}`
            : totalExpense}
        </Text>
        <View className="my-6 p-4">
          {viewType === "year" &&
            chartData.labels.map((month, index) => (
              <View key={month} className="mb-3 flex-row justify-between">
                <Text className="text-light_green">{month}</Text>
                <Text className="text-action">
                  {selectedCurrency
                    ? `${chartData.datasets[0].data[index]} ${selectedCurrency.symbol}`
                    : chartData.datasets[0].data[index]}
                </Text>
              </View>
            ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default ExpenseHistoryScreen;
