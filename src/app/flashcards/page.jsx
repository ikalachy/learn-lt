'use client';

import { useState, useEffect } from 'react';
import FlipCard from '@/components/FlipCard';
import phrases from '@/data/phrases.json';
import { updateProgress } from '@/utils/progressManager';

export default function FlashcardsPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showControls, setShowControls] = useState(false);

  const currentPhrase = phrases.phrases[currentIndex];

  const handleNext = () => {
    if (currentIndex < phrases.phrases.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowControls(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowControls(false);
    }
  };

  const handleFlip = (isFlipped) => {
    setShowControls(isFlipped);
    if (isFlipped) {
      updateProgress(currentPhrase.id, true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Lithuanian Flashcards</h1>
        
        <div className="flex flex-col items-center gap-8">
          <FlipCard 
            frontText={currentPhrase.lt}
            backText={currentPhrase.en}
            onFlip={handleFlip}
          />

          <div className="flex gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === phrases.phrases.length - 1}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300"
            >
              Next
            </button>
          </div>

          <div className="text-center text-gray-600">
            Card {currentIndex + 1} of {phrases.phrases.length}
          </div>
        </div>
      </div>
    </div>
  );
} 