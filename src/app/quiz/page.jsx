"use client";

import { useState, useEffect } from "react";
import {
  updateProgress,
  getLastWordId,
  saveLastWordId,
} from "@/utils/progressManager";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTopic } from "@/contexts/TopicContext";
import TopicSelector from "@/components/TopicSelector";

export default function QuizPage() {
  const [currentPhrase, setCurrentPhrase] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [userAnswer, setUserAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [availablePhrases, setAvailablePhrases] = useState([]);
  const { selectedLanguage } = useLanguage();
  const { selectedTopic, loading, selectTopic } = useTopic();
  const [isLastWord, setIsLastWord] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFullTopicSelector, setShowFullTopicSelector] = useState(false);

  useEffect(() => {
    const loadPhrases = async () => {
      if (!selectedTopic) {
        setAvailablePhrases([]);
        setIsCompleted(false);
        return;
      }

      try {
        const response = await fetch(`/api/topics/${selectedTopic}`);
        const topicData = await response.json();
        setAvailablePhrases(topicData.phrases);
        setupNewQuestion(topicData.phrases);
      } catch (error) {
        console.error("Error loading phrases:", error);
      }
    };

    loadPhrases();
  }, [selectedTopic]);

  // Add effect to update options when language changes
  useEffect(() => {
    if (currentPhrase && availablePhrases.length > 0) {
      const wrongOptions = getRandomPhrases(
        availablePhrases,
        3,
        currentPhrase.id
      ).map((p) => p[selectedLanguage]);
      const allOptions = [
        ...wrongOptions,
        currentPhrase[selectedLanguage],
      ].sort(() => 0.5 - Math.random());
      setOptions(allOptions);
      setUserAnswer(null);
      setIsCorrect(null);
    }
  }, [selectedLanguage, currentPhrase, availablePhrases]);

  const getRandomPhrases = (phrases, count, excludeId) => {
    return phrases
      .filter((phrase) => phrase.id !== excludeId)
      .sort(() => 0.5 - Math.random())
      .slice(0, count);
  };

  const setupNewQuestion = (phrases = availablePhrases) => {
    if (!phrases.length) return;

    const lastWordId = getLastWordId("quiz", selectedTopic);
    let nextIndex = 0;

    if (lastWordId) {
      const lastIndex = phrases.findIndex((p) => p.id === lastWordId);
      if (lastIndex >= 0) {
        // If we're at the last word, stay there
        nextIndex = lastIndex >= phrases.length - 1 ? lastIndex : lastIndex + 1;
      }
    }

    const phrase = phrases[nextIndex];
    const wrongOptions = getRandomPhrases(phrases, 3, phrase.id).map(
      (p) => p[selectedLanguage]
    );
    const allOptions = [...wrongOptions, phrase[selectedLanguage]].sort(
      () => 0.5 - Math.random()
    );

    setCurrentPhrase(phrase);
    setCurrentIndex(nextIndex);
    setOptions(allOptions);
    setUserAnswer(null);
    setIsCorrect(null);

    // Save progress with total words count and current index
    if (phrase) {
      saveLastWordId(
        "quiz",
        selectedTopic,
        phrase.id,
        phrases.length,
        nextIndex
      );
    }

    // If this is the last word, mark it as completed after answering
    if (nextIndex === phrases.length - 1) {
      setIsLastWord(true);
    }
  };

  const handleAnswer = (answer) => {
    if (!currentPhrase) return;

    setUserAnswer(answer);
    const correct = answer === currentPhrase[selectedLanguage];
    setIsCorrect(correct);

    // Update progress
    updateProgress(currentPhrase.id, correct);

    // If this is the last word and the answer is correct, ensure completion is set
    if (isLastWord && correct) {
      setIsCompleted(true);
      saveLastWordId(
        "quiz",
        selectedTopic,
        currentPhrase.id,
        availablePhrases.length,
        currentIndex
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-3 px-4">
      <div className="max-w-[480px] mx-auto">
        {!showFullTopicSelector && <TopicSelector />}

        {!selectedTopic ? (
          <div className="text-center text-gray-600">
            Please select a topic to start the quiz
          </div>
        ) : loading ? (
          <div className="text-center text-gray-600">Loading topics...</div>
        ) : !currentPhrase ? (
          <div className="text-center text-gray-600">Loading questions...</div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Word {currentIndex + 1} of {availablePhrases.length}
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
              {isLastWord && isCorrect ? (
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
                        You've completed all questions in this topic!
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 max-w-[300px] mt-8">
                      <button
                        onClick={() => {
                          // Reset all state
                          setCurrentIndex(0);
                          setUserAnswer(null);
                          setIsCorrect(null);
                          setCurrentPhrase(null);
                          setIsCompleted(false);
                          setIsLastWord(false);

                          // Reset progress by clearing the last word ID
                          saveLastWordId(
                            "quiz",
                            selectedTopic,
                            null,
                            availablePhrases.length,
                            0
                          );

                          // Set up new question from the beginning
                          setupNewQuestion(availablePhrases);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        Review Topic Again
                      </button>
                      <button
                        onClick={() => (window.location.href = "/flashcards")}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        Try Flashcards
                      </button>
                      <button
                        onClick={() => {
                          setShowFullTopicSelector(true);
                          selectTopic(null);
                          setCurrentIndex(0);
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
                  <p className="text-2xl font-semibold text-center mb-3">
                    {currentPhrase.lt}
                  </p>

                  <div className="grid grid-cols-1 gap-4">
                    {options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswer(option)}
                        disabled={userAnswer !== null}
                        className={`p-4 text-lg rounded-lg transition-colors ${
                          userAnswer === null
                            ? "bg-blue-500 text-white hover:bg-blue-600"
                            : userAnswer === option
                            ? isCorrect
                              ? "bg-green-500 text-white"
                              : "bg-red-500 text-white"
                            : option === currentPhrase[selectedLanguage] &&
                              userAnswer !== null
                            ? "bg-green-500 text-white"
                            : "bg-gray-200"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  {userAnswer && (
                    <div className="mt-1 text-center">
                      <p
                        className={`text-lg font-semibold ${
                          isCorrect ? "text-green-600" : "text-red-600"
                        }`}
                      >
                      </p>
                      <button
                        onClick={() => setupNewQuestion()}
                        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        Next Question
                      </button>
                    </div>
                  )}
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
