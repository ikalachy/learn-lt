export default function DialogueInput({ inputRef, isLoading, onSubmit }) {
  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-100 py-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const input = e.currentTarget.elements.namedItem("message");
          if (input.value.trim()) {
            onSubmit(input.value.trim());
            input.value = "";
          }
        }}
        className="flex gap-3"
      >
        <input
          ref={inputRef}
          type="text"
          name="message"
          placeholder="Type your message..."
          className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium text-sm"
        >
          Send
        </button>
      </form>
    </div>
  );
} 