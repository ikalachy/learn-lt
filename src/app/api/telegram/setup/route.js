"use server";
import { NextResponse } from "next/server";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_WEBHOOK_URL = process.env.TELEGRAM_WEBHOOK_URL;

export async function GET() {
  try {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_WEBHOOK_URL) {
      throw new Error("Missing Telegram credentials");
    }

    // Set webhook URL
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: TELEGRAM_WEBHOOK_URL,
          allowed_updates: ['message']
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.description || 'Failed to set webhook');
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error setting up Telegram webhook:', error);
    return NextResponse.json(
      { error: 'Failed to set up webhook', details: error.message },
      { status: 500 }
    );
  }
} 