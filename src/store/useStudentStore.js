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
  currentStudent: null,   // holds the student being viewed on the details page
  isLoading: false,
  isLoadingOne: false,
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
   * Fetch a single student by ID for the details page.
   * @param {string} token  - JWT bearer token
   * @param {string} id     - MongoDB ObjectId of the student
   */
  fetchStudentById: async (token, id) => {
    set({ isLoadingOne: true, error: null, currentStudent: null });
    try {
      const res = await fetch(`${API_BASE}/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        set({ error: data.message || 'Failed to fetch student.', isLoadingOne: false });
        return;
      }

      set({ currentStudent: data.student, isLoadingOne: false });
    } catch (err) {
      set({ error: 'Network error while fetching student.', isLoadingOne: false });
    }
  },

  /**
   * Add a new student.
   * @param {string} token   - JWT bearer token
   * @param {object} payload - { name, dob, gender, diagnosis, notes, assessmentStatus }
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

  /**
   * Save assessment result for a student.
   * @param {string} token
   * @param {string} studentId
   * @param {{ assessmentType, assessmentScore, assessmentSeverity }} payload
   */
  /**
   * Save assessment result for a student.
   * @param {string} token
   * @param {string} studentId
   * @param {{ assessmentType, assessmentScore, assessmentSeverity }} payload
   */
  saveAssessmentResult: async (token, studentId, payload) => {
    try {
      const res = await fetch(`${API_BASE}/students/${studentId}/assessment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.message };
      // Update currentStudent in store if it's the same one
      set((state) => ({
        currentStudent: state.currentStudent?._id === studentId ? data.student : state.currentStudent,
      }));
      return { success: true, student: data.student };
    } catch {
      return { success: false, error: 'Network error' };
    }
  },

  /**
   * Fetch current credentials (username, email, defaultPassword) for a student.
   * @param {string} token
   * @param {string} studentId
   * @returns {{ success: boolean, credentials?: object, error?: string }}
   */
  fetchStudentCredentials: async (token, studentId) => {
    try {
      const res = await fetch(`${API_BASE}/students/${studentId}/credentials`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.message };
      return { success: true, credentials: data };
    } catch {
      return { success: false, error: 'Network error' };
    }
  },

  /**
   * Set / update student credentials (email, username, password).
   * @param {string} token
   * @param {string} studentId
   * @param {{ email?, username?, password?, regenerateUsername? }} payload
   * @returns {{ success: boolean, data?: object, error?: string }}
   */
  setStudentCredentials: async (token, studentId, payload) => {
    try {
      const res = await fetch(`${API_BASE}/students/${studentId}/credentials`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.message };
      return { success: true, data };
    } catch {
      return { success: false, error: 'Network error' };
    }
  },

  /** Clear any error message */
  clearError: () => set({ error: null }),
}));

