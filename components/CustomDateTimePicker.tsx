// components/CustomDateTimePicker.tsx
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

type Props = {
  label: string;
  date: Date | null;
  onConfirm: (date: Date) => void;
};

const CustomDateTimePicker: React.FC<Props> = ({ label, date, onConfirm }) => {
  const [isPickerVisible, setPickerVisible] = React.useState(false);

  const handleConfirm = (selectedDate: Date) => {
    setPickerVisible(false);
    onConfirm(selectedDate);
  };

  return (
    <View className="my-2">
      <Text className="mb-1 text-light_green font-semibold">{label}</Text>
      <TouchableOpacity
        className="border border-light_green p-3 rounded-lg"
        onPress={() => setPickerVisible(true)}
      >
        <Text className="text-light_green">
          {date ? date.toLocaleString() : "Tap to select date and time"}
        </Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isPickerVisible}
        mode="datetime"
        onConfirm={handleConfirm}
        onCancel={() => setPickerVisible(false)}
        date={date ?? new Date()}
      />
    </View>
  );
};

export default CustomDateTimePicker;
