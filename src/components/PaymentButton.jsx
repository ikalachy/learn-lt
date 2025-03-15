"use client";

import { useEffect, useState } from "react";
import { invoice } from "@telegram-apps/sdk";
import { useStore } from "@/contexts/StoreContext";

export default function PaymentButton() {
  const { user } = useStore();
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.telegramId,
        }),
      });

      const data = await response.json();

      if (data.url) {
        await invoice.open(data.url);
      } else {
        console.error("Failed to create payment URL");
      }
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading}
      className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <>
          <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
          Processing...
        </>
      ) : (
        <>
          <span className="text-lg">⚡️</span>
          Upgrade to Premium
        </>
      )}
    </button>
  );
}
