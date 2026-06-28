import { create } from "zustand";

export const useStoryStore = create((set) => ({
  sessionId: null,
  sceneText: "",
  choices: [],
  characters: {},
  sceneNumber: 0,
  isEnding: false,
  isLoading: false,
  choiceHistory: [],
  imageUrl: "",

  // Character profile collected by the wizard — sent to backend for image generation
  characterProfile: {
    name: "",
    gender: "",            // "male" | "female" | "non-binary"
    age: "",
    build: "",
    faceShape: "",
    skinTone: "",
    eyeColor: "",
    hairColor: "",
    hairStyle: "",
    uniqueFeatures: "",
    outfit: "",
    accessories: "",
    artStyle: "anime",     // "anime" | "semi-realistic" | "realistic" | "cartoon"
  },

  setCharacterProfile: (profile) => set({ characterProfile: profile }),

  setStory: (data) => set({
    sessionId: data.session_id,
    sceneText: data.scene_text,
    choices: data.choices,
    characters: data.characters,
    sceneNumber: data.scene_number,
    isEnding: data.is_ending,
    isLoading: false,
    imageUrl: data.image_url || "",
  }),

  setLoading: (val) => set({ isLoading: val }),
  addChoice: (choice) => set((s) => ({ choiceHistory: [...s.choiceHistory, choice] })),
  resetStory: () => set({
    sessionId: null, sceneText: "", choices: [], characters: {},
    sceneNumber: 0, isEnding: false, isLoading: false, choiceHistory: [], imageUrl: "",
    characterProfile: {
      name: "", gender: "", age: "", build: "", faceShape: "", skinTone: "",
      eyeColor: "", hairColor: "", hairStyle: "", uniqueFeatures: "",
      outfit: "", accessories: "", artStyle: "anime",
    },
  }),
}));