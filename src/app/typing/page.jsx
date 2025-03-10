'use client';

import { useState, useEffect } from 'react';
import phrases from '@/data/phrases.json';
import { updateProgress } from '@/utils/progressManager';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TypingPage() {
  const [currentPhrase, setCurrentPhrase] = useState(null);
  const [availableLetters, setAvailableLetters] = useState([]);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintCount, setHintCount] = useState(2);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const { selectedLanguage } = useLanguage();

  const MAX_ATTEMPTS = 3;
  const HINT_DURATION = 1500;

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const showTemporaryHint = () => {
    if (hintCount > 0) {
      setShowHint(true);
      setHintCount(prev => prev - 1);
      setTimeout(() => {
        setShowHint(false);
      }, HINT_DURATION);
    }
  };

  const setupNewWord = () => {
    const randomPhrase = phrases.phrases[Math.floor(Math.random() * phrases.phrases.length)];
    setCurrentPhrase(randomPhrase);
    
    const letters = randomPhrase.lt.toLowerCase().split('');
    const extraLetters = 'aąbcčdeęėfghiįyjklmnoprsštuųūvzž'.split('');
    const additionalLetters = shuffleArray(extraLetters).slice(0, 5);
    
    setAvailableLetters(shuffleArray([...letters, ...additionalLetters]));
    setSelectedLetters([]);
    setIsCorrect(false);
    setAttempts(0);
    setShowAnswer(false);
    setShowHint(false);
    setHintCount(2);
  };

  useEffect(() => {
    setupNewWord();
  }, []);

  const handleLetterClick = (letter, index, isFromAvailable = true) => {
    if (isFromAvailable) {
      // Move letter from available to selected
      setAvailableLetters(availableLetters.filter((_, i) => i !== index));
      setSelectedLetters([...selectedLetters, letter]);
    } else {
      // Move letter from selected back to available
      setSelectedLetters(selectedLetters.filter((_, i) => i !== index));
      setAvailableLetters([...availableLetters, letter]);
    }
  };

  useEffect(() => {
    if (currentPhrase && selectedLetters.length > 0) {
      const wordGuessed = selectedLetters.join('').toLowerCase();
      const isWordCorrect = wordGuessed === currentPhrase.lt.toLowerCase();
      
      if (isWordCorrect) {
        setIsCorrect(true);
        updateProgress(currentPhrase.id, true);
        setScore(prev => prev + Math.max(10 - attempts * 2, 5)); // More points for fewer attempts
        setStreak(prev => prev + 1);
      } else if (wordGuessed.length === currentPhrase.lt.length) {
        setAttempts(prev => {
          const newAttempts = prev + 1;
          if (newAttempts >= MAX_ATTEMPTS) {
            setShowAnswer(true);
            setStreak(0);
          }
          return newAttempts;
        });
        setTimeout(() => {
          const letters = [...selectedLetters];
          setSelectedLetters([]);
          setAvailableLetters([...availableLetters, ...letters]);
        }, 800);
      }
    }
  }, [selectedLetters, currentPhrase]);

  if (!currentPhrase) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Spell It!</h1>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Score</span>
              <span className="text-xl font-bold text-blue-600">{score}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Streak</span>
              <span className={`text-xl font-bold ${streak > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                {streak}🔥
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <p className="text-3xl font-bold text-gray-800">{currentPhrase[selectedLanguage]}</p>
              <button
                onClick={showTemporaryHint}
                disabled={hintCount === 0 || isCorrect || showAnswer}
                className={`group relative flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                  hintCount > 0 && !isCorrect && !showAnswer
                    ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-600 hover:scale-110'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                title={hintCount === 0 ? 'No hints left' : `${hintCount} hints left`}
              >
                <span className="text-xl">💡</span>
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold bg-yellow-500 text-white rounded-full">
                  {hintCount}
                </span>
                <span className="absolute left-1/2 -translate-x-1/2 -bottom-8 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {hintCount === 0 ? 'No hints left' : `${hintCount} hints left`}
                </span>
              </button>
            </div>
            {(showAnswer || showHint) && (
              <p className={`text-lg ${showHint ? 'text-gray-600 animate-fade-in' : 'text-blue-600'}`}>
                <span className="font-semibold">{currentPhrase.lt}</span>
              </p>
            )}
            <div className="mt-2 flex justify-center gap-2">
              {[...Array(MAX_ATTEMPTS)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i < attempts 
                      ? 'bg-red-500 scale-110' 
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Selected letters */}
          <div className="flex flex-wrap justify-center gap-2 mb-8 min-h-[60px] p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            {currentPhrase.lt.split('').map((_, index) => (
              <div
                key={`box-${index}`}
                className={`w-12 h-12 border-2 ${
                  selectedLetters[index] 
                    ? 'border-blue-500 bg-blue-500 shadow-md' 
                    : 'border-gray-300 hover:border-gray-400'
                } rounded-lg flex items-center justify-center transition-all duration-200`}
              >
                {selectedLetters[index] && (
                  <span className="text-xl font-semibold text-white animate-pop-in">
                    {selectedLetters[index]}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Available letters */}
          <div className="flex flex-wrap justify-center gap-2 p-4 bg-gray-50 rounded-lg">
            {availableLetters.map((letter, index) => (
              <button
                key={`available-${index}`}
                onClick={() => handleLetterClick(letter, index)}
                className="w-12 h-12 flex items-center justify-center text-xl font-semibold bg-white text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm hover:shadow-md animate-fade-in"
              >
                {letter}
              </button>
            ))}
          </div>

          {(isCorrect || showAnswer) && (
            <div className="mt-8 text-center">
              <p className={`text-xl font-bold mb-4 ${
                isCorrect 
                  ? 'text-green-600 animate-bounce' 
                  : 'text-blue-600'
              }`}>
                {isCorrect ? '🎉 Correct! Well done!' : 'Keep practicing!'}
              </p>
              <button
                onClick={setupNewWord}
                className="px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
              >
                Next Word →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 