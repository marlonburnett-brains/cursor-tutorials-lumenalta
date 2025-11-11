import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Task, TaskStatus } from '../../types/task';
import { useTasksContext } from '../../contexts/TasksContext';
import TaskCard from '../TaskCard/TaskCard';
import NewTaskCard from '../NewTaskCard/NewTaskCard';
import EmptyState from '../EmptyState/EmptyState';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';
import './TaskColumn.css';

interface TaskColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
}

/**
 * TaskColumn Component
 * 
 * Individual column component for displaying tasks in a specific status.
 * Features:
 * - Column header with title
 * - Task list container
 * - Independent scrolling
 * - Empty state when no tasks
 * - NewTaskCard for "To Do" column
 */
function TaskColumn({ status, title, tasks }: TaskColumnProps) {
  const { deleteTask } = useTasksContext();
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(10); // Initially display 10 tasks

  // Make column droppable
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  // Sort tasks by createdAt descending (newest first)
  const sortedTasks = [...tasks].sort((a, b) => b.createdAt - a.createdAt);
  
  // Get tasks to display (paginated)
  const tasksToDisplay = sortedTasks.slice(0, displayCount);
  const hasMoreTasks = sortedTasks.length > displayCount;

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 10);
  };

  const handleDeleteClick = (taskId: string) => {
    setTaskToDelete(taskId);
  };

  const handleDeleteConfirm = async () => {
    if (taskToDelete) {
      try {
        await deleteTask(taskToDelete);
        setTaskToDelete(null);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setTaskToDelete(null);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        className={`task-column glass-strong ${isOver ? 'task-column-drag-over' : ''}`}
        role="region"
        aria-label={`${title} column with ${tasks.length} tasks`}
        data-testid={`task-column-${status}`}
      >
        <div className="task-column-header">
          <h2 id={`${status}-heading`}>
            {title}
            <span className="task-count-badge" aria-label={`${tasks.length} tasks`} data-testid={`task-count-${status}`}>
              {' '}({tasks.length})
            </span>
          </h2>
        </div>
        
        <div className="task-column-content" role="list" aria-labelledby={`${status}-heading`}>
          {/* Show NewTaskCard only in "To Do" column */}
          {status === 'todo' && <NewTaskCard />}
          
          {tasks.length === 0 ? (
            <EmptyState status={status} />
          ) : (
            <>
              <div className="task-list">
                {tasksToDisplay.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
              
              {hasMoreTasks && (
                <button
                  className="load-more-button"
                  onClick={handleLoadMore}
                  aria-label={`Load more tasks. ${sortedTasks.length - displayCount} remaining`}
                >
                  + Load more ({sortedTasks.length - displayCount} remaining)
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={taskToDelete !== null}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
}

export default TaskColumn;

