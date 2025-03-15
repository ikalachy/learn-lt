"use client";

import { createContext, useContext, useState, useEffect } from "react";

import { retrieveLaunchParams, retrieveRawInitData } from "@telegram-apps/sdk";

const StoreContext = createContext();

const tgWebAppData = new URLSearchParams([
  [
    "user",
    JSON.stringify({
      id: 99281932,
      firstName: "Andrew",
      lastName: "Rogue",
      username: "rogue",
      languageCode: "en",
      isPremium: true,
      allowsWriteToPm: true,
    }),
  ],
  ["hash", ""],
  ["signature", ""],
  ["auth_date", Date.now().toString()],
]);

function getTelegramUserId(params) {
  if (params?.tgWebAppData?.user?.id) {
    return params.tgWebAppData.user.id;
  }

  try {
    const userData = JSON.parse(params?.tgWebAppData?.get("user"));
    if (userData?.id) {
      return userData.id;
    }
  } catch (error) {
    console.error("Error parsing Telegram user data:", error);
  }

  return null; // Return null if user ID is not found
}
const isDevelopment = process.env.NODE_ENV === "development";
export function StoreProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeStore = async () => {
      try {
        let params;

        if (isDevelopment) {
          const { mockTelegramEnv } = await import("@telegram-apps/sdk");

          const mockData = {
            tgWebAppThemeParams: {
              accentTextColor: "#6ab2f2",
              bgColor: "#17212b",
              buttonColor: "#5288c1",
              buttonTextColor: "#ffffff",
              destructiveTextColor: "#ec3942",
              headerBgColor: "#17212b",
              hintColor: "#708499",
              linkColor: "#6ab3f3",
              secondaryBgColor: "#232e3c",
              sectionBgColor: "#17212b",
              sectionHeaderTextColor: "#6ab3f3",
              subtitleTextColor: "#708499",
              textColor: "#f5f5f5",
            },
            tgWebAppData: tgWebAppData,
            version: "7.2",
            platform: "tdesktop",
          };

          mockTelegramEnv(mockData);
          params = mockData;
        } else {
          params = retrieveLaunchParams();
        }
        // console.log(JSON.stringify(params, null, 2));
        // console.log(JSON.stringify(retrieveRawInitData(), null, 2));
        if (!getTelegramUserId(params)) {
          console.error("Telegram user data not found");
          setLoading(false);
          return;
        }

        // Validate user against our API
        const response = await fetch("/api/users/validate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            initData: isDevelopment
              ? tgWebAppData.toString()
              : retrieveRawInitData(),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to validate user");
        }

        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error("Error validating user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeStore();
  }, []);

  return (
    <StoreContext.Provider value={{ user, setUser, loading }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
