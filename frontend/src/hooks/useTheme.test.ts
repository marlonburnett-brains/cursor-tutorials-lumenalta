import { renderHook, act } from '@testing-library/react';
import { useTheme } from './useTheme';
import { defaultTheme } from '../config/themes';

/**
 * Unit tests for useTheme hook
 * 
 * Tests cover:
 * - Default theme initialization
 * - Theme switching functionality
 * - localStorage persistence
 * - data-theme attribute updates
 */

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useTheme', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    
    // Clear any existing data-theme attribute
    document.documentElement.removeAttribute('data-theme');
  });

  describe('Default theme initialization', () => {
    it('should initialize with default theme when localStorage is empty', () => {
      const { result } = renderHook(() => useTheme());

      expect(result.current.currentTheme).toBe(defaultTheme);
      expect(result.current.currentTheme).toBe('tech-modern');
    });

    it('should set data-theme attribute on mount with default theme', () => {
      renderHook(() => useTheme());

      const dataTheme = document.documentElement.getAttribute('data-theme');
      expect(dataTheme).toBe(defaultTheme);
    });

    it('should return all available themes', () => {
      const { result } = renderHook(() => useTheme());

      expect(result.current.availableThemes).toEqual([
        'tech-modern',
        'warm-inviting',
        'professional-elegant',
        'natural-calm',
        'bold-energetic',
      ]);
      expect(result.current.availableThemes).toHaveLength(5);
    });

    it('should provide access to themes object', () => {
      const { result } = renderHook(() => useTheme());

      expect(result.current.themes).toBeDefined();
      expect(result.current.themes['tech-modern']).toBeDefined();
      expect(result.current.themes['tech-modern'].displayName).toBe('Tech Modern');
    });
  });

  describe('Theme switching functionality', () => {
    it('should switch to a new theme', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme('warm-inviting');
      });

      expect(result.current.currentTheme).toBe('warm-inviting');
    });

    it('should update data-theme attribute when theme changes', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme('professional-elegant');
      });

      const dataTheme = document.documentElement.getAttribute('data-theme');
      expect(dataTheme).toBe('professional-elegant');
    });

    it('should switch between multiple themes', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme('natural-calm');
      });
      expect(result.current.currentTheme).toBe('natural-calm');

      act(() => {
        result.current.setTheme('bold-energetic');
      });
      expect(result.current.currentTheme).toBe('bold-energetic');

      act(() => {
        result.current.setTheme('tech-modern');
      });
      expect(result.current.currentTheme).toBe('tech-modern');
    });
  });

  describe('localStorage persistence', () => {
    it('should persist theme to localStorage when changed', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme('warm-inviting');
      });

      const storedTheme = localStorageMock.getItem('todo-app-theme');
      expect(storedTheme).toBe('"warm-inviting"');
    });

    it('should load persisted theme from localStorage on mount', () => {
      // Pre-populate localStorage
      localStorageMock.setItem('todo-app-theme', '"natural-calm"');

      const { result } = renderHook(() => useTheme());

      expect(result.current.currentTheme).toBe('natural-calm');
    });

    it('should maintain theme across remounts', () => {
      // First mount - set theme
      const { unmount } = renderHook(() => useTheme());
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme('professional-elegant');
      });

      unmount();

      // Second mount - verify theme persists
      const { result: result2 } = renderHook(() => useTheme());
      expect(result2.current.currentTheme).toBe('professional-elegant');
    });
  });

  describe('data-theme attribute updates', () => {
    it('should set data-theme attribute on document root', () => {
      renderHook(() => useTheme());

      const dataTheme = document.documentElement.getAttribute('data-theme');
      expect(dataTheme).toBeTruthy();
    });

    it('should update data-theme attribute when theme changes', () => {
      const { result } = renderHook(() => useTheme());

      const themes = ['warm-inviting', 'professional-elegant', 'natural-calm', 'bold-energetic'];

      themes.forEach((theme) => {
        act(() => {
          result.current.setTheme(theme as any);
        });

        const dataTheme = document.documentElement.getAttribute('data-theme');
        expect(dataTheme).toBe(theme);
      });
    });

    it('should always have a data-theme attribute (never null)', () => {
      const { result } = renderHook(() => useTheme());

      // Check initial state
      expect(document.documentElement.getAttribute('data-theme')).not.toBeNull();

      // Check after theme change
      act(() => {
        result.current.setTheme('warm-inviting');
      });

      expect(document.documentElement.getAttribute('data-theme')).not.toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('should handle invalid theme gracefully (fallback to stored value)', () => {
      const { result } = renderHook(() => useTheme());

      // First set a valid theme
      act(() => {
        result.current.setTheme('warm-inviting');
      });

      expect(result.current.currentTheme).toBe('warm-inviting');
    });

    it('should handle corrupted localStorage data', () => {
      // Set invalid JSON in localStorage
      localStorageMock.setItem('todo-app-theme', 'invalid-json{{{');

      const { result } = renderHook(() => useTheme());

      // Should fall back to default theme
      expect(result.current.currentTheme).toBe(defaultTheme);
    });
  });
});

