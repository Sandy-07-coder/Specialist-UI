import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE = 'http://localhost:5000/api';

export const useAuthStore = create(
  persist(
    (set) => ({
      // ── Persisted State ──────────────────────────────────────────────
      token: null,
      user: null,

      // ── Transient State (reset on reload, not stored) ────────────────
      isLoading: false,
      error: null,

      // ── Actions ──────────────────────────────────────────────────────

      /** Login: calls POST /api/auth/login and stores token + user. */
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const data = await response.json();

          if (!response.ok) {
            set({ error: data.message || 'Login failed', isLoading: false });
            return { success: false, error: data.message };
          }

          set({ token: data.token, user: data.user, isLoading: false, error: null });
          return { success: true };
        } catch (err) {
          const message = 'An error occurred during login. Please try again.';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      /** Register: calls POST /api/auth/register and stores token + user. */
      register: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const data = await response.json();

          if (!response.ok) {
            set({ error: data.message || 'Registration failed', isLoading: false });
            return { success: false, error: data.message };
          }

          set({ token: data.token, user: data.user, isLoading: false, error: null });
          return { success: true };
        } catch (err) {
          const message = 'An error occurred during registration. Please try again.';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      /** Logout: clears stored auth state. */
      logout: () => {
        set({ token: null, user: null, error: null, isLoading: false });
      },

      /** Clear any auth error (e.g. when user starts typing again). */
      clearError: () => set({ error: null }),
    }),
    {
      name: 'repair-auth',          // localStorage key
      // Only persist the credentials — not loading/error states
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
