import { NextResponse } from 'next/server';

const PREMIUM_PRICE = process.env.PREMIUM_PRICE_USD || 5; // Price in USD
const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME;

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
      // For TON payments, we just return success as the bot will handle the actual payment
      return NextResponse.json({
        method: 'ton',
        status: 'redirect_to_bot'
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