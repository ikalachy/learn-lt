import ReactMarkdown from "react-markdown";

export default function DialogueSummary({ summary, onStartNew, onChooseDifferent, onPracticeWords, isLoadingWords }) {
  return (
    <div className="mt-6 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs">
          📝
        </div>
        <h3 className="text-base font-medium text-gray-700">
          Dialogue Summary
        </h3>
      </div>
      <div className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-headings:text-sm prose-headings:font-medium prose-p:text-gray-600 prose-p:text-sm prose-li:text-gray-600 prose-li:text-sm prose-strong:text-gray-800 prose-strong:text-sm prose-code:text-blue-600 prose-code:text-sm prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-pre:rounded-lg prose-pre:p-3 prose-headings:font-sans prose-p:font-sans prose-li:font-sans prose-strong:font-sans prose-code:font-mono">
        <ReactMarkdown>{summary}</ReactMarkdown>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={onStartNew}
          className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Start New Dialogue
        </button>
        <button
          onClick={onChooseDifferent}
          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Choose Different Topic
        </button>
      </div>
      <div className="mt-4">
        <button
          onClick={onPracticeWords}
          disabled={isLoadingWords}
          className="w-full px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:bg-purple-400 transition-colors font-medium flex items-center justify-center gap-2"
        >
          {isLoadingWords ? (
            <>
              <span className="animate-spin">⚡</span>
              <span>Generating Words...</span>
            </>
          ) : (
            "Practice Words from this Dialogue"
          )}
        </button>
      </div>
    </div>
  );
} 