import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  lastViewedWords: {},
  incorrectWords: {},
};

export const useProgressStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // Get the current progress state
      getProgress: () => get(),

      // Update progress for a word
      updateProgress: (wordId, isCorrect) => {
        set((state) => {
          const currentIncorrectWords = state.incorrectWords[wordId] || [];
          const updatedIncorrectWords = isCorrect
            ? currentIncorrectWords.filter((id) => id !== wordId)
            : [...new Set([...currentIncorrectWords, wordId])];

          return {
            incorrectWords: {
              ...state.incorrectWords,
              [wordId]: updatedIncorrectWords,
            },
          };
        });
      },

      // Save the last viewed word for a topic
      saveLastWordId: (mode, topicId, wordId, totalWords, currentIndex) => {
        set((state) => {
          const updatedLastViewedWords = {
            ...state.lastViewedWords,
            [mode]: {
              ...state.lastViewedWords[mode],
              [topicId]: {
                wordId,
                totalWords,
                currentIndex,
                timestamp: Date.now(),
              },
            },
          };

          return {
            lastViewedWords: updatedLastViewedWords,
          };
        });
      },

      // Get the last viewed word for a topic
      getLastWordId: (mode, topicId) => {
        const state = get();
        return state.lastViewedWords[mode]?.[topicId]?.wordId || null;
      },

      // Get topic completion status
      getTopicCompletion: (mode, topicId) => {
        const state = get();
        const topicProgress = state.lastViewedWords[mode]?.[topicId];
        if (!topicProgress) return false;

        return topicProgress.currentIndex >= topicProgress.totalWords - 1;
      },

      // Get completed topics count for a mode
      getCompletedTopicsCount: (mode) => {
        const state = get();
        const modeTopics = state.lastViewedWords[mode] || {};
        return Object.keys(modeTopics).filter((topicId) =>
          get().getTopicCompletion(mode, topicId)
        ).length;
      },

      // Get total completed topics across all modes
      getTotalCompletedTopics: () => {
        const state = get();
        const modes = Object.keys(state.lastViewedWords);
        return modes.reduce(
          (total, mode) => total + get().getCompletedTopicsCount(mode),
          0
        );
      },

      // Reset progress for a topic
      resetTopicProgress: (mode, topicId) => {
        set((state) => {
          const updatedLastViewedWords = { ...state.lastViewedWords };
          if (updatedLastViewedWords[mode]) {
            delete updatedLastViewedWords[mode][topicId];
          }

          return {
            lastViewedWords: updatedLastViewedWords,
          };
        });
      },

      // Get progress for a topic
      getTopicProgress: (mode, topicId) => {
        const state = get();
        return state.lastViewedWords[mode]?.[topicId] || null;
      },

      // Get number of words seen for a topic
      getTopicSeenCount: (mode, topicId) => {
        const state = get();
        return state.lastViewedWords[mode]?.[topicId]?.currentIndex || 0;
      },

      // Reset all progress
      resetProgress: () => {
        set(initialState);
      },

      // Get words to review (incorrect words)
      getWordsToReview: (topicId) => {
        const state = get();
        return state.incorrectWords[topicId] || [];
      },
    }),
    {
      name: "lt-learning-progress",
      partialize: (state) => ({
        lastViewedWords: state.lastViewedWords,
      }),
    }
  )
);
