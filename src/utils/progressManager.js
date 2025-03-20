import { useProgressStore } from '@/stores/progressStore';

// Get the last viewed word for a specific topic and mode
export function getLastWordId(mode, topicId) {
  try {
    const store = useProgressStore.getState();
    return store.lastViewedWords?.[mode]?.[topicId]?.wordId || null;
  } catch (error) {
    console.error('Error getting last word ID:', error);
    return null;
  }
}

// Save the last viewed word for a specific topic and mode
export function saveLastWordId(mode, topicId, wordId, totalWords, currentIndex) {
  try {
    const store = useProgressStore.getState();
    store.saveLastWordId(mode, topicId, wordId, totalWords, currentIndex);
  } catch (error) {
    console.error('Error saving last word ID:', error);
  }
}

// Get completion status for a topic in a mode
export function getTopicCompletion(mode, topicId) {
  try {
    const store = useProgressStore.getState();
    return store.lastViewedWords?.[mode]?.[topicId]?.isCompleted || false;
  } catch (error) {
    console.error('Error getting topic completion:', error);
    return false;
  }
}

// Get the number of completed topics for a mode
export function getCompletedTopicsCount(mode) {
  try {
    const store = useProgressStore.getState();
    return Object.values(store.lastViewedWords?.[mode] || {})
      .filter(topic => topic.isCompleted)
      .length;
  } catch (error) {
    console.error('Error getting completed topics count:', error);
    return 0;
  }
}

// Get total completed topics across all modes
export function getTotalCompletedTopics() {
  try {
    const store = useProgressStore.getState();
    return Object.values(store.lastViewedWords || {})
      .reduce((total, mode) => {
        return total + Object.values(mode).filter(topic => topic.isCompleted).length;
      }, 0);
  } catch (error) {
    console.error('Error getting total completed topics:', error);
    return 0;
  }
}

// Reset progress for a specific topic in a specific mode
export function resetTopicProgress(mode, topicId) {
  try {
    const store = useProgressStore.getState();
    store.resetTopicProgress(mode, topicId);
  } catch (error) {
    console.error('Error resetting topic progress:', error);
  }
}

// Get topic progress
export function getTopicProgress(mode, topicId) {
  try {
    const store = useProgressStore.getState();
    return store.lastViewedWords?.[mode]?.[topicId] || null;
  } catch (error) {
    console.error('Error getting topic progress:', error);
    return null;
  }
}

// Get the number of words seen for a topic
export function getTopicSeenCount(mode, topicId) {
  try {
    const store = useProgressStore.getState();
    return store.lastViewedWords?.[mode]?.[topicId]?.currentIndex || 0;
  } catch (error) {
    console.error('Error getting topic seen count:', error);
    return 0;
  }
}

// Get words to review (incorrect words)
export function getWordsToReview(topicId) {
  try {
    const store = useProgressStore.getState();
    return store.incorrectWords[topicId] || [];
  } catch (error) {
    console.error('Error getting words to review:', error);
    return [];
  }
}

// Update progress for a word
export function updateProgress(wordId, isCorrect) {
  try {
    const store = useProgressStore.getState();
    store.updateProgress(wordId, isCorrect);
  } catch (error) {
    console.error('Error updating progress:', error);
  }
} 