"use client";

import { useTopicStore } from "@/stores/topicStore";
import { useLanguageStore } from "@/stores/languageStore";
import { TOPIC_ICONS } from "@/constants/topics";
import { useRef, useEffect } from "react";

export default function TopicSelector() {
  const { selectedLanguage } = useLanguageStore();
  const { topics, loading, selectedTopic, selectTopic, collapsed } =
    useTopicStore();

  const handleTopicSelect = (topicId) => {
    selectTopic(topicId);
  };

  // Add ref for scrolling to selected topic
  const selectedTopicRef = useRef(null);

  // Scroll to selected topic when collapsed changes
  useEffect(() => {
    if (collapsed && selectedTopic && selectedTopicRef.current) {
      selectedTopicRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [collapsed, selectedTopic]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-8">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`${collapsed ? "overflow-x-auto pb-4" : ""}`}>
      <div
        className={`flex ${
          collapsed ? "flex-row gap-3" : "flex-col gap-4"
        }`}
      >
        {topics.map((topic) => {
          return (
            <button
              key={topic.id}
              ref={selectedTopic === topic.id ? selectedTopicRef : null}
              onClick={() => handleTopicSelect(topic.id)}
              className={`relative p-3 rounded-lg transition-all duration-200 ${
                collapsed ? "flex-shrink-0" : "w-full"
              } ${
                selectedTopic === topic.id
                  ? "bg-blue-50 border-2 border-blue-500"
                  : "bg-white hover:bg-gray-50 border-2 border-gray-200"
              } ${collapsed ? "max-w-[160px]" : ""}`}
            >
              <div className="flex items-center gap-2">
                <span className={`${collapsed ? "text-lg" : "text-2xl"}`}>{TOPIC_ICONS[topic.id]}</span>
                <span
                  className={`font-medium ${
                    selectedTopic === topic.id ? "text-blue-600" : "text-gray-700"
                  } ${collapsed ? "text-xs" : ""}`}
                >
                  {topic.name[selectedLanguage] || topic.name.en}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
