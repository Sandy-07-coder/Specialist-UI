import { create } from 'zustand';

/**
 * UI store — ephemeral, session-only state for layout interactions.
 * NOT persisted: refreshing the page resets all sidebar/modal states.
 */
export const useUIStore = create((set) => ({
  // Sidebar
  isSidebarOpen: false,
  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
