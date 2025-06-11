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
      try {
        await CurrencyService.init();
        const currency = await CurrencyService.getSelectedCurrency();
        if (currency) {
          setSelectedCurrency(currency);
        } else {
          console.error("No currency found");
        }
      } catch (error) {
        console.error("Error loading currency:", error);
      }
    };
    loadCurrency();
  }, []);

  return (
    <View>
      <View className="p-5 mt-16">
        <Text className="text-2xl text-dark_sec-100 font-bold">Settings</Text>
      </View>
      <ScrollView
        className="bg-secondary"
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{
          minHeight: "110%",
          paddingBottom: 10,
        }}
      >
        <View className="w-[85%] mx-auto p-4 flex-row justify-between">
          <Text className="text-dark_sec-100 text-lg">
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
