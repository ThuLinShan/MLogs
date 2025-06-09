import { TodoService } from "@/services/TodoService";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import CustomDateTimePicker from "../CustomDateTimePicker";

const AddTodoForm: React.FC = () => {
  const [title, setTitle] = useState("");
  const [remindAtDate, setRemindAtDate] = useState<Date | null>(null);

  const navigation = useNavigation();

  const handleAdd = async () => {
    if (title.trim()) {
      const remindAtEpoch = remindAtDate ? remindAtDate.getTime() : null;

      const newTodo = {
        title,
        completed: false,
        description: "", // optional
        deadline: remindAtEpoch,
      };

      console.log("AddTodoForm.handleAdd() called with:", newTodo);

      try {
        await TodoService.add(newTodo);
        setTitle("");
        setRemindAtDate(null);

        navigation.goBack(); // ✅ Go back to previous screen
      } catch (error) {
        console.error("Failed to add todo:", error);
      }
    }
  };

  return (
    <View className="py-14 px-4">
      <Text className="my-2 text-xl text-white">Add a task</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        className="rounded-lg"
        placeholderTextColor="#CFE0C3"
        style={{
          borderWidth: 1,
          borderColor: "#CFE0C3",
          marginBottom: 10,
          padding: 8,
          color: "white",
        }}
      />

      <CustomDateTimePicker
        label="Deadline (optional)"
        date={remindAtDate}
        onConfirm={setRemindAtDate}
      />

      <TouchableOpacity
        className="bg-primary py-3 rounded-md mt-2"
        onPress={handleAdd}
      >
        <Text className="text-center text-white text-lg">Add Task</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddTodoForm;
