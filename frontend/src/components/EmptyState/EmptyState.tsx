import { TaskStatus } from '../../types/task';
import './EmptyState.css';

interface EmptyStateProps {
  status: TaskStatus;
  viewMode?: 'kanban' | 'compact';
}

/**
 * EmptyState Component
 * 
 * Displays friendly empty state messages for each column/tab.
 * Messages are tailored to the specific status and view mode.
 */
function EmptyState({ status, viewMode = 'kanban' }: EmptyStateProps) {
  const isCompactMode = viewMode === 'compact';
  
  const messages: Record<TaskStatus, { emoji: string; text: string; compactText?: string }> = {
    todo: {
      emoji: '✨',
      text: 'Click + New Task to get started!',
      compactText: 'No tasks to do. Click + New Task to create one!',
    },
    'in-progress': {
      emoji: '🚀',
      text: 'Drag tasks here when you start working on them',
      compactText: 'No tasks in progress. Start working on a task to see it here!',
    },
    completed: {
      emoji: '🎉',
      text: 'Completed tasks will appear here',
      compactText: 'No completed tasks yet. Complete a task to see it here!',
    },
  };

  const message = messages[status];
  const displayText = isCompactMode && message.compactText ? message.compactText : message.text;

  return (
    <div className="empty-state" data-testid="empty-state">
      <div className="empty-state-emoji">{message.emoji}</div>
      <p className="empty-state-text">{displayText}</p>
    </div>
  );
}

export default EmptyState;

