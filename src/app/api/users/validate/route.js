const { NextResponse } = require('next/server');
const { UserManager } = require('@/utils/userManager');

async function POST(request) {
  try {
    const { initData } = await request.json();

    if (!initData) {
      return NextResponse.json(
        { error: 'Telegram initData is required' },
        { status: 400 }
      );
    }

    const userData = await UserManager.validateAndGetUser(initData);

    if (!userData) {
      return NextResponse.json(
        { error: 'Invalid authentication or user not found' },
        { status: 401 }
      );
    }

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error validating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

module.exports = { POST }; 