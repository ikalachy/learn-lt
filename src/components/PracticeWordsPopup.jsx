import { useState } from 'react';
import FlipCard from './FlipCard';

export default function PracticeWordsPopup({ words, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleFlip = (isFlipped) => {
    if (isFlipped) {
      setFlippedCount(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setFlippedCount(0);
    } else {
      onClose();
    }
  };

  const currentWord = words[currentIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Practice Words</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">
              Word {currentIndex + 1} of {words.length}
            </span>
          </div>
          <FlipCard
            frontText={currentWord.word}
            backText={currentWord.translation}
            onFlip={handleFlip}
            id={`practice-${currentIndex}`}
            topic="Practice"
          />
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {currentIndex < words.length - 1 ? 'Next Word' : 'Finish Practice'}
          </button>
        </div>
      </div>
    </div>
  );
} 