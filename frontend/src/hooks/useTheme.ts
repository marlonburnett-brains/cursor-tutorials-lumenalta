import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { ThemeName, themes, defaultTheme, themeNames } from '../config/themes';

/**
 * Custom hook for managing theme state and persistence
 * 
 * Handles theme switching, localStorage persistence, and applying
 * the theme by setting the data-theme attribute on the document root.
 * 
 * @returns Object containing current theme, setter, and available themes
 */
export function useTheme() {
  // Use localStorage to persist theme preference
  const [currentTheme, setCurrentTheme] = useLocalStorage<ThemeName>(
    'todo-app-theme',
    defaultTheme
  );

  // Apply theme to document root whenever it changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', currentTheme);
    }
  }, [currentTheme]);

  // Initialize theme on mount
  useEffect(() => {
    // This ensures the theme is set even if localStorage is empty
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', currentTheme);
    }
  }, []); // Run only once on mount

  return {
    currentTheme,
    setTheme: setCurrentTheme,
    availableThemes: themeNames,
    themes, // Export themes object for accessing theme details
  };
}

