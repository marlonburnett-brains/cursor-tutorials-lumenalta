import { createContext, useContext, ReactNode } from 'react';
import { useTasks } from '../hooks/useTasks';
import { Task, TaskStatus } from '../types/task';

/**
 * Tasks Context
 * 
 * Provides shared task state across all components.
 * Ensures NewTaskCard and TaskBoard use the same state instance.
 */

interface TasksContextType {
  tasks: Task[];
  loading: boolean;
  error: Error | null;
  createTask: (content: string) => Promise<Task>;
  updateTask: (
    id: string,
    updates: Partial<Omit<Task, 'id' | 'createdAt'>>
  ) => Promise<Task>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  getTasksByStatus: (status: TaskStatus) => Task[];
  clearAllTasks: () => Promise<void>;
  refreshTasks: () => Promise<void>;
  isTaskPending: (taskId: string) => boolean;
}

const TasksContext = createContext<TasksContextType | null>(null);

/**
 * TasksProvider Component
 * 
 * Wraps the app and provides shared task state to all child components.
 */
export function TasksProvider({ children }: { children: ReactNode }) {
  const tasksState = useTasks();

  return (
    <TasksContext.Provider value={tasksState}>
      {children}
    </TasksContext.Provider>
  );
}

/**
 * useTasksContext Hook
 * 
 * Access shared task state from any component.
 * Must be used within a TasksProvider.
 */
export function useTasksContext(): TasksContextType {
  const context = useContext(TasksContext);
  
  if (!context) {
    throw new Error('useTasksContext must be used within a TasksProvider');
  }
  
  return context;
}

