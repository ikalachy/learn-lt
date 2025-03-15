"use client";

import { useEffect, useState } from "react";
import { invoice } from "@telegram-apps/sdk";
import { useStore } from "@/contexts/StoreContext";

export default function PaymentButton() {
  const { user } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handlePayment = async () => {
    setIsLoading(true);
    setStatus(null);
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
      if (data.url && invoice.open.isAvailable()) {
        const invoiceStatus = await invoice.open(data.url, "url");
        setStatus(invoiceStatus);
        
        switch (invoiceStatus) {
          case 'paid':
            // Payment successful, you might want to refresh user data or show success message
            console.log('Payment successful!');
            break;
          case 'failed':
            console.error('Payment failed');
            break;
          case 'pending':
            console.log('Payment is pending');
            break;
          case 'cancelled':
            console.log('Payment was cancelled');
            break;
          default:
            console.log('Payment status:', invoiceStatus);
        }
      } else {
        console.error("Failed to create payment URL");
        setStatus('failed');
      }
    } catch (error) {
      console.error("Payment error:", error);
      setStatus('failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
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
      {status && (
        <div className={`text-sm ${
          status === 'paid' ? 'text-green-600' :
          status === 'failed' ? 'text-red-600' :
          status === 'pending' ? 'text-yellow-600' :
          status === 'cancelled' ? 'text-gray-600' :
          'text-blue-600'
        }`}>
          {status === 'paid' && '✓ Payment successful!'}
          {status === 'failed' && '✕ Payment failed. Please try again.'}
          {status === 'pending' && '⏳ Payment is being processed...'}
          {status === 'cancelled' && '○ Payment was cancelled'}
          {!['paid', 'failed', 'pending', 'cancelled'].includes(status) && `Status: ${status}`}
        </div>
      )}
    </div>
  );
}
