"use client";

import { createContext, useContext, useState, useEffect } from "react";

import { retrieveLaunchParams } from "@telegram-apps/sdk";

const StoreContext = createContext();

function getTelegramUserId(params) {
  if (params?.initData?.user?.id) {
    return params.initData.user.id;
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
        let params = retrieveLaunchParams();
        
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
            initData: params.initDataRaw,
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
