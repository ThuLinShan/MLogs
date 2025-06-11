import { CurrencyService } from "@/services/CurrencyService";
import { Currency } from "@/types/types";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type CurrencySelectorProps = {
  onSelect: (currency: Currency) => void;
  onClose: () => void;
};

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  onSelect,
  onClose,
}) => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<number | null>(
    null
  );
  const [newCurrencyName, setNewCurrencyName] = useState("");
  const [newCurrencySymbol, setNewCurrencySymbol] = useState("");

  useEffect(() => {
    const fetchCurrencies = async () => {
      await CurrencyService.init();
      const [data, selectedCurrency] = await Promise.all([
        CurrencyService.getAll(),
        CurrencyService.getSelectedCurrency(),
      ]);
      setCurrencies(data);
      setSelectedCurrencyId(selectedCurrency?.id ?? null);
    };
    fetchCurrencies();
  }, []);

  const handleAddCurrency = async () => {
    if (newCurrencyName.trim() === "" || newCurrencySymbol.trim() === "")
      return;

    const id = await CurrencyService.add({
      name: newCurrencyName,
      symbol: newCurrencySymbol,
    });

    setCurrencies([
      ...currencies,
      { id, name: newCurrencyName, symbol: newCurrencySymbol },
    ]);
    setNewCurrencyName("");
    setNewCurrencySymbol("");
  };

  const handleSelectCurrency = async (currency: Currency) => {
    await CurrencyService.setCurrency(currency.id);
    setSelectedCurrencyId(currency.id);
    onSelect(currency);
    onClose();
  };

  const handleDeleteCurrency = async (id: number) => {
    if (id === selectedCurrencyId) return; // Prevent deletion of selected currency
    await CurrencyService.remove(id);
    setCurrencies(currencies.filter((cur) => cur.id !== id));
  };

  return (
    <View
      className="flex-1 justify-center items-center drop-shadow-lg"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <View className="w-full max-h-[60%] bg-dark_sec p-6 rounded-lg ">
        <View className="mb-4">
          <TextInput
            className="bg-white text-black rounded px-3 py-2 mb-2"
            placeholder="New Currency Name"
            placeholderTextColor="#40798C"
            value={newCurrencyName}
            onChangeText={setNewCurrencyName}
          />
          <TextInput
            className="bg-white text-black rounded px-3 py-2 mb-2"
            placeholder="New Currency Symbol"
            placeholderTextColor="#40798C"
            value={newCurrencySymbol}
            onChangeText={setNewCurrencySymbol}
          />
          <TouchableOpacity
            className="bg-primary mb-2 items-center py-2 rounded-md"
            onPress={handleAddCurrency}
          >
            <Text className="text-white">Add Currency</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          className="mb-4"
          data={currencies}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={({ item }) => (
            <View className="flex-row justify-between items-center mb-2">
              <Text
                className={`text-lg ${
                  item.id === selectedCurrencyId
                    ? "text-light_green"
                    : "text-white"
                }`}
                onPress={() => handleSelectCurrency(item)}
              >
                {item.name} {item.id === selectedCurrencyId ? "(Selected)" : ""}
              </Text>
              <TouchableOpacity
                className=""
                onPress={() => handleDeleteCurrency(item.id!)}
                disabled={item.id === selectedCurrencyId}
              >
                <Text className="text-action-500 underline">Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />

        <TouchableOpacity
          className=" bg-dark items-center py-3 rounded-md"
          onPress={onClose}
        >
          <Text className="text-white">Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CurrencySelector;
