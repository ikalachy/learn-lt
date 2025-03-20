import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  selectedLanguage: 'by',
};

export const useLanguageStore = create(
  persist(
    (set) => ({
      ...initialState,
      setSelectedLanguage: (language) => set({ selectedLanguage: language }),
    }),
    {
      name: "language-storage",
      partialize: (state) => ({
        selectedLanguage: state.selectedLanguage,
      }),
    }
  )
); 