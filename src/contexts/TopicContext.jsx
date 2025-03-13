'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { saveLastWordId } from '@/utils/progressManager';

const TopicContext = createContext();
const STORAGE_KEY = 'selectedTopic';

export function TopicProvider({ children }) {
  const [selectedTopic, setSelectedTopic] = useState(() => {
    // Try to load the selected topic from localStorage during initialization
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved || null;
    }
    return null;
  });
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const response = await fetch('/api/topics');
        const data = await response.json();
        setTopics(data);
        
        // Validate that the saved topic still exists in the available topics
        if (selectedTopic && !data.some(t => t.id === selectedTopic)) {
          setSelectedTopic(null);
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (error) {
        console.error('Error loading topics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTopics();
  }, [selectedTopic]);

  const selectTopic = (topicId, mode, currentWordId) => {
    // Save progress for current topic before switching
    if (selectedTopic && currentWordId) {
      saveLastWordId(mode, selectedTopic, currentWordId);
    }
    
    // Save new topic to localStorage
    if (topicId) {
      localStorage.setItem(STORAGE_KEY, topicId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    
    setSelectedTopic(topicId);
  };

  return (
    <TopicContext.Provider value={{ 
      selectedTopic,
      selectTopic,
      topics,
      loading
    }}>
      {children}
    </TopicContext.Provider>
  );
}

export function useTopic() {
  const context = useContext(TopicContext);
  if (!context) {
    throw new Error('useTopic must be used within a TopicProvider');
  }
  return context;
} 