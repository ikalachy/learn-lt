import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserManager } from "@/utils/userManager";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function POST(req) {
  try {
    const { topic, messages, userId } = await req.json();

    // Check if user exists and is premium
    const user = await UserManager.getUser(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.isPremium) {
      return NextResponse.json(
        { error: "Premium subscription required" },
        { status: 403 }
      );
    }

    const prompt = `You are a language learning assistant. Generate 10 important words or phrases from the following dialogue about ${topic}. For each word/phrase, provide:
1. The word/phrase in Lithuanian
2. Its translation in English
3. A short example sentence using the word/phrase

IMPORTANT: You must respond with a valid JSON object in the following format:
{
  "words": [
    {
      "word": "word in Lithuanian",
      "translation": "translation in English",
      "example": "example sentence"
    }
  ]
}

Here's the dialogue:
${messages.map((m) => `${m.role}: ${m.content}`).join("\n")}`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    const response = await result.response;
    const text = response.text();
    
    // Clean the response to ensure it's valid JSON
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    let jsonResponse;
    
    try {
      jsonResponse = JSON.parse(cleanedText);
    } catch (error) {
      console.error('Failed to parse JSON response:', error);
      return NextResponse.json(
        { error: "Failed to generate valid word list" },
        { status: 500 }
      );
    }

    // Validate the response structure
    if (!jsonResponse.words || !Array.isArray(jsonResponse.words)) {
      return NextResponse.json(
        { error: "Invalid response format" },
        { status: 500 }
      );
    }

    // Validate each word object
    for (const word of jsonResponse.words) {
      if (!word.word || !word.translation || !word.example) {
        return NextResponse.json(
          { error: "Invalid word object structure" },
          { status: 500 }
        );
      }
    }

    // Ensure we have exactly 10 words
    if (jsonResponse.words.length !== 10) {
      return NextResponse.json(
        { error: "Expected exactly 10 words" },
        { status: 500 }
      );
    }

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Error generating practice words:", error);
    return NextResponse.json(
      { error: "Failed to generate practice words" },
      { status: 500 }
    );
  }
}
