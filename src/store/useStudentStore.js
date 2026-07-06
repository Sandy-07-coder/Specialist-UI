import { create } from 'zustand';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const useStudentStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────────
  students: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  },
  isLoading: false,
  isAdding: false,
  error: null,

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Fetch paginated students list.
   * @param {string} token     - JWT bearer token
   * @param {object} params    - { page, limit, search }
   */
  fetchStudents: async (token, { page = 1, limit = 10, search = '' } = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams({ page, limit });
      if (search) params.append('search', search);

      const res = await fetch(`${API_BASE}/students?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        set({ error: data.message || 'Failed to fetch students.', isLoading: false });
        return;
      }

      set({ students: data.students, pagination: data.pagination, isLoading: false });
    } catch (err) {
      set({ error: 'Network error while fetching students.', isLoading: false });
    }
  },

  /**
   * Add a new student.
   * @param {string} token   - JWT bearer token
   * @param {object} payload - { name, age, gender, diagnosis, notes, assessmentStatus }
   * @returns {{ success: boolean, student?: object, error?: string }}
   */
  addStudent: async (token, payload) => {
    set({ isAdding: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        set({ error: data.message || 'Failed to add student.', isAdding: false });
        return { success: false, error: data.message };
      }

      // Prepend new student to the current list
      set((state) => ({
        students: [data.student, ...state.students],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1,
        },
        isAdding: false,
      }));

      return { success: true, student: data.student };
    } catch (err) {
      set({ error: 'Network error while adding student.', isAdding: false });
      return { success: false, error: 'Network error' };
    }
  },

  /** Clear any error message */
  clearError: () => set({ error: null }),
}));
