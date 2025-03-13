"use client";

import { useState, useEffect } from "react";
import FlipCard from "@/components/FlipCard";
import {
  updateProgress,
  getLastWordId,
  saveLastWordId,
} from "@/utils/progressManager";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTopic } from "@/contexts/TopicContext";
import TopicSelector from "@/components/TopicSelector";

export default function FlashcardsPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [availablePhrases, setAvailablePhrases] = useState([]);
  const [isLastWord, setIsLastWord] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFullTopicSelector, setShowFullTopicSelector] = useState(false);
  const { selectedLanguage } = useLanguage();
  const { selectedTopic, selectTopic, loading } = useTopic();

  useEffect(() => {
    const loadPhrases = async () => {
      if (!selectedTopic) {
        setAvailablePhrases([]);
        return;
      }

      try {
        const response = await fetch(`/api/topics/${selectedTopic}`);
        const topicData = await response.json();
        setAvailablePhrases(topicData.phrases);

        // Find index of last viewed word
        const lastWordId = getLastWordId("flashcards", selectedTopic);
        const lastIndex = lastWordId
          ? topicData.phrases.findIndex((p) => p.id === lastWordId)
          : 0;
        const newIndex = lastIndex >= 0 ? lastIndex : 0;
        setCurrentIndex(newIndex);

        // Check if we're on the last word
        setIsLastWord(newIndex === topicData.phrases.length - 1);
      } catch (error) {
        console.error("Error loading phrases:", error);
      }
    };

    loadPhrases();
  }, [selectedTopic]);

  const handleNext = () => {
    if (currentIndex < availablePhrases.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setShowControls(false);
      setIsLastWord(newIndex === availablePhrases.length - 1);
      // Save progress with total words count and current index
      saveLastWordId(
        "flashcards",
        selectedTopic,
        availablePhrases[newIndex].id,
        availablePhrases.length,
        newIndex
      );
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setShowControls(false);
      setIsLastWord(newIndex === availablePhrases.length - 1);
      // Save progress with total words count and current index
      saveLastWordId(
        "flashcards",
        selectedTopic,
        availablePhrases[newIndex].id,
        availablePhrases.length,
        newIndex
      );
    }
  };

  const handleFlip = (isFlipped) => {
    setShowControls(isFlipped);
    if (isFlipped && availablePhrases[currentIndex]) {
      updateProgress(availablePhrases[currentIndex].id, true);
      // Save progress with total words count and current index
      saveLastWordId(
        "flashcards",
        selectedTopic,
        availablePhrases[currentIndex].id,
        availablePhrases.length,
        currentIndex
      );

      // If this is the last word and it's flipped, mark as completed
      if (isLastWord) {
        setIsCompleted(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-3 px-4">
      <div className="max-w-[480px] mx-auto">
        {!showFullTopicSelector && selectedTopic && <TopicSelector />}

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
        ) : availablePhrases.length === 0 ? (
          <div className="text-center text-gray-600">Loading phrases...</div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-500 w-24">
                Card {currentIndex + 1} of {availablePhrases.length}
              </p>
              <div className="h-3 flex-grow mx-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-blue-500 transition-all duration-300 shadow-sm"
                  style={{
                    width: `${
                      ((currentIndex + 1) / availablePhrases.length) * 100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              {isCompleted ? (
                <div className="relative overflow-hidden min-h-[400px] flex flex-col items-center justify-center">
                  {/* Background confetti effect */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-0 animate-float">
                      <span className="text-4xl opacity-30">🎉</span>
                    </div>
                    <div className="absolute bottom-0 right-0 animate-float-delayed">
                      <span className="text-4xl opacity-30">✨</span>
                    </div>
                  </div>

                  {/* Main content */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="relative mb-8">
                      <div className="w-10 h-10">
                        <div className="absolute inset-0 animate-bounce">
                          <span className="text-5xl">🎉</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 text-center">
                      <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500">
                        Congratulations!
                      </h3>
                      <p className="text-gray-600 text-lg">
                        You've completed all cards in this topic!
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 max-w-[300px] mt-8">
                      <button
                        onClick={() => {
                          setCurrentIndex(0);
                          setIsCompleted(false);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        Review Topic Again
                      </button>
                      <button
                        onClick={() => (window.location.href = "/quiz")}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        Take a Quiz
                      </button>
                      <button
                        onClick={() => {
                          setShowFullTopicSelector(true);
                          selectTopic(null);
                          setIsCompleted(false);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        Choose New Topic
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <FlipCard
                    key={availablePhrases[currentIndex].id}
                    id={availablePhrases[currentIndex].id}
                    topic={selectedTopic}
                    frontText={availablePhrases[currentIndex].lt}
                    backText={availablePhrases[currentIndex][selectedLanguage]}
                    selectedLanguage={selectedLanguage}
                    onFlip={handleFlip}
                  />

                  <div className="flex justify-center gap-4 mt-6">
                    <button
                      onClick={handlePrevious}
                      disabled={currentIndex === 0}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 hover:bg-blue-600 transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={currentIndex === availablePhrases.length - 1}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 hover:bg-blue-600 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {showFullTopicSelector && (
          <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
            <div className="max-w-[480px] mx-auto p-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Choose a Topic</h2>
                <button
                  onClick={() => setShowFullTopicSelector(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
              <TopicSelector 
                isFullPage={true} 
                onTopicSelect={() => setShowFullTopicSelector(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
