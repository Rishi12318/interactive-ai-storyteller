import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,

  signUp: (name, email) =>
    set({
      user: { name, email },
      isAuthenticated: true,
    }),

  signIn: (email) =>
    set({
      user: { name: email.split("@")[0], email },
      isAuthenticated: true,
    }),

  signOut: () => set({ user: null, isAuthenticated: false }),
}));
