import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      userId: null,
      name: null,

      login: (token, userId, name) => set({ token, userId, name }),

      logout: () => {
        set({ token: null, userId: null, name: null });
      },
    }),
    {
      name: 'rhythm-auth', // persisted in localStorage
    }
  )
);
