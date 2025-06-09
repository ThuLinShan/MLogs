import AddTodoForm from "@/components/todo/AddTodoForm";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

const AddTodoScreen = () => {
  return (
    <>
      <View className="h-[100%] flex-col justify-between bg-dark_sec">
        <AddTodoForm />
        <TouchableOpacity
          className=" bottom-14 left-0 right-0 mx-5 bg-dark rounded-lg  py-3.5 flex flex-row items-center justify-center z-50"
          onPress={router.back}
        >
          <Text className="text-white font-semibold text-base">Go Back</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default AddTodoScreen;
