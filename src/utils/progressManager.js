const STORAGE_KEY = 'lt-learning-progress';

export const getProgress = () => {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const initialProgress = {
      incorrectWords: [],
      lastReviewDate: null,
      lastViewedWords: {
        flashcards: {},  // Structure: { topicId: { wordId: string, isCompleted: boolean, totalWords: number } }
        quiz: {},        // Structure: { topicId: { wordId: string, isCompleted: boolean, totalWords: number } }
        typing: {}       // Structure: { topicId: { wordId: string, isCompleted: boolean, totalWords: number } }
      }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProgress));
    return initialProgress;
  }
  
  const progress = JSON.parse(stored);
  // Ensure lastViewedWords has the correct structure
  if (!progress.lastViewedWords || typeof progress.lastViewedWords !== 'object') {
    progress.lastViewedWords = {
      flashcards: {},
      quiz: {},
      typing: {}
    };
  }
  // Ensure all modes exist
  if (!progress.lastViewedWords.flashcards) progress.lastViewedWords.flashcards = {};
  if (!progress.lastViewedWords.quiz) progress.lastViewedWords.quiz = {};
  if (!progress.lastViewedWords.typing) progress.lastViewedWords.typing = {};
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  return progress;
};

export const updateProgress = (wordId, isCorrect) => {
  const progress = getProgress();
  if (!progress) return;

  // Update incorrect words list
  if (!isCorrect && !progress.incorrectWords.includes(wordId)) {
    progress.incorrectWords.push(wordId);
  } else if (isCorrect && progress.incorrectWords.includes(wordId)) {
    progress.incorrectWords = progress.incorrectWords.filter(id => id !== wordId);
  }

  progress.lastReviewDate = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
};

export const getWordsToReview = () => {
  const progress = getProgress();
  return progress ? progress.incorrectWords : [];
};

export const resetProgress = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  getProgress(); // Initialize with default values
};

// Get the last viewed word for a specific topic and mode
export function getLastWordId(mode, topicId) {
  try {
    const progress = getProgress();
    return progress?.lastViewedWords?.[mode]?.[topicId]?.wordId || null;
  } catch (error) {
    console.error('Error getting last word ID:', error);
    return null;
  }
}

// Save the last viewed word for a specific topic and mode
export function saveLastWordId(mode, topicId, wordId, totalWords, currentIndex) {
  try {
    const progress = getProgress();
    if (!progress.lastViewedWords[mode]) {
      progress.lastViewedWords[mode] = {};
    }
    
    // Get existing topic progress or create new
    const topicProgress = progress.lastViewedWords[mode][topicId] || { 
      wordId: null, 
      isCompleted: false, 
      totalWords: 0,
      currentIndex: 0
    };
    
    // Update the progress
    topicProgress.wordId = wordId;
    if (totalWords) {
      topicProgress.totalWords = totalWords;
      topicProgress.currentIndex = currentIndex;
      // Mark as completed if we've reached the last word
      topicProgress.isCompleted = currentIndex >= totalWords - 1;
    }
    
    progress.lastViewedWords[mode][topicId] = topicProgress;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving last word ID:', error);
  }
}

// Get completion status for a topic in a mode
export function getTopicCompletion(mode, topicId) {
  try {
    const progress = getProgress();
    return progress?.lastViewedWords?.[mode]?.[topicId]?.isCompleted || false;
  } catch (error) {
    console.error('Error getting topic completion:', error);
    return false;
  }
}

// Get the number of completed topics for a mode
export function getCompletedTopicsCount(mode) {
  try {
    const progress = getProgress();
    return Object.values(progress?.lastViewedWords?.[mode] || {})
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
    const progress = getProgress();
    return Object.values(progress?.lastViewedWords || {})
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
    const progress = getProgress();
    if (progress.lastViewedWords?.[mode]) {
      delete progress.lastViewedWords[mode][topicId];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Error resetting topic progress:', error);
  }
}

// Get topic progress
export function getTopicProgress(topicId) {
  try {
    const progress = getProgress();
    return progress?.lastViewedWords?.[topicId] || { currentId: null, answeredCorrectly: false, seenIds: [] };
  } catch (error) {
    console.error('Error getting topic progress:', error);
    return { currentId: null, answeredCorrectly: false, seenIds: [] };
  }
}

// Get the number of seen words for a topic
export function getTopicSeenCount(topicId) {
  try {
    const progress = getProgress();
    return progress?.lastViewedWords?.[topicId]?.seenIds?.length || 0;
  } catch (error) {
    console.error('Error getting topic seen count:', error);
    return 0;
  }
} 