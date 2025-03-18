export default function DialogueHeader({ selectedTopic, showSummary, showDialogue, onBack, onToggleDialogue }) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
        >
          ←
        </button>
        <h2 className="text-base font-medium text-gray-700">
          Topic: {selectedTopic}
        </h2>
      </div>
      {showSummary && (
        <button
          onClick={onToggleDialogue}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          {showDialogue ? (
            <>
              <span>Hide Dialogue</span>
              <span className="text-xs">↑</span>
            </>
          ) : (
            <>
              <span>Show Dialogue</span>
              <span className="text-xs">↓</span>
            </>
          )}
        </button>
      )}
    </div>
  );
} 