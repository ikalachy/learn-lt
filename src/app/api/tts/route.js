"use server";
import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';
import phrases from '@/data/phrases.json';

// Create cache directory if it doesn't exist
const CACHE_DIR = path.join(process.cwd(), 'public', 'audio-cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Helper function to get text by ID
function getTextById(id) {
  const phrase = phrases.phrases.find(p => p.id === id);
  return phrase?.lt;
}

// Helper function to check if file exists in cache
function getCachedAudio(id) {
  const filepath = path.join(CACHE_DIR, `${id}.mp3`);
  
  if (fs.existsSync(filepath)) {
    const audioContent = fs.readFileSync(filepath);
    return audioContent.toString('base64');
  }
  return null;
}

// Helper function to save audio to cache
function saveToCache(id, audioContent) {
  const filepath = path.join(CACHE_DIR, `${id}.mp3`);
  fs.writeFileSync(filepath, Buffer.from(audioContent, 'base64'));
}

export async function POST(request) {
  try {
    const { id } = await request.json();
    console.log("phrase ID:", id);

    const text = getTextById(id);
    if (!text) {
      throw new Error("Invalid phrase ID");
    }

    // Check cache first
    const cachedAudio = getCachedAudio(id);
    if (cachedAudio) {
      console.log("Using cached audio for ID:", id);
      return NextResponse.json({ audio: cachedAudio });
    }

    // Get the API key from environment variable
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      throw new Error("Missing Google API key");
    }

    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        input: { text },
        voice: { 
          languageCode: "lt-LT",
          name: "lt-LT-Standard-A"
        },
        audioConfig: { 
          audioEncoding: "MP3"
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to generate speech");
    }

    const data = await response.json();
    
    // Save to cache
    saveToCache(id, data.audioContent);
    console.log("Saved audio to cache for ID:", id);

    return NextResponse.json({ audio: data.audioContent });
  } catch (error) {
    console.error("Text-to-speech error:", error);
    return NextResponse.json(
      { error: "Failed to generate speech", details: error.message },
      { status: 500 }
    );
  }
}
