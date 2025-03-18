export default function PracticeWords({ practiceWords, onBack, onPracticeWithCards }) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
        >
          ←
        </button>
        <h2 className="text-base font-medium text-gray-700">
          Practice Words
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {practiceWords.map((word, index) => (
          <div
            key={index}
            className="p-3 bg-purple-50 rounded-lg border border-purple-100"
          >
            <div className="font-medium text-purple-900">{word.word}</div>
            <div className="text-sm text-purple-600">{word.translation}</div>
            {word.example && (
              <div className="text-xs text-purple-500 mt-1">
                Example: {word.example}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={onPracticeWithCards}
          className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          Practice with Flip Cards
        </button>
        <button
          onClick={onBack}
          className="flex-1 px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors font-medium"
        >
          Back to Dialogue
        </button>
      </div>
    </div>
  );
} 