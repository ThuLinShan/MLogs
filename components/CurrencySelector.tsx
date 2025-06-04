import { CurrencyService } from "@/services/CurrencyService";
import { Currency } from "@/types/types";
import React, { useEffect, useState } from "react";
import { Button, FlatList, Text, TextInput, View } from "react-native";

type CurrencySelectorProps = {
  onSelect: (currency: Currency) => void;
  onClose: () => void;
};

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  onSelect,
  onClose,
}) => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [newCurrencyName, setNewCurrencyName] = useState("");
  const [newCurrencySymbol, setNewCurrencySymbol] = useState("");

  useEffect(() => {
    const fetchCurrencies = async () => {
      await CurrencyService.init();
      const data = await CurrencyService.getAll();
      setCurrencies(data);
    };
    fetchCurrencies();
  }, []);

  const handleAddCurrency = async () => {
    if (newCurrencyName.trim() === "") return;
    if (newCurrencySymbol.trim() === "") return;

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

  const handleDeleteCurrency = async (id: number) => {
    await CurrencyService.remove(id);
    setCurrencies(currencies.filter((cat) => cat.id !== id));
  };

  return (
    <View
      className="flex-1 justify-center items-center drop-shadow-lg"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <View className="w-full max-h-[80%] bg-primary p-6 rounded-lg  border-solid border-2 border-blue_green">
        <FlatList
          data={currencies}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={({ item }) => (
            <View className="flex-row justify-between items-center mb-2">
              <Text
                className="text-white text-lg"
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                {item.name}
              </Text>
              <Button
                title="Delete"
                onPress={() => handleDeleteCurrency(item.id!)}
              />
            </View>
          )}
        />
        <TextInput
          className="bg-white text-black rounded px-3 py-2 mb-2"
          placeholder="New Currency Name"
          value={newCurrencyName}
          onChangeText={setNewCurrencyName}
        />
        <TextInput
          className="bg-white text-black rounded px-3 py-2 mb-2"
          placeholder="New Currency Symbol"
          value={newCurrencySymbol}
          onChangeText={setNewCurrencySymbol}
        />
        <Button title="Add Category" onPress={handleAddCurrency} />
        <Button title="Close" onPress={onClose} />
      </View>
    </View>
  );
};

export default CurrencySelector;
