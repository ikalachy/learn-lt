"use server";
import { NextResponse } from "next/server";
import phrases from '@/data/phrases.json';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_WEBHOOK_URL = process.env.TELEGRAM_WEBHOOK_URL;

// Helper function to send message to Telegram
async function sendTelegramMessage(chatId, text, replyToMessageId = null) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      reply_to_message_id: replyToMessageId,
      parse_mode: 'HTML'
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send message: ${response.statusText}`);
  }

  return response.json();
}

// Helper function to get random phrase
function getRandomPhrase() {
  const randomIndex = Math.floor(Math.random() * phrases.phrases.length);
  const phrase = phrases.phrases[randomIndex];
  return {
    id: phrase.id,
    lt: phrase.lt,
    en: phrase.en,
    ru: phrase.ru,
    by: phrase.by
  };
}

export async function POST(request) {
  try {
    const update = await request.json();
    console.log('Received Telegram update:', update);

    // Handle only message updates
    if (!update.message) {
      return NextResponse.json({ ok: true });
    }

    const { message } = update;
    const { chat, text, from } = message;
    const chatId = chat.id;

    // Handle /start command
    if (text === '/start') {
      await sendTelegramMessage(
        chatId,
        'Welcome to Lithuanian Phrases Bot! 🇱🇹\n\n' +
        'Available commands:\n' +
        '/phrase - Get a random phrase\n' +
        '/help - Show this help message'
      );
      return NextResponse.json({ ok: true });
    }

    // Handle /help command
    if (text === '/help') {
      await sendTelegramMessage(
        chatId,
        'Available commands:\n' +
        '/phrase - Get a random phrase\n' +
        '/help - Show this help message'
      );
      return NextResponse.json({ ok: true });
    }

    // Handle /phrase command
    if (text === '/phrase') {
      const phrase = getRandomPhrase();
      const message = 
        `<b>Lithuanian:</b> ${phrase.lt}\n\n` +
        `<b>English:</b> ${phrase.en}\n` +
        `<b>Russian:</b> ${phrase.ru}\n` +
        `<b>Belarusian:</b> ${phrase.by}`;

      await sendTelegramMessage(chatId, message);
      return NextResponse.json({ ok: true });
    }

    // Handle unknown commands
    if (text?.startsWith('/')) {
      await sendTelegramMessage(
        chatId,
        'Unknown command. Use /help to see available commands.'
      );
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error processing Telegram update:', error);
    return NextResponse.json(
      { error: 'Failed to process update', details: error.message },
      { status: 500 }
    );
  }
} 