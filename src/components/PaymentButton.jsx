"use client";

import { useStore } from "@/contexts/StoreContext";
import { CHAIN, TonConnectButton, useTonConnectUI } from "@/tonconnect";
import { toNano } from "ton-core";
import { useState } from "react";

const BOT_USERNAME =
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "LearnLTBot";
const TON_NETWORK = process.env.TON_NETWORK || "testnet";

const TON_PRICE = 0.1; // Price in TON

export default function PaymentButton() {
  const { user, setUser } = useStore();
  const [tonConnectUI] = useTonConnectUI();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handlePayment = async () => {
    setIsLoading(true);
    setStatus(null);
    try {
      const transactionData = {
        validUntil: Date.now() + 5 * 60 * 1000, // 5 minutes
        network: TON_NETWORK === "mainnet" ? CHAIN.MAINNET : CHAIN.TESTNET,
        messages: [
          {
            address: process.env.NEXT_PUBLIC_OWNER_WALLET,
            amount: toNano(TON_PRICE).toString(),
            // payload: `premium_${user?.telegramId}`.toString("base64") // payload with comment in body ,
          },
        ],
      };

      const result = await tonConnectUI.sendTransaction(transactionData, {
        returnStrategy: "https://t.me/LearnLTBot",
      });

      console.log(result.boc);
      // Call backend to validate transaction
      const response = await fetch("/api/payments/ton/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          signedBoc: result.boc,
          userId: user?.telegramId,
        }),
      });

      const responseData = await response.json();

      if (responseData.success) {
        setStatus("success");
        // Update user in store with premium status
        setUser({
          ...user,
          isPremium: true,
          subscriptionDate: new Date().toISOString(),
        });
      } else {
        setStatus("error");
        console.error("Payment validation failed:", responseData.error);
      }
    } catch (error) {
      console.error("Transaction error:", error);
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-center">
        <TonConnectButton />
      </div>
      <button onClick={() => handlePayment()}>Pay</button>
      {tonConnectUI.connected && !user?.isPremium && (
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

      {status === "success" && (
        <div className="text-green-600 font-medium">
          Payment successful! You now have premium access.
        </div>
      )}

      {status === "error" && (
        <div className="text-red-600 font-medium">
          Payment failed. Please try again or contact support.
        </div>
      )}
    </div>
  );
}
