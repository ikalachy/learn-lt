"use client";

import { useEffect, useState } from "react";
import { openTelegramLink } from "@telegram-apps/sdk";
import { useStore } from "@/contexts/StoreContext";
import { TonConnectButton } from "@/tonconnect";

const BOT_USERNAME =
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "LearnLTBot";

export default function PaymentButton() {
  const { user } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [showOptions, setShowOptions] = useState(false);

  const handlePayment = async (method) => {
    setIsLoading(true);
    setStatus(null);
    setShowOptions(false);

    try {
      if (method === "ton") {
        // Open bot with /premium command using openTelegramLink
        openTelegramLink(
          `https://t.me/${BOT_USERNAME}?start=premium_${user?.telegramId}`
        );
        setStatus("Please complete the payment in Telegram bot");
      } else {
        setStatus("failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setStatus("failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {!showOptions ? (
        <button
          onClick={() => setShowOptions(true)}
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
      ) : (
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <div className="flex justify-center">
            <TonConnectButton />
          </div>
          <button
            onClick={() => setShowOptions(false)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      )}
      {status && (
        <div
          className={`text-sm ${
            status === "paid"
              ? "text-green-600"
              : status === "failed"
              ? "text-red-600"
              : status === "pending"
              ? "text-yellow-600"
              : status === "cancelled"
              ? "text-gray-600"
              : "text-blue-600"
          }`}
        >
          {status === "paid" && "✓ Payment successful!"}
          {status === "failed" && "✕ Payment failed. Please try again."}
          {status === "pending" && "⏳ Payment is being processed..."}
          {status === "cancelled" && "○ Payment was cancelled"}
          {!["paid", "failed", "pending", "cancelled"].includes(status) &&
            `Status: ${status}`}
        </div>
      )}
    </div>
  );
}
