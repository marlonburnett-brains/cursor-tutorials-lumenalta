import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useMediaQuery } from './useMediaQuery';

describe('useMediaQuery', () => {
  let matchMediaMock: {
    matches: boolean;
    media: string;
    onchange: null | ((event: MediaQueryListEvent) => void);
    addListener: (callback: (event: MediaQueryListEvent) => void) => void;
    removeListener: (callback: (event: MediaQueryListEvent) => void) => void;
    addEventListener: (event: string, callback: (event: MediaQueryListEvent) => void) => void;
    removeEventListener: (event: string, callback: (event: MediaQueryListEvent) => void) => void;
    dispatchEvent: (event: Event) => boolean;
  };

  let changeHandlers: Array<(event: MediaQueryListEvent) => void> = [];

  beforeEach(() => {
    changeHandlers = [];
    
    // Create mock MediaQueryList
    matchMediaMock = {
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn((callback: (event: MediaQueryListEvent) => void) => {
        changeHandlers.push(callback);
      }),
      removeListener: vi.fn((callback: (event: MediaQueryListEvent) => void) => {
        const index = changeHandlers.indexOf(callback);
        if (index > -1) {
          changeHandlers.splice(index, 1);
        }
      }),
      addEventListener: vi.fn((event: string, callback: (event: MediaQueryListEvent) => void) => {
        if (event === 'change') {
          changeHandlers.push(callback);
        }
      }),
      removeEventListener: vi.fn((event: string, callback: (event: MediaQueryListEvent) => void) => {
        if (event === 'change') {
          const index = changeHandlers.indexOf(callback);
          if (index > -1) {
            changeHandlers.splice(index, 1);
          }
        }
      }),
      dispatchEvent: vi.fn(),
    };

    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => {
        matchMediaMock.media = query;
        return matchMediaMock;
      }),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    changeHandlers = [];
  });

  describe('initial match state', () => {
    it('should return true when media query initially matches', () => {
      matchMediaMock.matches = true;
      const { result } = renderHook(() => useMediaQuery('(max-width: 640px)'));
      expect(result.current).toBe(true);
    });

    it('should return false when media query initially does not match', () => {
      matchMediaMock.matches = false;
      const { result } = renderHook(() => useMediaQuery('(max-width: 640px)'));
      expect(result.current).toBe(false);
    });
  });

  describe('listener setup', () => {
    it('should set up event listener on mount', () => {
      renderHook(() => useMediaQuery('(max-width: 640px)'));
      
      // Should use addEventListener if available, otherwise addListener
      if (matchMediaMock.addEventListener) {
        expect(matchMediaMock.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
      } else {
        expect(matchMediaMock.addListener).toHaveBeenCalledWith(expect.any(Function));
      }
      
      // Should have at least one change handler registered
      expect(changeHandlers.length).toBeGreaterThan(0);
    });

    it('should clean up event listener on unmount', () => {
      const { unmount } = renderHook(() => useMediaQuery('(max-width: 640px)'));
      
      const handlerCountBefore = changeHandlers.length;
      expect(handlerCountBefore).toBeGreaterThan(0);
      
      unmount();
      
      // Should use removeEventListener if available, otherwise removeListener
      if (matchMediaMock.removeEventListener) {
        expect(matchMediaMock.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
      } else {
        expect(matchMediaMock.removeListener).toHaveBeenCalledWith(expect.any(Function));
      }
    });
  });

  describe('state updates', () => {
    it('should update state when media query match changes', async () => {
      matchMediaMock.matches = false;
      const { result } = renderHook(() => useMediaQuery('(max-width: 640px)'));
      
      expect(result.current).toBe(false);
      
      // Simulate media query change
      matchMediaMock.matches = true;
      const event = { matches: true } as MediaQueryListEvent;
      
      // Call all registered handlers within act
      act(() => {
        changeHandlers.forEach(handler => handler(event));
      });
      
      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('should handle multiple media query changes', async () => {
      matchMediaMock.matches = false;
      const { result } = renderHook(() => useMediaQuery('(max-width: 640px)'));
      
      // First change
      matchMediaMock.matches = true;
      act(() => {
        changeHandlers.forEach(handler => handler({ matches: true } as MediaQueryListEvent));
      });
      
      await waitFor(() => {
        expect(result.current).toBe(true);
      });
      
      // Second change
      matchMediaMock.matches = false;
      act(() => {
        changeHandlers.forEach(handler => handler({ matches: false } as MediaQueryListEvent));
      });
      
      await waitFor(() => {
        expect(result.current).toBe(false);
      });
    });
  });

  describe('query changes', () => {
    it('should re-setup listener when query changes', () => {
      const { rerender, unmount } = renderHook(
        ({ query }) => useMediaQuery(query),
        { initialProps: { query: '(max-width: 640px)' } }
      );
      
      const firstHandlerCount = changeHandlers.length;
      expect(firstHandlerCount).toBeGreaterThan(0);
      
      rerender({ query: '(max-width: 768px)' });
      
      // Should have set up listener for new query
      // Note: The old listener should be cleaned up and a new one added
      expect(matchMediaMock.addEventListener || matchMediaMock.addListener).toHaveBeenCalled();
      
      unmount();
    });
  });
});
