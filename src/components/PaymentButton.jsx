"use client";

import { useEffect, useState } from "react";
import { invoice } from "@telegram-apps/sdk";
import { useStore } from "@/contexts/StoreContext";

// TON Connect manifest
const MANIFEST_URL = "/tonconnect-manifest.json";

export default function PaymentButton() {
  const { user } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  // Initialize TON Connect
  useEffect(() => {
    const initTonConnect = async () => {
      if (typeof window !== 'undefined') {
        try {
          // Load TonConnect SDK
          const TonConnect = (await import('@tonconnect/sdk')).TonConnect;
          
          // Initialize connector
          const connector = new TonConnect({
            manifestUrl: MANIFEST_URL
          });

          // Store the connector instance
          window.tonConnector = connector;

          // Listen for wallet events
          connector.onStatusChange(wallet => {
            if (wallet) {
              console.log('Wallet connected:', wallet);
            } else {
              console.log('Wallet disconnected');
            }
          });
        } catch (error) {
          console.error('Failed to initialize TON Connect:', error);
        }
      }
    };

    initTonConnect();
  }, []);

  // Check payment status
  useEffect(() => {
    let intervalId;
    
    if (paymentData?.paymentId && status === 'pending') {
      intervalId = setInterval(async () => {
        try {
          const response = await fetch('/api/check-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentId: paymentData.paymentId,
              userId: user?.telegramId,
              method: 'ton'
            })
          });

          const data = await response.json();
          if (data.status === 'paid') {
            setStatus('paid');
            clearInterval(intervalId);
          } else if (data.status === 'failed') {
            setStatus('failed');
            clearInterval(intervalId);
          }
        } catch (error) {
          console.error('Payment check error:', error);
        }
      }, 5000); // Check every 5 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [paymentData, status, user?.telegramId]);

  const handlePayment = async (method) => {
    setIsLoading(true);
    setStatus(null);
    setShowOptions(false);
    setPaymentData(null);
    
    try {
      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.telegramId,
          method,
        }),
      });

      const data = await response.json();

      if (method === 'ton') {
        if (!data.payload || !data.paymentId) {
          console.error("Failed to create TON payment");
          setStatus('failed');
          return;
        }

        // Store payment data for status checking
        setPaymentData(data);

        // Send transaction using TON Connect
        if (window.tonConnector) {
          try {
            // First try universal link approach
            const walletConnectionSource = {
              universalLink: 'https://app.tonkeeper.com/ton-connect',
              bridgeUrl: 'https://bridge.tonapi.io/bridge'
            };

            // Connect wallet if not connected
            if (!window.tonConnector.connected) {
              try {
                const connectResult = await window.tonConnector.connect(walletConnectionSource);
                if (!connectResult) {
                  throw new Error('Wallet connection failed');
                }
                // Wait a moment for the connection to be fully established
                await new Promise(resolve => setTimeout(resolve, 1000));
              } catch (connError) {
                console.error('Connection error:', connError);
                // If universal link fails, try extension as fallback
                try {
                  const extConnectResult = await window.tonConnector.connect({
                    jsBridgeKey: 'tonkeeper'
                  });
                  if (!extConnectResult) {
                    throw new Error('Wallet connection failed');
                  }
                  // Wait a moment for the connection to be fully established
                  await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (extError) {
                  throw new Error('No wallet available. Please install Tonkeeper or use universal link.');
                }
              }
            }

            // Double check connection before sending transaction
            if (!window.tonConnector.connected) {
              throw new Error('Wallet connection not established');
            }

            // Send transaction
            const result = await window.tonConnector.sendTransaction(data.payload);
            if (result) {
              console.log('Transaction sent:', result);
              setStatus('pending');
            } else {
              throw new Error('Transaction failed to send');
            }
          } catch (error) {
            console.error('TON Connect error:', error);
            // Show more user-friendly error message
            if (error.message.includes('No wallet available')) {
              setStatus('Please install Tonkeeper wallet or open in Tonkeeper browser');
            } else if (error.message.includes('Wallet connection')) {
              setStatus('Could not connect to wallet. Please try again.');
            } else if (error.message.includes('Transaction failed')) {
              setStatus('Transaction could not be sent. Please try again.');
            } else {
              setStatus('failed');
            }
          }
        } else {
          console.error('TON Connect not initialized');
          setStatus('failed');
        }
      } else if (method === 'invoice' && invoice.open.isAvailable()) {
        if (!data.url) {
          console.error("Failed to create invoice URL");
          setStatus('failed');
          return;
        }

        const invoiceStatus = await invoice.open(data.url, "url");
        setStatus(invoiceStatus);
        
        switch (invoiceStatus) {
          case 'paid':
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
          <button
            onClick={() => handlePayment('invoice')}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            <span className="text-lg">💳</span>
            Pay with Card
          </button>
          <button
            onClick={() => handlePayment('ton')}
            disabled={isLoading}
            className="bg-cyan-500 hover:bg-cyan-400 text-white px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            <span className="text-lg">💎</span>
            Pay with TON
          </button>
          <button
            onClick={() => setShowOptions(false)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      )}
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
