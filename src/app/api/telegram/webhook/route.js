"use server";
import { NextResponse } from "next/server";
import phrases from '@/data/phrases.json';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_WEBHOOK_URL = process.env.TELEGRAM_WEBHOOK_URL;
const TON_PRICE = process.env.TON_PRICE || 2.5; // Price in TON
const WALLET_ADDRESS = process.env.OWNER_WALLET;

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

// Command handlers
async function handlePremiumCommand(message) {
  const chatId = message.chat.id;
  const messageId = message.message_id;

  // Create payment buttons with both direct TON link and verification
  const keyboard = {
    inline_keyboard: [
      [
        {
          text: `Open TON Wallet`,
          url: `ton://transfer/${WALLET_ADDRESS}?amount=${Math.floor(TON_PRICE * 1000000000)}&text=premium_${chatId}`
        }
      ],
      [
        {
          text: "✅ Check Payment Status",
          callback_data: `check_payment:${chatId}`
        }
      ]
    ]
  };

  // Send response message with payment info
  return fetch(
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
              `💳 Wallet: \`${WALLET_ADDRESS}\`\n\n` +
              `To complete your payment:\n` +
              `1. Click "Open TON Wallet" to make the transfer\n` +
              `2. After sending, click "Check Payment Status"\n\n` +
              `Your payment will be verified automatically.`,
        reply_markup: keyboard
      }),
    }
  );
}

// Handle callback queries
async function handleCallbackQuery(callbackQuery) {
  const { id, data, message } = callbackQuery;
  
  if (data.startsWith('check_payment:')) {
    const chatId = data.split(':')[1];
    
    try {
      // Here you would check your transaction history
      // This is a placeholder - you need to implement actual transaction checking
      const isPaymentReceived = false; // Replace with actual check
      
      if (isPaymentReceived) {
        // Update message to show success
        await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chat_id: message.chat.id,
              message_id: message.message_id,
              parse_mode: 'Markdown',
              text: `✅ *Payment Successful!*\n\n` +
                    `Thank you for upgrading to Premium.\n` +
                    `Your access has been activated.`
            })
          }
        );
      } else {
        // Send temporary response
        await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              callback_query_id: id,
              text: "Payment not found yet. Please wait a few minutes after sending and try again.",
              show_alert: true
            })
          }
        );
      }
    } catch (error) {
      console.error('Error checking payment:', error);
      // Send error response
      await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            callback_query_id: id,
            text: "Error checking payment status. Please try again.",
            show_alert: true
          })
        }
      );
    }
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    // Handle callback queries
    if (body.callback_query) {
      await handleCallbackQuery(body.callback_query);
      return NextResponse.json({ ok: true });
    }

    // Handle different types of updates
    if (body.message?.text) {
      const command = body.message.text.split(' ')[0].toLowerCase();
      
      switch (command) {
        case '/premium':
          const response = await handlePremiumCommand(body.message);
          const data = await response.json();
          return NextResponse.json(data);
        
        case '/start':
          await sendTelegramMessage(
            body.message.chat.id,
            'Welcome! Use /premium to upgrade your account.'
          );
          return NextResponse.json({ ok: true });
        
        case '/help':
          await sendTelegramMessage(
            body.message.chat.id,
            'Available commands:\n/premium - Upgrade to Premium\n/help - Show this message'
          );
          return NextResponse.json({ ok: true });
        
        default:
          // Handle unknown commands
          if (body.message.text.startsWith('/')) {
            await sendTelegramMessage(
              body.message.chat.id,
              'Unknown command. Use /help to see available commands.'
            );
          }
          return NextResponse.json({ ok: true });
      }
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ ok: false, error: 'Failed to process webhook' });
  }
} 