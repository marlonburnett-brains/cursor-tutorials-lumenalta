import { useState, useEffect, useCallback, useContext } from 'react';
import { Task, TaskStatus } from '../types/task';
import * as taskService from '../services/taskService';
import { ErrorContext } from '../App';

/**
 * Custom hook for task state management with optimistic updates
 * 
 * Manages task state, CRUD operations, and sorting.
 * Implements optimistic updates for immediate UI feedback.
 * Tasks are sorted by createdAt descending (newest first).
 */
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [pendingTasks, setPendingTasks] = useState<Set<string>>(new Set());
  const errorContext = useContext(ErrorContext);

  /**
   * Mark a task as pending
   */
  const addPendingTask = (taskId: string) => {
    setPendingTasks((prev) => new Set(prev).add(taskId));
  };

  /**
   * Remove a task from pending state
   */
  const removePendingTask = (taskId: string) => {
    setPendingTasks((prev) => {
      const next = new Set(prev);
      next.delete(taskId);
      return next;
    });
  };

  /**
   * Check if a task is pending
   */
  const isTaskPending = (taskId: string): boolean => {
    return pendingTasks.has(taskId);
  };

  /**
   * Load tasks from service
   */
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedTasks = await taskService.getTasks();
      // Sort by createdAt descending (newest first)
      const sortedTasks = loadedTasks.sort((a, b) => b.createdAt - a.createdAt);
      setTasks(sortedTasks);
    } catch (err) {
      const error = err as Error;
      console.error('Error loading tasks:', error);
      setError(error);
      // Show user-friendly error notification with retry
      errorContext?.showError(error.message, loadTasks);
    } finally {
      setLoading(false);
    }
  }, [errorContext]);

  /**
   * Load tasks on mount
   */
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  /**
   * Create a new task with optimistic update
   * 
   * Immediately adds task with temporary ID, then replaces with real ID from server.
   * On failure, removes the optimistic task and shows error.
   */
  const createTask = useCallback(
    async (content: string): Promise<Task> => {
      // Generate temporary ID
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create optimistic task
      const optimisticTask: Task = {
        id: tempId,
        content: content.trim(),
        status: 'todo',
        createdAt: Date.now(),
      };

      // Add optimistic task immediately
      setTasks((prevTasks) => [optimisticTask, ...prevTasks]);
      addPendingTask(tempId);
      setError(null);

      try {
        // Call API
        const newTask = await taskService.createTask(content);
        
        // Replace temp task with real task from server
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task.id === tempId ? newTask : task))
        );
        removePendingTask(tempId);
        
        return newTask;
      } catch (err) {
        const error = err as Error;
        console.error('Error creating task:', error);
        setError(error);
        
        // Remove optimistic task on failure
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== tempId));
        removePendingTask(tempId);
        
        // Show user-friendly error notification with retry
        errorContext?.showError(error.message, () => createTask(content));
        throw err;
      }
    },
    [errorContext]
  );

  /**
   * Update an existing task with optimistic update
   * 
   * Immediately updates task in local state, then confirms with server data.
   * On failure, reverts to previous state and shows error.
   */
  const updateTask = useCallback(
    async (
      id: string,
      updates: Partial<Omit<Task, 'id' | 'createdAt'>>
    ): Promise<Task> => {
      // Store previous state for rollback
      const previousTasks = [...tasks];
      const previousTask = tasks.find((task) => task.id === id);
      
      if (!previousTask) {
        throw new Error(`Task with id ${id} not found`);
      }

      // Optimistic update
      const optimisticTask: Task = {
        ...previousTask,
        ...updates,
      };
      
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === id ? optimisticTask : task))
      );
      addPendingTask(id);
      setError(null);

      try {
        // Call API
        const updatedTask = await taskService.updateTask(id, updates);
        
        // Confirm with server data
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task.id === id ? updatedTask : task))
        );
        removePendingTask(id);
        
        return updatedTask;
      } catch (err) {
        const error = err as Error;
        console.error('Error updating task:', error);
        setError(error);
        
        // Revert to previous state on failure
        setTasks(previousTasks);
        removePendingTask(id);
        
        // Show user-friendly error notification with retry
        errorContext?.showError(error.message, () => updateTask(id, updates));
        throw err;
      }
    },
    [tasks, errorContext]
  );

  /**
   * Update task status (for drag-and-drop) with optimistic update
   * Moves task to top of destination column
   */
  const updateTaskStatus = useCallback(
    async (id: string, status: TaskStatus): Promise<Task> => {
      // Store previous state for rollback
      const previousTasks = [...tasks];
      const previousTask = tasks.find((task) => task.id === id);
      
      if (!previousTask) {
        throw new Error(`Task with id ${id} not found`);
      }

      // Optimistic update with status change
      const optimisticTask: Task = {
        ...previousTask,
        status,
      };
      
      // Update task and move to top of its status group
      setTasks((prevTasks) => {
        // Remove the task from its current position
        const otherTasks = prevTasks.filter((task) => task.id !== id);
        
        // Find tasks with same status
        const sameStatusTasks = otherTasks.filter(
          (task) => task.status === status
        );
        const differentStatusTasks = otherTasks.filter(
          (task) => task.status !== status
        );
        
        // Insert updated task at top of its status group
        return [
          optimisticTask,
          ...sameStatusTasks,
          ...differentStatusTasks,
        ].sort((a, b) => {
          // First sort by status order
          const statusOrder = { 'todo': 0, 'in-progress': 1, 'completed': 2 };
          const statusDiff = statusOrder[a.status] - statusOrder[b.status];
          if (statusDiff !== 0) return statusDiff;
          // Within same status, sort by createdAt descending
          return b.createdAt - a.createdAt;
        });
      });
      addPendingTask(id);
      setError(null);

      try {
        // Call API
        const updatedTask = await taskService.updateTaskStatus(id, status);
        
        // Confirm with server data
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task.id === id ? updatedTask : task))
        );
        removePendingTask(id);
        
        return updatedTask;
      } catch (err) {
        const error = err as Error;
        console.error('Error updating task status:', error);
        setError(error);
        
        // Revert to previous state on failure
        setTasks(previousTasks);
        removePendingTask(id);
        
        // Show user-friendly error notification with retry
        errorContext?.showError(error.message, () => updateTaskStatus(id, status));
        throw err;
      }
    },
    [tasks, errorContext]
  );

  /**
   * Delete a task with optimistic update
   * 
   * Immediately removes task from local state, then confirms deletion.
   * On failure, restores the task and shows error.
   */
  const deleteTask = useCallback(async (id: string): Promise<void> => {
    // Store previous state for rollback
    const previousTasks = [...tasks];
    const taskToDelete = tasks.find((task) => task.id === id);
    
    if (!taskToDelete) {
      throw new Error(`Task with id ${id} not found`);
    }

    // Optimistic delete
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    addPendingTask(id);
    setError(null);

    try {
      // Call API
      await taskService.deleteTask(id);
      removePendingTask(id);
    } catch (err) {
      const error = err as Error;
      console.error('Error deleting task:', error);
      setError(error);
      
      // Restore task on failure
      setTasks(previousTasks);
      removePendingTask(id);
      
      // Show user-friendly error notification with retry
      errorContext?.showError(error.message, () => deleteTask(id));
      throw err;
    }
  }, [tasks, errorContext]);

  /**
   * Get tasks by status
   */
  const getTasksByStatus = useCallback(
    (status: TaskStatus): Task[] => {
      return tasks.filter((task) => task.status === status);
    },
    [tasks]
  );

  /**
   * Clear all tasks (useful for testing)
   */
  const clearAllTasks = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await taskService.clearAllTasks();
      setTasks([]);
    } catch (err) {
      const error = err as Error;
      console.error('Error clearing all tasks:', error);
      setError(error);
      // Show user-friendly error notification with retry
      errorContext?.showError(error.message, clearAllTasks);
      throw err;
    }
  }, [errorContext]);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    getTasksByStatus,
    clearAllTasks,
    refreshTasks: loadTasks,
    isTaskPending,
  };
}
