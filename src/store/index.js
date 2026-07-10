/**
 * Central barrel export for all Zustand stores.
 * Import from here instead of directly from individual store files.
 *
 * Example:
 *   import { useAuthStore, useThemeStore } from '@/store';
 */

export { useAuthStore } from './useAuthStore';
export { useThemeStore } from './useThemeStore';
export { useUIStore } from './useUIStore';
export { useUserStore } from './useUserStore';
export { useStudentStore } from './useStudentStore';
export { useTaskStore } from './useTaskStore';

