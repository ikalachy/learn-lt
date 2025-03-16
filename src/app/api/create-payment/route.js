import { NextResponse } from 'next/server';

const PREMIUM_PRICE = 5; // Price in USD
const TON_PRICE = 2.5; // Price in TON
const BOT_USERNAME = "LearnLithuanianBot"; // Replace with your bot username
const MERCHANT_USERNAME = "ton_pay_bot"; // For TON payments

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
      // Create TON payment URL
      // Format: https://t.me/ton_pay_bot/start?amount=123&recipient=botUsername&comment=userId
      const amount = TON_PRICE;
      const comment = `premium_${userId}`; // This will help identify the payment
      
      const tonUrl = `https://t.me/${MERCHANT_USERNAME}/start?` + 
        new URLSearchParams({
          amount: amount.toString(),
          recipient: BOT_USERNAME,
          comment: comment
        }).toString();

      return NextResponse.json({ url: tonUrl });
    } else if (method === "invoice") {
      // Create Telegram Payment URL
      // You should have a proper invoice creation endpoint in your bot
      const invoiceUrl = `https://t.me/${BOT_USERNAME}/pay?` + 
        new URLSearchParams({
          userId: userId,
          amount: PREMIUM_PRICE.toString(),
          currency: "USD",
          description: "Premium Subscription"
        }).toString();

      return NextResponse.json({ url: invoiceUrl });
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