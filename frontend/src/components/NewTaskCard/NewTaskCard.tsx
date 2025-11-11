import { useState, useRef, useEffect } from 'react';
import { useTasksContext } from '../../contexts/TasksContext';
import { TaskStatus } from '../../types/task';
import { validateTaskContent, isDuplicateTask } from '../../utils/validation';
import './NewTaskCard.css';

interface NewTaskCardProps {
  defaultStatus?: TaskStatus;
}

/**
 * NewTaskCard Component
 * 
 * "+ New Task" button that transforms into an editable card for task creation.
 * Features:
 * - Always visible at top of "To Do" column (or current tab in Compact mode)
 * - Click to transform into empty editable card
 * - Submit on Enter (single-line) or Save button click
 * - Cancel on Escape or Cancel button
 * - Shows loading state during task creation
 * - Accepts optional defaultStatus prop for Compact mode tab integration
 */
function NewTaskCard({ defaultStatus = 'todo' }: NewTaskCardProps) {
  const { tasks, createTask, updateTaskStatus } = useTasksContext();
  const [isCreating, setIsCreating] = useState(false);
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when entering create mode
  useEffect(() => {
    if (isCreating && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isCreating]);

  const handleNew = () => {
    setIsCreating(true);
    setContent('');
    setError(null);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setContent('');
    setError(null);
  };

  const handleSave = async () => {
    try {
      // Validate content
      const validation = validateTaskContent(content);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid content');
        return;
      }

      // Check for duplicates
      if (isDuplicateTask(content, tasks)) {
        setError('A task with this content already exists');
        return;
      }

      // Set loading state
      setIsSubmitting(true);
      setError(null);

      // Create task
      const newTask = await createTask(content.trim());
      
      // Update status if defaultStatus is not 'todo'
      if (defaultStatus !== 'todo' && newTask.status !== defaultStatus) {
        await updateTaskStatus(newTask.id, defaultStatus);
      }
      
      // Reset form only after successful API response
      setIsCreating(false);
      setContent('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter alone: Save (only if single line)
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      // Only save on Enter if content is single-line
      if (!content.includes('\n')) {
        e.preventDefault();
        handleSave();
      }
    }

    // Escape: Cancel
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }

    // Cmd/Ctrl + S: Save
    if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  if (isCreating) {
    return (
      <div className={`new-task-card new-task-card-editing glass ${isSubmitting ? 'new-task-submitting' : ''}`}>
        <textarea
          ref={textareaRef}
          className="new-task-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What needs to be done?"
          rows={4}
          disabled={isSubmitting}
          data-testid="new-task-input"
        />
        
        <div className="new-task-footer">
          <div className="new-task-meta">
            <span className={`character-count ${content.length > 2000 ? 'error' : ''}`}>
              {content.length}/2000
            </span>
            {isSubmitting && <span className="pending-indicator">⏳ Creating...</span>}
            {error && <span className="error-message">{error}</span>}
          </div>
          
          <div className="new-task-actions">
            <button
              className="new-task-button new-task-button-cancel"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              className="new-task-button new-task-button-save"
              onClick={handleSave}
              disabled={isSubmitting}
              data-testid="add-task-button"
            >
              {isSubmitting ? (
                <>
                  <span className="button-spinner">⏳</span>
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button className="new-task-button-add glass" onClick={handleNew}>
      <span className="new-task-icon">+</span>
      <span className="new-task-text">New Task</span>
    </button>
  );
}

export default NewTaskCard;

