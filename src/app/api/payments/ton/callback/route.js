import { NextResponse } from 'next/server';
import { verifyTransaction } from '@/lib/ton';
import { UserManager } from '@/utils/userManager';

export async function POST(request) {
  try {
    const { signedBoc, userId } = await request.json();

    if (!signedBoc || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the transaction
    const isValid = await verifyTransaction(signedBoc, userId);
    
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid transaction' },
        { status: 400 }
      );
    }

    // Update user premium status using UserManager
    const updatedUser = await UserManager.updateUser(userId, {
      isPremium: true,
      subscriptionDate: new Date(),
    });

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'Failed to update user status' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
} 