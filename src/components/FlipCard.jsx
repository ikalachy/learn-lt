'use client';

import { useState } from 'react';

export default function FlipCard({ frontText, backText, onFlip, selectedLanguage = 'en' }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (onFlip) {
      onFlip(!isFlipped);
    }
  };

  const getLanguageName = (code) => {
    const languages = {
      en: 'English',
      lt: 'Lithuanian',
      ru: 'Russian',
      by: 'Belarusian'
    };
    return languages[code] || code;
  };

  return (
    <div 
      className="relative w-80 h-48 cursor-pointer"
      onClick={handleFlip}
    >
      <div 
        className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front - Lithuanian */}
        <div className="absolute w-full h-full bg-white rounded-lg shadow-lg backface-hidden flex flex-col items-center justify-center p-4">
          <p className="text-2xl font-semibold text-center">{frontText}</p>
          <p className="text-sm text-gray-500 mt-2">Click to see {getLanguageName(selectedLanguage)}</p>
        </div>
        
        {/* Back - Selected Language */}
        <div className="absolute w-full h-full bg-blue-50 rounded-lg shadow-lg backface-hidden flex flex-col items-center justify-center p-4 rotate-y-180">
          <p className="text-2xl font-semibold text-center">{backText}</p>
          <p className="text-sm text-gray-500 mt-2">Click to see Lithuanian</p>
        </div>
      </div>
    </div>
  );
} 