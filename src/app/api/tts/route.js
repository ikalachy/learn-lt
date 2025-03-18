"use server";
import { NextResponse } from "next/server";
import { put, list } from "@vercel/blob";
import fs from "fs";
import path from "path";
import phrases from "@/data/phrases.json";

const isDevelopment = process.env.NODE_ENV === "development";
const CACHE_DIR = path.join(process.cwd(), "public", "audio-cache");

// Create cache directory if it doesn't exist (for development)
if (isDevelopment && !fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Helper function to get text by ID and topic
async function getTextById(id, topic, content = null) {
  try {
    if (content) {
      return content;
    }
    // Import the topic-specific file
    const topicData = await import(`@/data/topics/basic/${topic}.json`);
    const phrase = topicData.phrases.find((p) => p.id === id);
    return phrase?.lt;
  } catch (error) {
    console.error(`Error loading topic file for ${topic}:`, error);
    return null;
  }
}

// Helper function to check if file exists in cache
async function getCachedAudio(id, topic, content = null) {
  if (content) {
    return null;
  }
  const cacheKey = `${topic}_${id}`;

  if (isDevelopment) {
    // Local storage in development
    const filepath = path.join(CACHE_DIR, `${cacheKey}.mp3`);
    if (fs.existsSync(filepath)) {
      const audioContent = fs.readFileSync(filepath);
      return audioContent.toString("base64");
    }
    return null;
  } else {
    // Vercel Blob in production
    try {
      const { blobs } = await list({ prefix: `audio/${cacheKey}` });
      if (blobs.length > 0) {
        const response = await fetch(blobs[0].url);
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer).toString("base64");
      }
      return null;
    } catch (error) {
      console.error("Error checking blob cache:", error);
      return null;
    }
  }
}

// Helper function to save audio to cache
async function saveToCache(id, topic, audioContent) {
  const cacheKey = `${topic}_${id}`;

  if (isDevelopment) {
    // Local storage in development
    const filepath = path.join(CACHE_DIR, `${cacheKey}.mp3`);
    fs.writeFileSync(filepath, Buffer.from(audioContent, "base64"));
    return filepath;
  } else {
    // Vercel Blob in production
    try {
      const { url } = await put(
        `audio/${cacheKey}.mp3`,
        Buffer.from(audioContent, "base64"),
        {
          access: "public",
          contentType: "audio/mp3",
        }
      );
      return url;
    } catch (error) {
      console.error("Error saving to blob storage:", error);
      throw error;
    }
  }
}

export async function POST(request) {
  try {
    const { id, topic, content = null } = await request.json();
    console.log("phrase ID:", id, "topic:", topic);

    if (!topic) {
      throw new Error("Topic is required");
    }

    const text = await getTextById(id, topic, content);
    if (!text) {
      throw new Error("Invalid phrase ID or topic");
    }

    // Check cache first
    const cachedAudio = await getCachedAudio(id, topic, content);
    if (cachedAudio) {
      console.log(
        `Using cached audio for ID: ${id} in topic: ${topic} (${
          isDevelopment ? "local" : "blob"
        } storage)`
      );
      return NextResponse.json({ audio: cachedAudio });
    }

    // Get the API key from environment variable
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      throw new Error("Missing Google API key");
    }

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: "lt-LT",
            name: "lt-LT-Standard-A",
          },
          audioConfig: {
            audioEncoding: "MP3",
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to generate speech");
    }

    const data = await response.json();

    // Save to cache
    if (!content) {
      const cachePath = await saveToCache(id, topic, data.audioContent);
      console.log(
        `Saved audio to cache for ID: ${id} in topic: ${topic} (${
          isDevelopment ? "local" : "blob"
        } storage) at ${cachePath}`
      );
    }

    return NextResponse.json({ audio: data.audioContent });
  } catch (error) {
    console.error("Text-to-speech error:", error);
    return NextResponse.json(
      { error: "Failed to generate speech", details: error.message },
      { status: 500 }
    );
  }
}
