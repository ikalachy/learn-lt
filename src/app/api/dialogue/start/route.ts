import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
const { UserManager } = require('@/utils/userManager');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(request: Request) {
  try {
    const { topic, userId } = await request.json();

    if (!topic || !userId) {
      return NextResponse.json(
        { error: "Topic and userId are required" },
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

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const prompt = `Tu esi naudingas AI lietuvių kalbos mokytojas. Pradėk pokalbį apie **${topic}**.
    Naudok paprastus žodžius ir trumpus sakinius.
    Užduok klausimus, į kuriuos lengva atsakyti A1-A2 lygiu.
    Sukurk pokalbį, kuris tęsis apie 5-7 kartus.
    Būk draugiškas ir palaikantis.
    Visada kalbėk lietuviškai.
    
    Prašau laikytis pasirinktos temos **"${topic}"** viso pokalbio metu. 
    Jei vartotojas bando kalbėti kita tema, primink grįžti prie temos sakydamas: 
    *"Atsiprašau, kalbėkime apie ${topic}."*
    
    Jei vartotojas pradeda kalbėti kita kalba, mandagiai paprašyk grįžti prie lietuvių kalbos, sakydamas: 
    *"Pabandykime kalbėti lietuviškai."*
    
    Pavyzdys:
    AI: Labas! Ar mėgstate **${topic}**?
    Vartotojas: (atsako)
    AI: (tęsia pokalbį, užduoda kitą paprastą klausimą apie **${topic}**).`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ message: text });
  } catch (error) {
    console.error("Error in dialogue/start:", error);
    return NextResponse.json(
      { error: "Failed to start dialogue" },
      { status: 500 }
    );
  }
}
