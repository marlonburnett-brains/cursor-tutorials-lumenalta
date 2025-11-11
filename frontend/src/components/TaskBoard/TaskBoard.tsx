import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useState } from 'react';
import { useTasksContext } from '../../contexts/TasksContext';
import TaskColumn from '../TaskColumn/TaskColumn';
import TaskCard from '../TaskCard/TaskCard';
import CompactView from '../CompactView/CompactView';
import { Task, TaskStatus } from '../../types/task';
import { ViewMode } from '../../hooks/useViewMode';
import { playSuccessSound } from '../../utils/sounds';
import './TaskBoard.css';

interface TaskBoardProps {
  viewMode: ViewMode;
}

/**
 * TaskBoard Component
 * 
 * Main container that conditionally renders:
 * - Kanban mode: 3-column layout for To Do, In Progress, and Completed tasks with drag-and-drop
 * - Compact mode: Single-column layout with status tabs
 * 
 * Manages task state, provides columns with filtered task data, and handles drag-and-drop.
 */
function TaskBoard({ viewMode }: TaskBoardProps) {
  const { tasks, loading, error, getTasksByStatus, updateTaskStatus, refreshTasks } = useTasksContext();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const taskId = active.id as string;
    
    // Find the task being dragged
    const allTasks = [
      ...getTasksByStatus('todo'),
      ...getTasksByStatus('in-progress'),
      ...getTasksByStatus('completed'),
    ];
    const task = allTasks.find((t) => t.id === taskId);
    
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveTask(null);
      return;
    }

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    try {
      // Update task status
      await updateTaskStatus(taskId, newStatus);
      
      // Haptic feedback (if supported)
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      
      // Sound effect (optional, fails gracefully)
      playSuccessSound();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }

    setActiveTask(null);
  };

  // Skeleton loading state
  if (loading) {
    return (
      <div className={`task-board task-board--${viewMode}`} data-testid="task-board-loading">
        {['todo', 'in-progress', 'completed'].map((status) => (
          <div key={status} className="task-column glass">
            <div className="task-column-header">
              <h2 className="task-column-title skeleton-text">Loading...</h2>
              <span className="task-column-count skeleton-badge">0</span>
            </div>
            <div className="task-column-content">
              {[1, 2, 3].map((i) => (
                <div key={i} className="task-card glass skeleton-card">
                  <div className="skeleton-line skeleton-line-short"></div>
                  <div className="skeleton-line skeleton-line-long"></div>
                  <div className="skeleton-line skeleton-line-medium"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state with retry button
  if (error) {
    return (
      <div className={`task-board-error glass task-board--${viewMode}`}>
        <div className="error-icon-large">⚠️</div>
        <h2>Unable to Load Tasks</h2>
        <p>{error.message}</p>
        <button 
          className="error-retry-button-large"
          onClick={refreshTasks}
        >
          🔄 Retry
        </button>
      </div>
    );
  }

  // Render Compact mode
  if (viewMode === 'compact') {
    return (
      <div className="task-board task-board--compact" data-testid="task-board">
        <CompactView />
      </div>
    );
  }

  // Render Kanban mode
  const columns: Array<{
    status: TaskStatus;
    title: string;
  }> = [
    { status: 'todo', title: 'To Do' },
    { status: 'in-progress', title: 'In Progress' },
    { status: 'completed', title: 'Completed' },
  ];

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="task-board task-board--kanban" data-testid="task-board">
        {columns.map((column) => (
          <TaskColumn
            key={column.status}
            status={column.status}
            title={column.title}
            tasks={getTasksByStatus(column.status)}
          />
        ))}
      </div>
      
      <DragOverlay>
        {activeTask ? (
          <div className="task-card-drag-overlay glass">
            <TaskCard task={activeTask} onDelete={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default TaskBoard;

