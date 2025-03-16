import { NextResponse } from 'next/server';

const PREMIUM_PRICE = process.env.PREMIUM_PRICE_USD || 5; // Price in USD
const TON_PRICE = process.env.TON_PRICE || 2.5; // Price in TON
const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME;
const OWNER_WALLET = process.env.OWNER_WALLET;

export async function POST(req) {
  try {
    const { userId, method } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (method === "ton") {
      if (!OWNER_WALLET) {
        return NextResponse.json(
          { error: "Wallet configuration missing" },
          { status: 500 }
        );
      }

      // Generate unique payment ID
      const paymentId = `premium_${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      
      // Create TON Connect payment data
      const tonConnectPayload = {
        version: 2,
        network: process.env.TON_NETWORK || 'mainnet',
        transaction: {
          valid_until: Math.floor(Date.now() / 1000) + 3600, // Valid for 1 hour
          messages: [
            {
              address: OWNER_WALLET,
              amount: Math.floor(TON_PRICE * 1000000000).toString(), // Convert to nanotons
              payload: paymentId, // For payment identification
              stateInit: null
            }
          ]
        }
      };

      return NextResponse.json({
        method: 'ton_connect',
        payload: tonConnectPayload,
        paymentId,
        amount: TON_PRICE
      });
    } else if (method === "invoice") {
      // Create Telegram Payment invoice
      const response = await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/createInvoiceLink`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "Premium Subscription",
            description: "Unlock AI dialogues and premium features",
            payload: JSON.stringify({
              type: "premium_subscription",
              userId: userId,
            }),
            provider_token: process.env.TELEGRAM_PROVIDER_TOKEN,
            currency: "USD",
            prices: [
              {
                label: "Premium Access",
                amount: Math.round(PREMIUM_PRICE * 100), // Convert to cents
              },
            ],
          }),
        }
      );

      const data = await response.json();
      
      if (!data.ok) {
        console.error("Telegram API error:", data);
        return NextResponse.json(
          { error: "Failed to create invoice" },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        method: 'invoice',
        url: data.result 
      });
    } else {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
} 