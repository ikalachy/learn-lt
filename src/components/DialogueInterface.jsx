"use client";

import { useState, useEffect, useRef } from "react";
import { AIProgressManager } from "@/utils/aiProgressManager";
import ReactMarkdown from "react-markdown";
import { Inter } from "next/font/google";
import { useStore } from "@/contexts/StoreContext";
import PaymentButton from "@/components/PaymentButton";
const inter = Inter({ subsets: ["latin"] });

const topics = [
  "Travel and Tourism",
  "Business and Work",
  "Daily Life",
  "Culture and Traditions",
  "Food and Dining",
  "Education and Learning",
  "Hobbies and Leisure",
  "Health and Wellness",
  "Technology and Innovation",
  "Environment and Nature",
];

export default function DialogueInterface() {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState("");
  const [topicProgress, setTopicProgress] = useState({});
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { user } = useStore();

  const userId = user?.telegramId;
  const isAuthorized = userId === "765663824";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (isAuthorized) {
      const progress = AIProgressManager.getProgress(userId);
      setTopicProgress(progress);
    }
  }, [isAuthorized, userId]);

  const startNewDialogue = async (topic) => {
    setSelectedTopic(topic);
    setMessages([]);
    setShowSummary(false);
    setIsLoading(true);

    try {
      const response = await fetch("/api/dialogue/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic, userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to start dialogue");
      }

      const data = await response.json();
      setMessages([{ role: "assistant", content: data.message }]);
    } catch (error) {
      console.error("Error starting dialogue:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content) => {
    if (!selectedTopic) return;

    const newMessage = { role: "user", content };
    setMessages((prev) => [...prev, newMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/dialogue/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: selectedTopic,
          messages: [...messages, newMessage],
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);

      if (data.isComplete) {
        setSummary(data.summary);
        setShowSummary(true);

        // Save progress
        const score = AIProgressManager.calculateScore(data.summary);
        AIProgressManager.saveProgress(userId, selectedTopic, score);

        // Update local progress state
        const progress = AIProgressManager.getProgress(userId);
        setTopicProgress(progress);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className={`p-8 text-center max-w-md mx-auto ${inter.className}`}>
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <div className="bg-red-50 rounded-lg p-6 mb-6">
          <p className="text-gray-600 mb-4">
            This feature is currently not available for your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`max-w-3xl mx-auto p-4 ${inter.className} flex flex-col h-[calc(100vh-2rem)]`}
    >
      {!selectedTopic ? (
        <div>
          <h2 className="text-xl font-medium mb-4 text-gray-700">
            Choose a Topic
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {topics.map((topic) => {
              const progress = topicProgress[topic];
              return (
                <button
                  key={topic}
                  onClick={() => startNewDialogue(topic)}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors relative text-left group"
                >
                  <span className="text-gray-700 text-sm font-medium group-hover:text-blue-600 transition-colors">
                    {topic}
                  </span>
                  {progress && (
                    <div className="absolute top-1.5 right-1.5 text-xs text-gray-400">
                      {progress.completedDialogues} completed
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedTopic(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                ←
              </button>
              <h2 className="text-base font-medium text-gray-700">
                Topic: {selectedTopic}
              </h2>
            </div>
          </div>

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

          {!showSummary && (
            <div className="sticky bottom-0 bg-white border-t border-gray-100 py-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = e.currentTarget.elements.namedItem("message");
                  if (input.value.trim()) {
                    sendMessage(input.value.trim());
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
          )}

          {showSummary && (
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
                  onClick={() => startNewDialogue(selectedTopic)}
                  className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Start New Dialogue
                </button>
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Choose Different Topic
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
