"use client";

import { useTopicStore } from "@/stores/topicStore";
import TopicSelector from "@/components/TopicSelector";
import Quiz from "@/components/Quiz";

export default function QuizPage() {
  const { selectedTopic, loading } = useTopicStore();

  return (
    <div className="min-h-screen bg-gray-100 py-3 px-4">
      <div className="max-w-[480px] mx-auto">
        {selectedTopic && <TopicSelector />}

        {!selectedTopic ? (
          <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
            <div className="max-w-[480px] mx-auto p-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Choose a Topic</h2>
              </div>
              <TopicSelector
                isFullPage={true}
                onTopicSelect={() => setShowFullTopicSelector(false)}
              />
            </div>
          </div>
        ) : loading ? (
          <div className="text-center text-gray-600">Loading topics...</div>
        ) : (
          <Quiz />
        )}
      </div>
    </div>
  );
}
