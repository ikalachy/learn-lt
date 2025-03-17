import { NextResponse } from 'next/server';

const TON_PRICE = process.env.TON_PRICE || 2.5; // Price in TON
const WALLET_ADDRESS = process.env.OWNER_WALLET;

export async function POST(req) {
  try {
    const body = await req.json();
    
    // Verify the transaction
    const { 
      address, // sender address
      amount, // in nanotons
      payload, // should be in format "premium_chatId"
      transaction_id
    } = body;

    // Verify amount (convert TON_PRICE to nanotons)
    const expectedAmount = Math.floor(TON_PRICE * 1000000000);
    if (amount < expectedAmount) {
      console.error('Invalid payment amount:', amount, 'expected:', expectedAmount);
      return NextResponse.json({ ok: false, error: 'Invalid payment amount' });
    }

    // Extract chat ID from payload
    if (!payload?.startsWith('premium_')) {
      console.error('Invalid payload format:', payload);
      return NextResponse.json({ ok: false, error: 'Invalid payload format' });
    }

    const chatId = payload.replace('premium_', '');

    // Update user's premium status
    // Here you would typically update your database
    // For this example, we'll just send a confirmation message

    // Send confirmation message
    const response = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          parse_mode: 'Markdown',
          text: `✨ *Payment Successful!*\n\n` +
                `Thank you for your payment of ${TON_PRICE} TON.\n` +
                `Your premium access has been activated.\n\n` +
                `Transaction ID: \`${transaction_id}\``
        }),
      }
    );

    const data = await response.json();
    
    // Store the transaction in your database
    // await db.transactions.create({
    //   userId: chatId,
    //   amount: TON_PRICE,
    //   transactionId: transaction_id,
    //   status: 'completed'
    // });

    // Update user's premium status
    // await db.users.update({
    //   where: { telegramId: chatId },
    //   data: { isPremium: true }
    // });

    return NextResponse.json({ ok: true, ...data });

  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.json({ ok: false, error: 'Failed to process payment callback' });
  }
} 