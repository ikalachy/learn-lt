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
        <TopicSelector />

        {!selectedTopic ? (
          <div className="text-center text-gray-600">
            Please select a topic to start learning
          </div>
        ) : loading ? (
          <div className="text-center text-gray-600">Loading topics...</div>
        ) : availablePhrases.length === 0 ? (
          <div className="text-center text-gray-600">Loading phrases...</div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
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
              <FlipCard
                key={availablePhrases[currentIndex].id}
                id={availablePhrases[currentIndex].id}
                topic={selectedTopic}
                frontText={availablePhrases[currentIndex].lt}
                backText={availablePhrases[currentIndex][selectedLanguage]}
                selectedLanguage={selectedLanguage}
                onFlip={handleFlip}
              />

              {isCompleted ? (
                <div className="text-center space-y-6 mt-6">
                  <div className="relative">
                    <div className="w-24 h-24 mx-auto mb-4">
                      <div className="absolute inset-0 animate-bounce">
                        <span className="text-6xl">🎉</span>
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 animate-spin-slow">
                      <span className="text-4xl">⭐</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-green-600">
                      Congratulations!
                    </h3>
                    <p className="text-gray-600">
                      You've completed all cards in this topic!
                    </p>
                  </div>

                  <div className="w-full max-w-[300px] mx-auto bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-1000"
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 max-w-[300px] mx-auto">
                    <button
                      onClick={() => {
                        setCurrentIndex(0);
                        setIsCompleted(false);
                      }}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Review Topic Again
                    </button>
                    <button
                      onClick={() => (window.location.href = "/quiz")}
                      className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      Take a Quiz
                    </button>
                    <button
                      onClick={() => {
                        selectTopic(null);
                        setIsCompleted(false);
                      }}
                      className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Choose New Topic
                    </button>
                  </div>
                </div>
              ) : (
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
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
