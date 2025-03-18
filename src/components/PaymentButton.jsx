"use client";

import { useStore } from "@/contexts/StoreContext";
import { CHAIN, TonConnectButton, useTonConnectUI } from "@/tonconnect";
import { toNano } from "ton-core";
import { useState } from "react";
import { beginCell } from "@ton/ton";

const TON_NETWORK = process.env.TON_NETWORK || "testnet";

// const boc =
//   "te6cckEBBAEAzAAB5YgBT0te3ralFidB9QOahqlQVxLn4gi0Zmdi5DDGiE3uIhgDm0s7c///+Is+ypmYAAAANNY6pNs8lNZvYtgoFuPcSDnpIys9OsEcBanFXU8e364d94ENs2YxIoyu5pJ+HiAkozPmPc0QbH/VCehAZ6ChpBcBAgoOw8htAwIDAAAAkkIAJAISLZhw+HX7kA6xkp6uixFGNM+3lDZI2JpBPVLcJnMgL68IAAAAAAAAAAAAAAAAAAAAAAAAcHJlbWl1bV83NjU2NjM4MjSGtAfp";

const TON_PRICE = process.env.TON_PRICE; // Price in TON

export default function PaymentButton() {
  const { user, setUser } = useStore();
  const [tonConnectUI] = useTonConnectUI();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handlePayment = async () => {
    setIsLoading(true);
    setStatus(null);
    try {
      const payload = beginCell()
        .storeUint(0, 32) // write 32 zero bits to indicate that a text comment will follow
        .storeStringTail(`premium_${user?.telegramId}`) // write our text comment
        .endCell();

      const transactionData = {
        validUntil: Date.now() + 5 * 60 * 1000, // 5 minutes
        network: TON_NETWORK === "mainnet" ? CHAIN.MAINNET : CHAIN.TESTNET,
        messages: [
          {
            address: process.env.NEXT_PUBLIC_OWNER_WALLET,
            amount: toNano(TON_PRICE).toString(),
            payload: payload.toBoc().toString("base64"), // payload with comment in body ,
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
    <div className="flex flex-col items-center p-4 sm:p-6 bg-gradient-to-b from-white to-gray-50 rounded-xl shadow-lg">
      <div className="w-full flex justify-between items-start mb-6">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Unlock Premium Features
          </h2>
          <p className="text-gray-600 text-base sm:text-lg">
            Level up your Lithuanian
          </p>
        </div>
        {tonConnectUI.connected && (
          <div className="ml-4">
            <TonConnectButton />
          </div>
        )}
      </div>

      <div className="w-full max-w-md space-y-4">
        <div className="backdrop-blur-s2m rounded-lg p-4 sm:p-6 ">
          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-gray-700 group">
              <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-100 text-green-600 group-hover:scale-110 transition-transform">
                ✓
              </span>
              <span className="text-base sm:text-lg">
                Unlimited AI conversations
              </span>
            </li>
            <li className="flex items-center gap-2 text-gray-700 group">
              <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-100 text-green-600 group-hover:scale-110 transition-transform">
                ✓
              </span>
              <span className="text-base sm:text-lg">
                Practice real-world scenarios
              </span>
            </li>
            <li className="flex items-center gap-2 text-gray-700 group">
              <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-100 text-green-600 group-hover:scale-110 transition-transform">
                ✓
              </span>
              <span className="text-base sm:text-lg">
                Improve speaking confidence
              </span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col items-center gap-3">
          {!tonConnectUI.connected && <TonConnectButton />}
          
          {tonConnectUI.connected && !user?.isPremium && (
            <button
              onClick={handlePayment}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-medium text-base sm:text-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:shadow-md flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span className="text-lg sm:text-xl">💎</span>
                  <span>Pay {TON_PRICE} TON</span>
                </>
              )}
            </button>
          )}

          {status === "success" && (
            <div className="flex items-center gap-2 text-green-600 font-medium text-base sm:text-lg">
              <span className="text-xl sm:text-2xl">✨</span>
              Payment successful! You now have premium access.
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-2 text-red-600 font-medium text-base sm:text-lg">
              <span className="text-xl sm:text-2xl">⚠️</span>
              Payment failed. Please try again or contact support.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
