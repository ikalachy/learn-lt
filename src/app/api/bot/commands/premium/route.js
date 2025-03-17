import { NextResponse } from 'next/server';

const TON_PRICE = process.env.TON_PRICE || 2.5; // Price in TON
const WALLET_ADDRESS = process.env.OWNER_WALLET;

export async function POST(req) {
  try {
    const body = await req.json();
    
    // Verify this is a command from Telegram
    if (!body.message?.text?.startsWith('/premium')) {
      return NextResponse.json({ ok: false });
    }

    const chatId = body.message.chat.id;
    const messageId = body.message.message_id;

    // Create payment button with ton:// URL
    const keyboard = {
      inline_keyboard: [[
        {
          text: `Pay ${TON_PRICE} TON`,
          url: `ton://transfer/${WALLET_ADDRESS}?amount=${Math.floor(TON_PRICE * 1000000000)}&text=premium_${chatId}`
        }
      ]]
    };

    // Send response message with payment info
    const response = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          reply_to_message_id: messageId,
          parse_mode: 'Markdown',
          text: `🌟 *Upgrade to Premium*\n\n` +
                `Get unlimited access to AI dialogues and premium features!\n\n` +
                `💎 Price: ${TON_PRICE} TON\n` +
                `📝 Payment will be processed automatically\n\n` +
                `Click the button below to pay with your TON wallet:`,
          reply_markup: keyboard
        }),
      }
    );

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Premium command error:', error);
    return NextResponse.json({ ok: false, error: 'Failed to process premium command' });
  }
} 