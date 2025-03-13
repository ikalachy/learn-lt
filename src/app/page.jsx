"use client";

import Link from "next/link";
import {
  getProgress,
  getCompletedTopicsCount,
  getTotalCompletedTopics,
} from "@/utils/progressManager";

export default function HomePage() {
  const progress = getProgress();
  const lastViewedWords = progress?.lastViewedWords || {};

  // Calculate total topics started across all modes
  const totalStarted = Object.values(lastViewedWords).reduce(
    (total, modeProgress) => {
      return total + Object.keys(modeProgress).length;
    },
    0
  );

  // Get total completed topics
  const totalCompleted = getTotalCompletedTopics();

  return (
    <div className="min-h-screen bg-gray-100 py-5 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-5 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Your Progress</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{totalStarted}</p>
              <p className="text-gray-600">Topics Started</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {totalCompleted}
              </p>
              <p className="text-gray-600">Topics Completed</p>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          <Link href="/flashcards">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h2 className="text-2xl font-semibold mb-4">Flashcards</h2>
              <p className="text-gray-600">
                Practice Lithuanian words and phrases with interactive
                flashcards.
              </p>
              <div className="mt-4 space-y-1">
                <p className="text-sm text-gray-500">
                  {Object.keys(lastViewedWords.flashcards || {}).length} topics
                  started
                </p>
                <p className="text-sm text-green-600">
                  {getCompletedTopicsCount("flashcards")} topics completed
                </p>
              </div>
            </div>
          </Link>

          <Link href="/quiz">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h2 className="text-2xl font-semibold mb-4">Quiz Mode</h2>
              <p className="text-gray-600">
                Test your knowledge by choosing the correct translation.
              </p>
              <div className="mt-4 space-y-1">
                <p className="text-sm text-gray-500">
                  {Object.keys(lastViewedWords.quiz || {}).length} topics
                  started
                </p>
                <p className="text-sm text-green-600">
                  {getCompletedTopicsCount("quiz")} topics completed
                </p>
              </div>
            </div>
          </Link>

          <Link href="/typing">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h2 className="text-2xl font-semibold mb-4">Spell It!</h2>
              <p className="text-gray-600">
                Practice spelling Lithuanian words by selecting letters in the
                correct order.
              </p>
              <div className="mt-4 space-y-1">
                <p className="text-sm text-gray-500">
                  {Object.keys(lastViewedWords.typing || {}).length} topics
                  started
                </p>
                <p className="text-sm text-green-600">
                  {getCompletedTopicsCount("typing")} topics completed
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
