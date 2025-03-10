'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageSelector() {
  const { selectedLanguage, setSelectedLanguage } = useLanguage();

  const languages = [
    { 
      code: 'by',
      name: 'Belarusian',
      display: 'BY'
    },
    { 
      code: 'en',
      name: 'English',
      display: 'EN'
    },
    { 
      code: 'ru',
      name: 'Russian',
      display: 'RU'
    }
  ];

  return (
    <div className="relative">
      <select
        value={selectedLanguage}
        onChange={(e) => setSelectedLanguage(e.target.value)}
        className="appearance-none bg-transparent text-white h-10 px-3 rounded-lg border border-white/20 hover:bg-white/10 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/20 uppercase font-medium text-sm"
        title="Select language"
      >
        {languages.map((lang) => (
          <option 
            key={lang.code} 
            value={lang.code}
            className="bg-blue-600 text-sm"
            title={lang.name}
          >
            {lang.display}
          </option>
        ))}
      </select>
    </div>
  );
} 