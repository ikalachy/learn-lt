import ReactMarkdown from "react-markdown";

export default function DialogueMessages({ messages, isLoading, messagesEndRef }) {
  return (
    <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex gap-3 p-3 rounded-lg ${
            message.role === "user" ? "bg-blue-50" : "bg-gray-50"
          }`}
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center ${
              message.role === "user" ? "bg-blue-100" : "bg-gray-100"
            }`}
          >
            {message.role === "user" ? "👤" : "🤖"}
          </div>
          <div className="flex-1 prose prose-sm max-w-none prose-headings:font-sans prose-p:font-sans prose-li:font-sans prose-strong:font-sans prose-code:font-mono">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
            🤖
          </div>
          <div className="text-gray-600 text-sm">AI is thinking...</div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
} 