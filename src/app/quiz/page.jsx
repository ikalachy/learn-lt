'use client';

import { useState, useEffect } from 'react';
import phrases from '@/data/phrases.json';
import { updateProgress } from '@/utils/progressManager';
import { useLanguage } from '@/contexts/LanguageContext';

export default function QuizPage() {
  const [currentPhrase, setCurrentPhrase] = useState(null);
  const [options, setOptions] = useState([]);
  const [userAnswer, setUserAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const { selectedLanguage } = useLanguage();

  const getRandomPhrases = (count, excludeId) => {
    return phrases.phrases
      .filter(phrase => phrase.id !== excludeId)
      .sort(() => 0.5 - Math.random())
      .slice(0, count);
  };

  const setupNewQuestion = () => {
    const phrase = phrases.phrases[Math.floor(Math.random() * phrases.phrases.length)];
    const wrongOptions = getRandomPhrases(3, phrase.id).map(p => p[selectedLanguage]);
    const allOptions = [...wrongOptions, phrase[selectedLanguage]].sort(() => 0.5 - Math.random());
    
    setCurrentPhrase(phrase);
    setOptions(allOptions);
    setUserAnswer(null);
    setIsCorrect(null);
  };

  useEffect(() => {
    setupNewQuestion();
  }, [selectedLanguage]);

  const handleAnswer = (answer) => {
    setUserAnswer(answer);
    const correct = answer === currentPhrase[selectedLanguage];
    setIsCorrect(correct);
    updateProgress(currentPhrase.id, correct);
  };

  if (!currentPhrase) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Lithuanian Quiz</h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <p className="text-2xl font-semibold text-center mb-8">{currentPhrase.lt}</p>
          
          <div className="grid grid-cols-1 gap-4">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                disabled={userAnswer !== null}
                className={`p-4 text-lg rounded-lg transition-colors ${
                  userAnswer === null
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : userAnswer === option
                    ? isCorrect
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                    : option === currentPhrase[selectedLanguage] && userAnswer !== null
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {userAnswer && (
            <div className="mt-6 text-center">
              <p className={`text-lg font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {isCorrect ? 'Correct!' : 'Incorrect. Try again!'}
              </p>
              <button
                onClick={setupNewQuestion}
                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Next Question
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 