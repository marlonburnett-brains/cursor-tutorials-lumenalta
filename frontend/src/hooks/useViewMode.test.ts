import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useViewMode } from './useViewMode';
import { useMediaQuery } from './useMediaQuery';
import { useLocalStorage } from './useLocalStorage';

// Mock dependencies
vi.mock('./useMediaQuery');
vi.mock('./useLocalStorage');

describe('useViewMode', () => {
  const mockUseMediaQuery = vi.mocked(useMediaQuery);
  const mockUseLocalStorage = vi.mocked(useLocalStorage);

  let mockSetStoredMode: (value: 'kanban' | 'compact' | ((val: 'kanban' | 'compact') => 'kanban' | 'compact')) => void;
  let localStorageMock: Record<string, string>;

  beforeEach(() => {
    localStorageMock = {};
    
    // Mock localStorage
    global.Storage.prototype.getItem = vi.fn((key: string) => {
      return localStorageMock[key] || null;
    });
    
    global.Storage.prototype.setItem = vi.fn((key: string, value: string) => {
      localStorageMock[key] = value;
    });

    mockSetStoredMode = vi.fn((value) => {
      const newValue = typeof value === 'function' 
        ? value('kanban') 
        : value;
      localStorageMock['task_view_mode'] = JSON.stringify(newValue);
    });

    // Default mock implementations
    mockUseMediaQuery.mockReturnValue(false); // Desktop by default
    mockUseLocalStorage.mockReturnValue(['kanban', mockSetStoredMode, null]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('default mode selection', () => {
    it('should default to kanban mode on desktop', () => {
      mockUseMediaQuery.mockReturnValue(false);
      mockUseLocalStorage.mockReturnValue(['kanban', mockSetStoredMode, null]);
      
      const { result } = renderHook(() => useViewMode());
      
      expect(result.current.viewMode).toBe('kanban');
      expect(result.current.isLocked).toBe(false);
    });

    it('should load saved preference from localStorage', () => {
      mockUseMediaQuery.mockReturnValue(false);
      mockUseLocalStorage.mockReturnValue(['compact', mockSetStoredMode, null]);
      
      const { result } = renderHook(() => useViewMode());
      
      expect(result.current.viewMode).toBe('compact');
    });
  });

  describe('localStorage persistence', () => {
    it('should persist view mode to localStorage when toggled', () => {
      mockUseMediaQuery.mockReturnValue(false);
      mockUseLocalStorage.mockReturnValue(['kanban', mockSetStoredMode, null]);
      
      const { result } = renderHook(() => useViewMode());
      
      act(() => {
        result.current.toggleViewMode();
      });
      
      expect(mockSetStoredMode).toHaveBeenCalledWith('compact');
    });

    it('should restore preference from localStorage on desktop', () => {
      mockUseMediaQuery.mockReturnValue(false);
      mockUseLocalStorage.mockReturnValue(['compact', mockSetStoredMode, null]);
      
      const { result } = renderHook(() => useViewMode());
      
      expect(result.current.viewMode).toBe('compact');
    });
  });

  describe('responsive locking', () => {
    it('should force Compact mode on mobile (<640px)', () => {
      mockUseMediaQuery.mockReturnValue(true); // Mobile
      mockUseLocalStorage.mockReturnValue(['kanban', mockSetStoredMode, null]);
      
      const { result } = renderHook(() => useViewMode());
      
      expect(result.current.viewMode).toBe('compact');
      expect(result.current.isLocked).toBe(true);
    });

    it('should restore user preference when resizing from mobile to desktop', () => {
      // Start on mobile
      mockUseMediaQuery.mockReturnValue(true);
      mockUseLocalStorage.mockReturnValue(['kanban', mockSetStoredMode, null]);
      
      const { result, rerender } = renderHook(() => useViewMode());
      
      expect(result.current.viewMode).toBe('compact');
      
      // Resize to desktop
      mockUseMediaQuery.mockReturnValue(false);
      mockUseLocalStorage.mockReturnValue(['kanban', mockSetStoredMode, null]);
      
      rerender();
      
      expect(result.current.viewMode).toBe('kanban');
      expect(result.current.isLocked).toBe(false);
    });

    it('should lock to Compact mode even if user preference is Kanban on mobile', () => {
      mockUseMediaQuery.mockReturnValue(true); // Mobile
      mockUseLocalStorage.mockReturnValue(['kanban', mockSetStoredMode, null]);
      
      const { result } = renderHook(() => useViewMode());
      
      expect(result.current.viewMode).toBe('compact');
      expect(result.current.isLocked).toBe(true);
    });
  });

  describe('toggle behavior', () => {
    it('should toggle from kanban to compact on desktop', () => {
      mockUseMediaQuery.mockReturnValue(false);
      mockUseLocalStorage.mockReturnValue(['kanban', mockSetStoredMode, null]);
      
      const { result } = renderHook(() => useViewMode());
      
      act(() => {
        result.current.toggleViewMode();
      });
      
      expect(mockSetStoredMode).toHaveBeenCalledWith('compact');
    });

    it('should toggle from compact to kanban on desktop', () => {
      mockUseMediaQuery.mockReturnValue(false);
      mockUseLocalStorage.mockReturnValue(['compact', mockSetStoredMode, null]);
      
      const { result } = renderHook(() => useViewMode());
      
      act(() => {
        result.current.toggleViewMode();
      });
      
      expect(mockSetStoredMode).toHaveBeenCalledWith('kanban');
    });

    it('should not toggle when locked on mobile', () => {
      mockUseMediaQuery.mockReturnValue(true); // Mobile
      mockUseLocalStorage.mockReturnValue(['compact', mockSetStoredMode, null]);
      
      const { result } = renderHook(() => useViewMode());
      
      const initialMode = result.current.viewMode;
      
      act(() => {
        result.current.toggleViewMode();
      });
      
      // Should remain unchanged
      expect(result.current.viewMode).toBe(initialMode);
      expect(mockSetStoredMode).not.toHaveBeenCalled();
    });
  });

  describe('isLocked state', () => {
    it('should return true on mobile', () => {
      mockUseMediaQuery.mockReturnValue(true);
      mockUseLocalStorage.mockReturnValue(['kanban', mockSetStoredMode, null]);
      
      const { result } = renderHook(() => useViewMode());
      
      expect(result.current.isLocked).toBe(true);
    });

    it('should return false on desktop', () => {
      mockUseMediaQuery.mockReturnValue(false);
      mockUseLocalStorage.mockReturnValue(['kanban', mockSetStoredMode, null]);
      
      const { result } = renderHook(() => useViewMode());
      
      expect(result.current.isLocked).toBe(false);
    });
  });
});

