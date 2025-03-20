import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  selectedTopic: null,
  topics: [],
  phrases: [],
  loading: true,
  collapsed: true,
};

export const useTopicStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // Initialize the store
      initialize: async () => {
        try {
          const response = await fetch("/api/topics");
          const data = await response.json();
          set({ topics: data, loading: false });

          get().selectedTopic || set({ collapsed: false });
        } catch (error) {
          console.error("Error loading topics:", error);
          set({ loading: false });
        }
      },

      // Select a topic
      selectTopic: (topicId) => {
        set({
          selectedTopic: topicId,
          collapsed: true, // Collapse the selector when a topic is selected
        });
      },

      loadPhrases: async (topic) => {
        try {
          const response = await fetch(`/api/topics/${topic}`);
          const topicData = await response.json();

          set((state) => ({ phrases: topicData.phrases }));
          return topicData.phrases;
        } catch (error) {
          console.error("Error loading phrases:", error);
        }
        return get().phrases;
      },

      showFullPage: () => set({ collapsed: true }),
      hideFullPage: () => set({ collapsed: false }),

      // Get all topics
      getTopics: () => get().topics,

      // Get selected topic data
      getSelectedTopic: () => {
        const { selectedTopic, topics } = get();
        return topics.find((topic) => topic.id === selectedTopic);
      },

      // Reset the store
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: "topic-storage",
      partialize: (state) => ({
        selectedTopic: state.selectedTopic,
        topics: state.topics,
        collapsed: state.collapsed,
      }),
    }
  )
);
