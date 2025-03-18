"use client";

import { useStore } from "@/contexts/StoreContext";
import { CHAIN, TonConnectButton, useTonConnectUI } from "@/tonconnect";
import { toNano } from "ton-core";
import { useState } from "react";
import { beginCell } from "@ton/ton";

const TON_NETWORK = process.env.TON_NETWORK || "testnet";

// const boc =
//   "te6cckEBBAEAzAAB5YgBT0te3ralFidB9QOahqlQVxLn4gi0Zmdi5DDGiE3uIhgDm0s7c///+Is+ypmYAAAANNY6pNs8lNZvYtgoFuPcSDnpIys9OsEcBanFXU8e364d94ENs2YxIoyu5pJ+HiAkozPmPc0QbH/VCehAZ6ChpBcBAgoOw8htAwIDAAAAkkIAJAISLZhw+HX7kA6xkp6uixFGNM+3lDZI2JpBPVLcJnMgL68IAAAAAAAAAAAAAAAAAAAAAAAAcHJlbWl1bV83NjU2NjM4MjSGtAfp";

const TON_PRICE = 2; // Price in TON

function PaymentInfoPopup({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          How to Pay with TON
        </h3>
        
        <div className="space-y-4 -ml-1">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <p className="font-medium text-gray-900">Connect Telegram Wallet</p>
              <p className="text-sm text-gray-600">
                Click the "Connect Wallet" button to link your Telegram wallet
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <p className="font-medium text-gray-900">Confirm Payment</p>
              <p className="text-sm text-gray-600">
                Review the payment details and confirm the transaction in your wallet
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <p className="font-medium text-gray-900">Get Premium Access</p>
              <p className="text-sm text-gray-600">
                Once payment is confirmed, you'll get immediate access to premium features
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 Payment is processed securely through Telegram's TON blockchain. 
            Make sure you have enough TON in your wallet before proceeding.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentButton() {
  const { user, setUser } = useStore();
  const [tonConnectUI] = useTonConnectUI();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);

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
    <div className="flex flex-col items-center p-3 sm:p-4 bg-gradient-to-b from-white to-gray-50 rounded-xl shadow-lg">
      <div className="w-full flex justify-between items-start mb-4">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
            Unlock Premium Features
          </h2>
          <p className="text-gray-600 text-base sm:text-lg mb-2">
            Level up your Lithuanian
          </p>
        </div>
      </div>

      <div className="w-full max-w-md space-y-3">
        <div className="backdrop-blur-s2m rounded-lg p-3 sm:p-4">
          <ul className="space-y-2">
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

        <div className="flex flex-col items-center gap-2">
          {!tonConnectUI.connected && (
            <div className="text-center mb-2 flex flex-col items-center">
              <div className="flex justify-center">
                <TonConnectButton />
              </div>
              <button
                onClick={() => setShowPaymentInfo(true)}
                className="mt-2 text-xs text-blue-600 hover:text-blue-700 underline"
              >
                How to pay with TON?
              </button>
            </div>
          )}
          
          {tonConnectUI.connected && !user?.isPremium && (
            <div className="w-full">
              <p className="text-sm text-gray-600 mb-2 text-center">
                Click below to pay {TON_PRICE} TON using your connected wallet
              </p>
              <button
                onClick={handlePayment}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium text-base sm:text-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:shadow-md flex items-center justify-center gap-2 group"
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
            </div>
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

      <PaymentInfoPopup 
        isOpen={showPaymentInfo} 
        onClose={() => setShowPaymentInfo(false)} 
      />
    </div>
  );
}
