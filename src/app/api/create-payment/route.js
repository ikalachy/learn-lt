import { NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PROVIDER_TOKEN = process.env.TELEGRAM_PROVIDER_TOKEN;

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const payload = {
      chat_id: userId,
      provider_token: PROVIDER_TOKEN,
      start_parameter: 'premium_subscription',
      title: 'Premium Subscription',
      description: 'Unlock AI dialogues and premium features',
      currency: 'EUR',
      prices: [{ label: 'Premium Access', amount: 499 }], // 4.99 EUR
      payload: JSON.stringify({
        unique_id: `${userId}_${Date.now()}`,
        user_id: userId,
      }),
    };

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/createInvoiceLink`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!data.ok) {
      console.error('Telegram API error:', data);
      return NextResponse.json(
        { error: 'Failed to create payment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: data.result });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 