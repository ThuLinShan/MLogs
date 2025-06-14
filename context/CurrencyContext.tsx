import { AppConfigService } from "@/services/AppConfigService";
import { CurrencyService } from "@/services/CurrencyService";
import { Currency } from "@/types/types";
import React, { createContext, useContext, useEffect, useState } from "react";

const CurrencyContext = createContext<Currency | null>(null);

export const CurrencyProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(
    null
  );

  useEffect(() => {
    const MAX_RETRIES = 5; // Maximum retry attempts
    const RETRY_DELAY = 500; // 500ms delay between retries
    let attempts = 0;

    const initializeServices = async () => {
      while (attempts < MAX_RETRIES) {
        try {
          console.log(
            `CurrencyContext: Initializing services (Attempt ${
              attempts + 1
            })...`
          );

          await Promise.all([AppConfigService.init(), CurrencyService.init()]);

          console.log("CurrencyContext: Services initialized successfully.");

          const currency = await CurrencyService.getSelectedCurrency();
          setSelectedCurrency(currency);

          console.log(
            "CurrencyContext.useEffect is completed: currency:",
            currency
          );
          return; // Exit loop on success
        } catch (error) {
          attempts++;
          console.error(
            `CurrencyContext: Initialization failed (Attempt ${attempts})`,
            error
          );

          if (attempts >= MAX_RETRIES) {
            console.error(
              "CurrencyContext: Maximum retries reached. Initialization failed."
            );
          } else {
            console.log(
              "CurrencyContext: Retrying initialization after delay..."
            );
            await new Promise((res) => setTimeout(res, RETRY_DELAY)); // Wait before retrying
          }
        }
      }
    };

    initializeServices();
  }, []);

  return (
    <CurrencyContext.Provider value={selectedCurrency}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
