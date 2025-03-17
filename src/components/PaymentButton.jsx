"use client";

import { openTelegramLink } from "@telegram-apps/sdk";
import { useStore } from "@/contexts/StoreContext";
import { TonConnectButton, useTonConnectUI } from "@/tonconnect";
import { useEffect, useState } from "react";

const BOT_USERNAME =
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "LearnLTBot";

const TON_PRICE = "0.01"; // Price in TON

export default function PaymentButton() {
  const { user } = useStore();
  const [tonConnectUI] = useTonConnectUI();
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes
        messages: [
          {
            address: process.env.NEXT_PUBLIC_OWNER_WALLET,
            amount: TON_PRICE,
            comment: `premium_${user?.telegramId}`
          }
        ]
      });
    } catch (error) {
      console.error('Transaction error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-center">
        <TonConnectButton />
      </div>
      
      {tonConnectUI.connected && (
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
              <span className="text-lg">💎</span>
              Pay {TON_PRICE} TON
            </>
          )}
        </button>
      )}
    </div>
  );
}
