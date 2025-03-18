import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
const { UserManager } = require('@/utils/userManager');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { topic, messages, userId } = await request.json();

    if (!topic || !messages || !userId) {
      return NextResponse.json(
        { error: 'Topic, messages, and userId are required' },
        { status: 400 }
      );
    }

    // Check if user exists and is premium
    const user = await UserManager.getUser(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.isPremium) {
      return NextResponse.json(
        { error: "Premium subscription required" },
        { status: 403 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

    // Format the conversation history
    const conversationHistory = messages
      .map((msg: { role: string; content: string }) => 
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      )
      .join('\n');

    // Check if we're near the end of the dialogue (around 10 exchanges)
    const isNearEnd = messages.length >= 14; // 7 exchanges (14 messages)

    const prompt = `You are a helpful AI language tutor continuing a conversation about ${topic}.
    Previous conversation:
    ${conversationHistory}

    ${isNearEnd 
      ? 'This is the final exchange. Provide a natural response and then I will generate a summary.'
      : 'Continue the conversation naturally. Keep your response concise (1-2 sentences) and engaging.'}
    
    Maintain the same topic and ensure the conversation flows naturally.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // If this is the final exchange, generate a summary
    let summary = '';
    if (isNearEnd) {
      const summaryPrompt = `Based on the following conversation about ${topic}, provide a concise summary and recommendations for improvement:

      ${conversationHistory}
      Assistant: ${text}

      Please provide:
      1. A brief summary of the key points discussed (1-2 sentences). It should be short and concise.
      2. 4-5 specific recommendations for the user to improve their language skills
      3. Areas where the user showed strength
      4. Areas that need more practice
      5. based on dialogue content suggest 10 new words or phrases that the user can learn`;

      const summaryResult = await model.generateContent(summaryPrompt);
      const summaryResponse = await summaryResult.response;
      summary = summaryResponse.text();
    }

    return NextResponse.json({
      message: text,
      isComplete: isNearEnd,
      summary: summary
    });
  } catch (error) {
    console.error('Error in dialogue/chat:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
} 