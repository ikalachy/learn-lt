"use client";

import { useState, useEffect } from "react";
import { useProgressStore } from "@/stores/progressStore";
import { useLanguageStore } from "@/stores/languageStore";
import { useTopicStore } from "@/stores/topicStore";

export default function Quiz() {
  const [currentPhrase, setCurrentPhrase] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [userAnswer, setUserAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [availablePhrases, setAvailablePhrases] = useState([]);
  const [isLastWord, setIsLastWord] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const { selectedLanguage } = useLanguageStore();
  const { selectedTopic, loading, loadPhrases } = useTopicStore();
  const { updateProgress, getLastWordId, saveLastWordId } = useProgressStore();

  useEffect(() => {
    const loadPhrasesData = async () => {
      if (!selectedTopic) {
        setAvailablePhrases([]);
        setIsCompleted(false);
        return;
      }

      try {
        const phrases = await loadPhrases(selectedTopic);
        setAvailablePhrases(phrases);
        setupNewQuestion(phrases);
      } catch (error) {
        console.error("Error loading phrases:", error);
      }
    };

    loadPhrasesData();
  }, [selectedTopic]);

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
    function shuffle(array) {
      let currentIndex = array.length;

      // While there remain elements to shuffle...
      while (currentIndex != 0) {
        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex],
          array[currentIndex],
        ];
      }
      return array;
    }
    return shuffle(phrases)
      .filter((phrase) => phrase.id !== excludeId)
      .slice(0, count);
  };

  const setupNewQuestion = (phrases = availablePhrases) => {
    if (!phrases.length) return;

    const lastWordId = getLastWordId("quiz", selectedTopic);
    let nextIndex = 0;

    if (lastWordId) {
      const lastIndex = phrases.findIndex((p) => p.id === lastWordId);
      if (lastIndex >= 0) {
        nextIndex = lastIndex;
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

    if (phrase) {
      saveLastWordId(
        "quiz",
        selectedTopic,
        phrase.id,
        phrases.length,
        nextIndex
      );
    }

    if (nextIndex === phrases.length - 1) {
      setIsLastWord(true);
    }
  };

  const handleAnswer = (answer) => {
    if (!currentPhrase) return;

    setUserAnswer(answer);
    const correct = answer === currentPhrase[selectedLanguage];
    setIsCorrect(correct);

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

  const handleNextQuestion = () => {
    if (!currentPhrase) return;

    updateProgress(currentPhrase.id, isCorrect);
    saveLastWordId(
      "quiz",
      selectedTopic,
      currentPhrase.id,
      availablePhrases.length,
      currentIndex
    );

    const nextIndex = currentIndex + 1;
    if (nextIndex < availablePhrases.length) {
      const nextPhrase = availablePhrases[nextIndex];
      const wrongOptions = getRandomPhrases(
        availablePhrases,
        3,
        nextPhrase.id
      ).map((p) => p[selectedLanguage]);
      const allOptions = [...wrongOptions, nextPhrase[selectedLanguage]].sort(
        () => 0.5 - Math.random()
      );

      setCurrentPhrase(nextPhrase);
      setCurrentIndex(nextIndex);
      setOptions(allOptions);
      setUserAnswer(null);
      setIsCorrect(null);

      if (nextIndex === availablePhrases.length - 1) {
        setIsLastWord(true);
      }
    }
  };

  if (!selectedTopic) {
    return (
      <div className="text-center text-gray-600">
        Please select a topic first
      </div>
    );
  }

  if (loading) {
    return <div className="text-center text-gray-600">Loading...</div>;
  }

  if (!currentPhrase) {
    return (
      <div className="text-center text-gray-600">Loading questions...</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mt-2">
        <p className="text-sm text-gray-500 w-24">
          Word {currentIndex + 1} of {availablePhrases.length}
        </p>
        <div className="h-3 flex-grow mx-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-blue-500 transition-all duration-300 shadow-sm"
            style={{
              width: `${((currentIndex + 1) / availablePhrases.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {isLastWord && isCorrect ? (
          <div className="relative overflow-hidden min-h-[400px] flex flex-col items-center justify-center">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-0 animate-float">
                <span className="text-4xl opacity-30">🎉</span>
              </div>
              <div className="absolute bottom-0 right-0 animate-float-delayed">
                <span className="text-4xl opacity-30">✨</span>
              </div>
            </div>

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
                    setCurrentIndex(0);
                    setUserAnswer(null);
                    setIsCorrect(null);
                    setCurrentPhrase(null);
                    setIsCompleted(false);
                    setIsLastWord(false);
                    saveLastWordId(
                      "quiz",
                      selectedTopic,
                      null,
                      availablePhrases.length,
                      0
                    );
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
                <button
                  onClick={handleNextQuestion}
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
  );
}
