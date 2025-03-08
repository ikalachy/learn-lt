const STORAGE_KEY = 'lt-learning-progress';

export const getProgress = () => {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const initialProgress = {
      seenWords: [],
      incorrectWords: [],
      lastReviewDate: null
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProgress));
    return initialProgress;
  }
  
  return JSON.parse(stored);
};

export const updateProgress = (wordId, isCorrect) => {
  const progress = getProgress();
  if (!progress) return;

  if (!progress.seenWords.includes(wordId)) {
    progress.seenWords.push(wordId);
  }

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