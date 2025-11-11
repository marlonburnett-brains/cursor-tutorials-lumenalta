import { useState, useRef, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskStatus } from '../../types/task';
import { parseTaskContent } from '../../utils/taskParser';
import {
  validateTaskContent,
  isDuplicateTaskExcludingCurrent,
} from '../../utils/validation';
import { useTasksContext } from '../../contexts/TasksContext';
import StatusChangeButtons from '../StatusChangeButtons/StatusChangeButtons';
import './TaskCard.css';

interface TaskCardProps {
  task: Task;
  onDelete: (taskId: string) => void;
  viewMode?: 'kanban' | 'compact';
  onStatusChange?: (newStatus: TaskStatus) => void;
}

/**
 * TaskCard Component
 * 
 * Displays a task card with two modes:
 * - Display mode: Shows parsed title (bold) and description (regular)
 * - Edit mode: Editable textarea with Save/Cancel buttons and character counter
 * 
 * Shows pending state with reduced opacity and disabled actions during API calls.
 */
function TaskCard({ task, onDelete, viewMode = 'kanban', onStatusChange }: TaskCardProps) {
  const { tasks, updateTask, isTaskPending } = useTasksContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(task.content);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isPending = isTaskPending(task.id);
  const isCompactMode = viewMode === 'compact';

  // Drag and drop setup (disabled in compact mode)
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      disabled: isEditing || isPending || isCompactMode, // Prevent dragging while editing, pending, or in compact mode
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : isPending ? 0.6 : 1,
  };

  // Parse content for display mode
  const { title, description } = parseTaskContent(task.content);

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(task.content);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditContent(task.content);
    setError(null);
  };

  const handleSave = async () => {
    try {
      // Validate content
      const validation = validateTaskContent(editContent);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid content');
        return;
      }

      // Check for duplicates (excluding current task)
      if (isDuplicateTaskExcludingCurrent(editContent, task.id, tasks)) {
        setError('A task with this content already exists');
        return;
      }

      // Update task
      await updateTask(task.id, { content: editContent.trim() });
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd/Ctrl + Enter: Add line break (default behavior)
    // Enter alone: Save (only if single line)
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      // Only save on Enter if content is single-line
      if (!editContent.includes('\n')) {
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

  if (isEditing) {
    return (
      <div className={`task-card task-card-editing glass ${isPending ? 'task-card-pending' : ''} ${isCompactMode ? 'task-card--compact' : ''}`} data-testid={`task-item-${task.id}`}>
        <textarea
          ref={textareaRef}
          className="task-card-textarea"
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter task content..."
          rows={4}
          disabled={isPending}
          data-testid={`edit-task-${task.id}`}
        />
        
        <div className="task-card-footer">
          <div className="task-card-meta">
            <span className={`character-count ${editContent.length > 2000 ? 'error' : ''}`}>
              {editContent.length}/2000
            </span>
            {isPending && <span className="pending-indicator">⏳ Saving...</span>}
            {error && <span className="error-message">{error}</span>}
          </div>
          
          <div className="task-card-actions">
            <button
              className="task-card-button task-card-button-cancel"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              className="task-card-button task-card-button-save"
              onClick={handleSave}
              disabled={isPending}
            >
              {isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card glass ${isDragging ? 'task-card-dragging' : ''} ${isPending ? 'task-card-pending' : ''} ${isCompactMode ? 'task-card--compact' : ''}`}
      onClick={isPending ? undefined : handleEdit}
      aria-label={`Task: ${title || description.substring(0, 50)}. ${isCompactMode ? 'Click to edit' : 'Click to edit, or drag to move'}`}
      onKeyDown={(e) => {
        if (!isPending && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleEdit();
        }
      }}
      data-testid={`task-item-${task.id}`}
      {...(!isCompactMode ? { ...attributes, ...listeners } : {})}
    >
      <div className="task-card-content">
        {title && <div className="task-card-title">{title}</div>}
        <div className="task-card-description">{description}</div>
        {isPending && <div className="task-card-pending-indicator">⏳</div>}
      </div>
      
      <div className="task-card-actions-hover">
        <button
          className="task-card-delete"
          onClick={(e) => {
            e.stopPropagation();
            if (!isPending) {
              onDelete(task.id);
            }
          }}
          disabled={isPending}
          aria-label="Delete task"
          title={isPending ? "Please wait..." : "Delete task"}
          data-testid={`delete-task-${task.id}`}
        >
          🗑️
        </button>
      </div>

      {/* Status change buttons for compact mode */}
      {isCompactMode && onStatusChange && (
        <StatusChangeButtons
          currentStatus={task.status}
          onStatusChange={onStatusChange}
        />
      )}
    </div>
  );
}

export default TaskCard;

