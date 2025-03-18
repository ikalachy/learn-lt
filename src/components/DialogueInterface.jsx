"use client";

import { useState, useEffect, useRef } from "react";
import { AIProgressManager } from "@/utils/aiProgressManager";
import { Inter } from "next/font/google";
import { useStore } from "@/contexts/StoreContext";
import PaymentButton from "@/components/PaymentButton";
import PracticeWordsPopup from "@/components/PracticeWordsPopup";
import TopicSelector from "./dialogue/TopicSelector";
import DialogueHeader from "./dialogue/DialogueHeader";
import DialogueMessages from "./dialogue/DialogueMessages";
import DialogueInput from "./dialogue/DialogueInput";
import DialogueSummary from "./dialogue/DialogueSummary";
import PracticeWords from "./dialogue/PracticeWords";

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
  const [showWords, setShowWords] = useState(false);
  const [practiceWords, setPracticeWords] = useState([]);
  const [showPracticePopup, setShowPracticePopup] = useState(false);
  const [showDialogue, setShowDialogue] = useState(true);
  const [isLoadingWords, setIsLoadingWords] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { user } = useStore();

  const userId = user?.telegramId;
  const isPremium = user?.isPremium;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (isPremium) {
      const progress = AIProgressManager.getProgress(userId);
      setTopicProgress(progress);
    }
  }, [isPremium, userId]);

  const startNewDialogue = async (topic) => {
    setSelectedTopic(topic);
    setMessages([]);
    setShowSummary(false);
    setShowDialogue(true);
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
        setShowDialogue(false);

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

  const fetchPracticeWords = async () => {
    setIsLoadingWords(true);
    try {
      const response = await fetch("/api/dialogue/words", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: selectedTopic,
          messages,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch practice words");
      }

      const data = await response.json();
      setPracticeWords(data.words);
      setShowWords(true);
    } catch (error) {
      console.error("Error fetching practice words:", error);
    } finally {
      setIsLoadingWords(false);
    }
  };

  if (!isPremium) {
    return (
      <div className={`p-5 text-center max-w-md mx-auto ${inter.className}`}>
        <PaymentButton />
      </div>
    );
  }

  return (
    <div
      className={`max-w-3xl mx-auto p-4 ${inter.className} flex flex-col h-[calc(100vh-2rem)]`}
    >
      {!selectedTopic ? (
        <TopicSelector
          topicProgress={topicProgress}
          onTopicSelect={startNewDialogue}
        />
      ) : (
        <div className="flex flex-col flex-1">
          {!showWords && (
            <>
              <DialogueHeader
                selectedTopic={selectedTopic}
                showSummary={showSummary}
                showDialogue={showDialogue}
                onBack={() => setSelectedTopic(null)}
                onToggleDialogue={() => setShowDialogue(!showDialogue)}
              />

              {showDialogue && (
                <>
                  <DialogueMessages
                    messages={messages}
                    isLoading={isLoading}
                    messagesEndRef={messagesEndRef}
                  />

                  {!showSummary && (
                    <DialogueInput
                      inputRef={inputRef}
                      isLoading={isLoading}
                      onSubmit={sendMessage}
                    />
                  )}
                </>
              )}

              {showSummary && (
                <DialogueSummary
                  summary={summary}
                  onStartNew={() => startNewDialogue(selectedTopic)}
                  onChooseDifferent={() => setSelectedTopic(null)}
                  onPracticeWords={fetchPracticeWords}
                  isLoadingWords={isLoadingWords}
                />
              )}
            </>
          )}

          {showWords && (
            <PracticeWords
              practiceWords={practiceWords}
              onBack={() => setShowWords(false)}
              onPracticeWithCards={() => setShowPracticePopup(true)}
            />
          )}

          {showPracticePopup && (
            <PracticeWordsPopup
              words={practiceWords}
              onClose={() => setShowPracticePopup(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}
