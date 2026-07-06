import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * useUserStore — persists the full specialist profile and tracks
 * integrity/session flags derived from the JWT.
 *
 * Shape mirrors the backend User model:
 *   id, email, name, phone, institutionName, experience,
 *   serviceDomain, focusAreas, createdAt, updatedAt
 *
 * Extra client-side fields:
 *   isProfileLoaded  — true once the full profile has been fetched from /api/auth/me
 *   lastFetchedAt    — ISO timestamp of the last successful fetch
 *   isLoading        — transient, NOT persisted
 *   error            — transient, NOT persisted
 */
export const useUserStore = create(
  persist(
    (set, get) => ({
      // ── Persisted Profile Fields ─────────────────────────────────────
      id: null,
      email: null,
      name: null,
      phone: null,
      institutionName: null,
      experience: null,
      serviceDomain: null,
      focusAreas: [],
      profileUrl: null,

      // ── Integrity / Session Metadata ─────────────────────────────────
      /** True once the full profile has been fetched via fetchProfile(). */
      isProfileLoaded: false,
      /** ISO string — when was the profile last synced from the server? */
      lastFetchedAt: null,

      // ── Transient (not persisted) ────────────────────────────────────
      isLoading: false,
      error: null,

      // ── Actions ──────────────────────────────────────────────────────

      /**
       * Hydrate the store from the minimal auth payload returned by login/register.
       * Call this immediately after a successful login or registration so that
       * basic user info (id, email, name) is available without a second round-trip.
       */
      hydrateFromAuth: (authUser) => {
        set({
          id: authUser.id,
          email: authUser.email,
          name: authUser.name,
          // These won't be set yet — they need fetchProfile()
          isProfileLoaded: false,
        });
      },

      /**
       * Fetch the full user profile from GET /api/auth/me.
       * Requires a valid JWT token (pass it in from useAuthStore).
       *
       * @param {string} token  — Bearer JWT from useAuthStore
       */
      fetchProfile: async (token) => {
        if (!token) return;
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();

          if (!response.ok) {
            set({ error: data.message || 'Failed to fetch profile', isLoading: false });
            return { success: false };
          }

          const u = data.user;
          set({
            id: u._id,
            email: u.email,
            name: u.name,
            phone: u.phone ?? null,
            institutionName: u.institutionName ?? null,
            experience: u.experience ?? null,
          serviceDomain: u.serviceDomain ?? null,
            focusAreas: u.focusAreas ?? [],
            profileUrl: u.profileUrl ?? null,
            isProfileLoaded: true,
            lastFetchedAt: new Date().toISOString(),
            isLoading: false,
            error: null,
          });
          return { success: true };
        } catch (err) {
          const message = 'Could not load profile. Please try again.';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      /**
       * Update profile fields locally (optimistic update).
       * Extend this to also call a PATCH /api/auth/me endpoint when ready.
       *
       * @param {Partial<Profile>} updates — fields to merge
       */
      updateProfile: (updates) => {
        set((state) => ({
          ...state,
          ...updates,
        }));
      },

      /**
       * Upload a profile photo to Cloudinary via the backend.
       * Updates profileUrl in the store on success.
       *
       * @param {File}   file  — The image File object from the file input
       * @param {string} token — Bearer JWT from useAuthStore
       */
      uploadPhoto: async (file, token) => {
        if (!file || !token) return { success: false };
        set({ isLoading: true, error: null });
        try {
          const formData = new FormData();
          formData.append('photo', file);
          const response = await fetch(`${API_BASE}/auth/upload-photo`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });
          const data = await response.json();
          if (!response.ok) {
            set({ error: data.message || 'Upload failed', isLoading: false });
            return { success: false };
          }
          set({ profileUrl: data.profileUrl, isLoading: false, error: null });
          return { success: true, profileUrl: data.profileUrl };
        } catch (err) {
          const message = 'Could not upload photo. Please try again.';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      /**
       * Derived read-only helper — returns a display-ready summary object.
       * Access via: useUserStore(s => s.getDisplayProfile())
       */
      getDisplayProfile: () => {
        const s = get();
        return {
          id: s.id,
          name: s.name ?? 'Unknown Specialist',
          email: s.email,
          phone: s.phone,
          institutionName: s.institutionName,
          experience: s.experience != null ? `${s.experience} year${s.experience !== 1 ? 's' : ''}` : null,
          serviceDomain: s.serviceDomain,
          focusAreas: s.focusAreas,
        };
      },

      /**
       * Wipe all profile state on logout.
       */
      clearProfile: () => {
        set({
          id: null,
          email: null,
          name: null,
          phone: null,
          institutionName: null,
          experience: null,
          serviceDomain: null,
          focusAreas: [],
          profileUrl: null,
          isProfileLoaded: false,
          lastFetchedAt: null,
          isLoading: false,
          error: null,
        });
      },

      /** Clear any error message. */
      clearError: () => set({ error: null }),
    }),
    {
      name: 'repair-user-profile',
      // Persist everything except transient flags
      partialize: (state) => ({
        id: state.id,
        email: state.email,
        name: state.name,
        phone: state.phone,
        institutionName: state.institutionName,
        experience: state.experience,
        serviceDomain: state.serviceDomain,
        focusAreas: state.focusAreas,
        profileUrl: state.profileUrl,
        isProfileLoaded: state.isProfileLoaded,
        lastFetchedAt: state.lastFetchedAt,
      }),
    }
  )
);
