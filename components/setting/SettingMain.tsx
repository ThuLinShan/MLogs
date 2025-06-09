import { CurrencyService } from "@/services/CurrencyService";
import { Currency } from "@/types/types";
import React, { useEffect, useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import CurrencySelector from "./CurrencySelector";

const SettingMain = () => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(
    null
  );
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

  useEffect(() => {
    const loadCurrency = async () => {
      await CurrencyService.init();
      const currency = await CurrencyService.getSelectedCurrency();
      setSelectedCurrency(currency);
    };

    loadCurrency();
  }, []);

  return (
    <View>
      <ScrollView
        className="mt-16"
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{
          minHeight: "100%",
          paddingBottom: 10,
        }}
      >
        <View className="p-5 mb-6">
          <Text className="text-2xl text-dark_sec-100 font-bold">Settings</Text>
        </View>
        <View className="w-[85%] mx-auto p-4 flex-row justify-between">
          <Text className="text-dark_sec-100">
            Currency:{" "}
            {selectedCurrency
              ? `${selectedCurrency.name} (${selectedCurrency.symbol})`
              : "Loading..."}
          </Text>
          <TouchableOpacity
            className="px-3 rounded-sm"
            onPress={() => setCurrencyModalVisible(true)}
          >
            <Text className="text-center text-primary text-pretty underline text-lg">
              Select
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Modal
        transparent={true}
        visible={currencyModalVisible}
        animationType="slide"
      >
        <CurrencySelector
          onSelect={(currency) => {
            setSelectedCurrency(currency);
          }}
          onClose={() => setCurrencyModalVisible(false)}
        />
      </Modal>
    </View>
  );
};

export default SettingMain;
