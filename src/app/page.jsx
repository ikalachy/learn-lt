"use client";

import { useProgressStore } from "@/stores/progressStore";
import { useLanguageStore } from "@/stores/languageStore";
import { useTopicStore } from "@/stores/topicStore";
import Link from "next/link";

export default function HomePage() {
  const { selectedLanguage } = useLanguageStore();
  const { selectedTopic, selectTopic } = useTopicStore();
  const { 
    getProgress, 
    getCompletedTopicsCount, 
    getTotalCompletedTopics,
    getTopicSeenCount
  } = useProgressStore();

  const progress = getProgress();
  const totalStarted = Object.keys(progress.lastViewedWords || {}).length;
  const totalCompleted = getTotalCompletedTopics();

  const modes = [
    { id: 'flashcards', name: 'Flashcards', color: 'blue' },
    { id: 'quiz', name: 'Quiz', color: 'green' },
    { id: 'typing', name: 'Spell', color: 'purple' }
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-3 px-4">
      <div className="max-w-[480px] mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Learn Lithuanian</h1>
          
          {/* Overall Progress */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Topics Started</p>
              <p className="text-2xl font-bold text-blue-600">{totalStarted}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Topics Completed</p>
              <p className="text-2xl font-bold text-green-600">{totalCompleted}</p>
            </div>
          </div>

          {/* Mode-specific Progress */}
          <div className="space-y-4">
            {modes.map((mode) => {
              const completedCount = getCompletedTopicsCount(mode.id);
              const startedCount = Object.keys(progress.lastViewedWords?.[mode.id] || {}).length;
              
              return (
                <Link 
                  key={mode.id} 
                  href={`/${mode.id}`}
                  className="block"
                >
                  <div className={`bg-${mode.color}-50 p-4 rounded-lg transition-all hover:bg-${mode.color}-100`}>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-gray-700">{mode.name}</h3>
                      <span className={`text-${mode.color}-600 font-medium`}>
                        {completedCount}/{startedCount} completed
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`bg-${mode.color}-500 h-2 rounded-full`}
                        style={{ width: `${startedCount ? (completedCount / startedCount) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
