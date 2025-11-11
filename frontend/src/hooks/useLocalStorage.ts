import { useState, useEffect } from 'react';

/**
 * Custom hook for localStorage operations with error handling
 * 
 * Provides state synchronization with localStorage and handles quota exceeded errors.
 * 
 * @param key - localStorage key
 * @param initialValue - Initial value if key doesn't exist
 * @returns [storedValue, setValue, error] - Current value, setter function, and error state
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, Error | null] {
  const [error, setError] = useState<Error | null>(null);

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      setError(error as Error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Reset error state on successful operation
      setError(null);

      // Allow value to be a function so we have the same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      // Save state
      setStoredValue(valueToStore);

      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
      
      // Check if quota exceeded
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        const quotaError = new Error(
          'Storage quota exceeded. Please delete some tasks to free up space.'
        );
        setError(quotaError);
        throw quotaError;
      }

      setError(error as Error);
      throw error;
    }
  };

  // Listen for changes to localStorage from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
          setError(null);
        } catch (error) {
          console.error('Error parsing storage event:', error);
          setError(error as Error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, error];
}

