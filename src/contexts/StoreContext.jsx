"use client";

import { createContext, useContext, useState, useEffect } from "react";

import { retrieveLaunchParams, retrieveRawInitData } from "@telegram-apps/sdk";

const StoreContext = createContext();

const mockData = {
  themeParams: {
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
  tgWebAppData: {
    user: {
      id: 99281932,
      firstName: "Andrew",
      lastName: "Rogue",
      username: "rogue",
      languageCode: "en",
      isPremium: true,
      allowsWriteToPm: true,
    },
    hash: "89d6079ad6762351f38c6dbbc41bb53048019256a9443988af7a48bcad16ba31",
    authDate: new Date(1716922846000),
    signature: "abc",
    startParam: "debug",
    chatType: "sender",
    chatInstance: "8428209589180549439",
  },
  version: "7.2",
  platform: "tdesktop",
};

export function StoreProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeStore = async () => {
      try {
        let params;

        if (process.env.NODE_ENV === "development") {
          const { mockTelegramEnv } = await import("@telegram-apps/sdk");
          mockTelegramEnv(mockData);
          params = mockData;
        } else {
          params = retrieveLaunchParams();
        }
        // console.log(JSON.stringify(params, null, 2));
        // console.log(JSON.stringify(retrieveRawInitData(), null, 2));
        if (!params?.tgWebAppData?.user?.id) {
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
            initData: retrieveRawInitData(),
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
