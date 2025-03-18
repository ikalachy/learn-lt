'use client';

import { useState } from 'react';

export default function FlipCard({ frontText, backText, onFlip, selectedLanguage = 'en', id, topic }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState(null);

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

  const playText = async () => {
    if (isPlaying) {
      audio?.pause();
      return;
    }

    try {
      setIsPlaying(true);
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, topic, content: frontText }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const data = await response.json();
      const audioContent = data.audio;
      
      // Create and play audio
      const audioBlob = new Blob(
        [Buffer.from(audioContent, 'base64')],
        { type: 'audio/mp3' }
      );
      const audioUrl = URL.createObjectURL(audioBlob);
      const newAudio = new Audio(audioUrl);
      
      newAudio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      setAudio(newAudio);
      newAudio.play();
    } catch (error) {
      console.error('Error playing text:', error);
      setIsPlaying(false);
    }
  };

  return (
    <div className="relative w-full h-48">
      <div 
        className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front - Lithuanian */}
        <div 
          className="absolute w-full h-full bg-white rounded-lg shadow-lg backface-hidden flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={handleFlip}
        >
          <div className="flex items-center gap-3">
            <p className="text-2xl font-semibold text-center">{frontText}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                playText();
              }}
              className={`relative p-2 rounded-full transition-all ${
                isPlaying 
                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isPlaying ? 'Stop' : 'Play'}
            >
              {isPlaying ? (
                <>
                  <span className="text-xl">🔊</span>
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-full w-full bg-blue-500 opacity-50"></span>
                  </span>
                </>
              ) : (
                <span className="text-xl">🔊</span>
              )}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">Click to see {getLanguageName(selectedLanguage)}</p>
        </div>
        
        {/* Back - Selected Language */}
        <div 
          className="absolute w-full h-full bg-blue-50 rounded-lg shadow-lg backface-hidden flex flex-col items-center justify-center p-6 rotate-y-180 cursor-pointer hover:bg-blue-100 transition-colors"
          onClick={handleFlip}
        >
          <p className="text-2xl font-semibold text-center">{backText}</p>
          <p className="text-sm text-gray-500 mt-2">Click to see Lithuanian</p>
        </div>
      </div>
    </div>
  );
} 