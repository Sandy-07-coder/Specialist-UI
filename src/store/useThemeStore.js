import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Theme store — persists the user's preference across refreshes.
 * Also syncs the class on <html> so Tailwind dark mode works correctly.
 */
export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light', // 'light' | 'dark'

      setTheme: (theme) => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        set({ theme });
      },

      toggleTheme: () => {
        const root = window.document.documentElement;
        const current = root.classList.contains('dark') ? 'dark' : 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        root.classList.remove('light', 'dark');
        root.classList.add(next);
        set({ theme: next });
      },
    }),
    {
      name: 'repair-theme', // localStorage key
    }
  )
);
