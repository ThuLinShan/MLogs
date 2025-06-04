import { icons } from "@/constants/icons";
import { ExpenseItemService } from "@/services/ExpenseItemService";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

type Props = {
  onDateSelected: (startEpoch: number, endEpoch: number) => void;
  currencySymbol: string; // 👈 New prop
};

const ExpenseHeader: React.FC<Props> = ({ onDateSelected, currencySymbol }) => {
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthlyTotalExpense, setMonthlyTotalExpense] = useState(0);

  const showDatePicker = () => setDatePickerVisible(true);
  const hideDatePicker = () => setDatePickerVisible(false);

  const getStartOfDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
  const getEndOfDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

  const fetchMonthlyTotalExpense = async (date: Date) => {
    await ExpenseItemService.init();
    const total = await ExpenseItemService.getMonthlyTotalExpense(date);
    setMonthlyTotalExpense(total);
  };

  const handleConfirm = (date: Date) => {
    setSelectedDate(date);

    const start = getStartOfDay(date);
    const end = getEndOfDay(date);

    fetchMonthlyTotalExpense(date);

    const startEpoch = Math.floor(start.getTime() / 1000);
    const endEpoch = Math.floor(end.getTime() / 1000);
    onDateSelected(startEpoch, endEpoch);

    hideDatePicker();
  };

  useEffect(() => {
    fetchMonthlyTotalExpense(selectedDate);
  }, []);

  return (
    <View className="flex-row justify-between items-center p-5 rounded-xl border-b-4 border-r-2 border-dark">
      <View className="flex-col justify-center items-center">
        <Text className="text-white text-l font-thin">Monthly Total</Text>
        <Text className="text-white text-2xl font-bold">
          {monthlyTotalExpense.toFixed(2)} {currencySymbol}
        </Text>
      </View>
      <View className="flex-col justify-center text-center items-center">
        <Text className="text-action mb-1 text-sm">
          {format(selectedDate, "PPP")}
        </Text>
        <TouchableOpacity
          onPress={showDatePicker}
          className="bg-white border-2 border-action p-1 rounded-full w-[80px] items-center"
        >
          <Image source={icons.calendar} className="size-8 mr-1 mt-0.5" />
        </TouchableOpacity>
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        date={selectedDate}
      />
    </View>
  );
};

export default ExpenseHeader;
