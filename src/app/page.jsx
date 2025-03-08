'use client';

import Link from 'next/link';
import { getProgress } from '@/utils/progressManager';

export default function HomePage() {
  const progress = getProgress();
  const totalWords = progress?.seenWords.length || 0;
  const wordsToReview = progress?.incorrectWords.length || 0;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Learn Lithuanian</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <Link href="/flashcards">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h2 className="text-2xl font-semibold mb-4">Flashcards</h2>
              <p className="text-gray-600">Practice Lithuanian words and phrases with interactive flashcards.</p>
            </div>
          </Link>

          <Link href="/quiz">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h2 className="text-2xl font-semibold mb-4">Quiz Mode</h2>
              <p className="text-gray-600">Test your knowledge by choosing the correct translation.</p>
            </div>
          </Link>
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Your Progress</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{totalWords}</p>
              <p className="text-gray-600">Words Learned</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{wordsToReview}</p>
              <p className="text-gray-600">Words to Review</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 