import { useEffect } from 'react';

/**
 * Custom hook for global keyboard shortcuts
 */
export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // N or Cmd/Ctrl+N: Focus on New Task button
      if (
        (event.key === 'n' || event.key === 'N') &&
        (event.metaKey || event.ctrlKey || (!event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey))
      ) {
        // Prevent default browser behavior for Cmd/Ctrl+N (new window)
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault();
        }

        // Don't trigger if user is typing in an input/textarea
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return;
        }

        // Find and click the New Task button
        const newTaskButton = document.querySelector('.new-task-button-add') as HTMLButtonElement;
        if (newTaskButton) {
          newTaskButton.click();
        }
      }

      // ? key: Show keyboard shortcuts help (if we add a help dialog later)
      if (event.key === '?' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return;
        }
        // Could show a help dialog here in future
        console.log('Keyboard shortcuts: N = New task, Esc = Cancel, Enter = Save/Submit');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}

