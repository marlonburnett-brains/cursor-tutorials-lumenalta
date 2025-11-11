import { useState, useEffect, createContext } from 'react'
import TaskBoard from './components/TaskBoard/TaskBoard'
import ThemeSwitcher from './components/ThemeSwitcher/ThemeSwitcher'
import ViewModeToggle from './components/ViewModeToggle/ViewModeToggle'
import ErrorNotification from './components/ErrorNotification/ErrorNotification'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useTheme } from './hooks/useTheme'
import { useViewMode } from './hooks/useViewMode'
import { TasksProvider } from './contexts/TasksContext'
import './App.css'

const LEGACY_STORAGE_KEY = 'kanban_tasks';

/**
 * Error Context
 * Provides global error handling functionality to all components
 */
export interface ErrorContextValue {
  showError: (message: string, retryFn?: () => void) => void;
}

export const ErrorContext = createContext<ErrorContextValue | null>(null);

function App() {
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [error, setError] = useState<{ message: string; retryFn?: () => void } | null>(null)
  
  // Enable global keyboard shortcuts
  useKeyboardShortcuts()
  
  // Initialize theme system
  useTheme()
  
  // Initialize view mode system
  const { viewMode, toggleViewMode, isLocked } = useViewMode()
  
  // Clean up old localStorage data on mount (one-time migration)
  useEffect(() => {
    const hasLegacyData = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (hasLegacyData) {
      console.log('Migrating from localStorage to backend API...');
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      console.log('Legacy localStorage data cleared.');
    }
  }, [])
  
  /**
   * Global error handler
   * Shows error notification with optional retry functionality
   */
  const showError = (message: string, retryFn?: () => void) => {
    setError({ message, retryFn });
  };
  
  /**
   * Dismiss error notification
   */
  const dismissError = () => {
    setError(null);
  };
  
  /**
   * Retry failed operation and dismiss error
   */
  const handleRetry = () => {
    if (error?.retryFn) {
      error.retryFn();
    }
    dismissError();
  };

  return (
    <ErrorContext.Provider value={{ showError }}>
      <TasksProvider>
      <div className="app">
        <header className="app-header">
          <h1>To-Do App</h1>
          <p>Organize your tasks with drag-and-drop simplicity</p>
          
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
            <ThemeSwitcher />
            <ViewModeToggle
              currentMode={viewMode}
              onToggle={toggleViewMode}
              isLocked={isLocked}
            />
            <button
              className="shortcuts-hint-button"
              onClick={() => setShowShortcuts(!showShortcuts)}
              aria-label="Toggle keyboard shortcuts help"
              title="Keyboard shortcuts"
            >
              ⌨️
            </button>
          </div>
          
          {showShortcuts && (
            <div className="shortcuts-panel glass">
              <h3>Keyboard Shortcuts</h3>
              <ul>
                <li><kbd>N</kbd> or <kbd>Cmd/Ctrl+N</kbd> - New task</li>
                <li><kbd>Enter</kbd> - Submit/Save</li>
                <li><kbd>Esc</kbd> - Cancel</li>
                <li><kbd>Cmd/Ctrl+Enter</kbd> - Line break</li>
                <li><kbd>Cmd/Ctrl+S</kbd> - Save edit</li>
              </ul>
            </div>
          )}
        </header>
        <main className="app-main" role="main">
          <TaskBoard viewMode={viewMode} />
        </main>
        
        {/* Error Notification */}
        {error && (
          <ErrorNotification
            message={error.message}
            onRetry={error.retryFn ? handleRetry : undefined}
            onDismiss={dismissError}
          />
        )}
      </div>
    </TasksProvider>
    </ErrorContext.Provider>
  )
}

export default App

