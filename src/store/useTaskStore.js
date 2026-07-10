import { create } from 'zustand';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const useTaskStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────────
  tasks: [],           // tasks for the currently viewed student
  studentId: null,     // which student these tasks belong to (for cache invalidation)
  isLoading: false,
  isSubmitting: false, // true while create/update/delete is in-flight
  error: null,

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Fetch all tasks for a student.
   * @param {string} token     - JWT bearer token
   * @param {string} studentId - MongoDB ObjectId of the student
   */
  fetchTasks: async (token, studentId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/students/${studentId}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        set({ error: data.message || 'Failed to fetch tasks.', isLoading: false });
        return;
      }

      set({ tasks: data.tasks, studentId, isLoading: false });
    } catch {
      set({ error: 'Network error while fetching tasks.', isLoading: false });
    }
  },

  /**
   * Assign a new task to the student.
   * @param {string} token     - JWT bearer token
   * @param {string} studentId - MongoDB ObjectId of the student
   * @param {{ title: string, description: string, status?: string }} payload
   * @returns {{ success: boolean, task?: object, error?: string }}
   */
  createTask: async (token, studentId, payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/students/${studentId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        set({ error: data.message || 'Failed to create task.', isSubmitting: false });
        return { success: false, error: data.message };
      }

      // Prepend the new task so it shows at the top
      set((state) => ({
        tasks: [data.task, ...state.tasks],
        isSubmitting: false,
      }));

      return { success: true, task: data.task };
    } catch {
      set({ error: 'Network error while creating task.', isSubmitting: false });
      return { success: false, error: 'Network error' };
    }
  },

  /**
   * Update a task's title, description, or status.
   * @param {string} token     - JWT bearer token
   * @param {string} studentId
   * @param {string} taskId    - MongoDB ObjectId of the task
   * @param {{ title?: string, description?: string, status?: string }} updates
   * @returns {{ success: boolean, task?: object, error?: string }}
   */
  updateTask: async (token, studentId, taskId, updates) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/students/${studentId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      const data = await res.json();

      if (!res.ok) {
        set({ error: data.message || 'Failed to update task.', isSubmitting: false });
        return { success: false, error: data.message };
      }

      // Merge the updated task back into the list
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === taskId ? data.task : t)),
        isSubmitting: false,
      }));

      return { success: true, task: data.task };
    } catch {
      set({ error: 'Network error while updating task.', isSubmitting: false });
      return { success: false, error: 'Network error' };
    }
  },

  /**
   * Delete a task.
   * @param {string} token
   * @param {string} studentId
   * @param {string} taskId
   * @returns {{ success: boolean, error?: string }}
   */
  deleteTask: async (token, studentId, taskId) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/students/${studentId}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        set({ error: data.message || 'Failed to delete task.', isSubmitting: false });
        return { success: false, error: data.message };
      }

      set((state) => ({
        tasks: state.tasks.filter((t) => t._id !== taskId),
        isSubmitting: false,
      }));

      return { success: true };
    } catch {
      set({ error: 'Network error while deleting task.', isSubmitting: false });
      return { success: false, error: 'Network error' };
    }
  },

  /** Reset task state when navigating away */
  clearTasks: () => set({ tasks: [], studentId: null, error: null }),

  /** Clear any error message */
  clearError: () => set({ error: null }),
}));
