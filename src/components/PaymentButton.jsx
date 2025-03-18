"use client";

import { useStore } from "@/contexts/StoreContext";
import { CHAIN, TonConnectButton, useTonConnectUI } from "@/tonconnect";
import { toNano } from "ton-core";
import { useState } from "react";

const BOT_USERNAME =
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "LearnLTBot";
const TON_NETWORK = process.env.TON_NETWORK || "testnet";

const boc =
  // "te6cckECGQEAA2YAA+eIAU9LXt62pRYnQfUDmoapUFcS5+IItGZnYuQwxohN7iIYEY5tLO3P///iP////+AAAAATepimN8bHZTA6el+C9hauQhRrycbyLO8jAlFW16vHstM4BqyGuDhnLsmJFGL6sQABMVAprp/JreJN/YImy/awLAEVFgEU/wD0pBP0vPLICwICASADDgIBSAQFAtzQINdJwSCRW49jINcLHyCCEGV4dG69IYIQc2ludL2wkl8D4IIQZXh0brqOtIAg1yEB0HTXIfpAMPpE+Cj6RDBYvZFb4O1E0IEBQdch9AWDB/QOb6ExkTDhgEDXIXB/2zzgMSDXSYECgLmRMOBw4hEQAgEgBg0CASAHCgIBbggJABmtznaiaEAg65Drhf/AABmvHfaiaEAQ65DrhY/AAgFICwwAF7Ml+1E0HHXIdcLH4AARsmL7UTQ1woAgABm+Xw9qJoQICg65D6AsAQLyDwEeINcLH4IQc2lnbrry4Ip/EAHmjvDtou37IYMI1yICgwjXIyCAINch0x/TH9Mf7UTQ0gDTHyDTH9P/1woACvkBQMz5EJoolF8K2zHh8sCH3wKzUAew8tCEUSW68uCFUDa68uCG+CO78tCIIpL4AN4BpH/IygDLHwHPFsntVCCS+A/ecNs82BED9u2i7fsC9AQhbpJsIY5MAiHXOTBwlCHHALOOLQHXKCB2HkNsINdJwAjy4JMg10rAAvLgkyDXHQbHEsIAUjCw8tCJ10zXOTABpOhsEoQHu/Lgk9dKwADy4JPtVeLSAAHAAJFb4OvXLAgUIJFwlgHXLAgcEuJSELHjDyDXShITFACWAfpAAfpE+Cj6RDBYuvLgke1E0IEBQdcY9AUEnX/IygBABIMH9FPy4IuOFAODB/Rb8uCMItcKACFuAbOw8tCQ4shQA88WEvQAye1UAHIw1ywIJI4tIfLgktIA7UTQ0gBRE7ry0I9UUDCRMZwBgQFA1yHXCgDy4I7iyMoAWM8Wye1Uk/LAjeIAEJNb2zHh10zQAFGAAAAAP///iOqpVFeyWOS2ZhaNXg1sW9FkZJ1GVJewbKlv+6uDqs/woAIKDsPIbQMXGAAAAGhCACQCEi2YcPh1+5AOsZKerosRRjTPt5Q2SNiaQT1S3CZzIC+vCAAAAAAAAAAAAAAAAAAAS34S9Q==";
  "te6cckEBBAEAtwAB5YgBT0te3ralFidB9QOahqlQVxLn4gi0Zmdi5DDGiE3uIhgDm0s7c///+Is+w33IAAAAJNiaH6CAXz8FPUvFDNfOula/200aDzwWU4vwej3ZrC9eTX+fR7PQtwAA33RBKUvf0khgDRWgCj9YddAAYQCvJAsBAgoOw8htAwIDAAAAaEIAJAISLZhw+HX7kA6xkp6uixFGNM+3lDZI2JpBPVLcJnMgL68IAAAAAAAAAAAAAAAAAAAk+lG8"

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
  const handlePaymentTest = async () => {
    setIsLoading(true);
    setStatus(null);

    // Call backend to validate transaction
    const response = await fetch("/api/payments/ton/callback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        signedBoc: boc,
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
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-center">
        <TonConnectButton />
      </div>
      <button onClick={() => handlePaymentTest()}>Pay</button>
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
