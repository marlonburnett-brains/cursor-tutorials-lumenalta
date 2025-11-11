import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import TaskBoard from './TaskBoard';
import { TasksProvider } from '../../contexts/TasksContext';
import { Task } from '../../types/task';

// Mock the hooks
vi.mock('../../contexts/TasksContext', async () => {
  const actual = await vi.importActual('../../contexts/TasksContext');
  return {
    ...actual,
    useTasksContext: vi.fn(),
  };
});

const mockTasks: Task[] = [
  {
    id: '1',
    content: 'Test task 1',
    status: 'todo',
    createdAt: Date.now(),
  },
  {
    id: '2',
    content: 'Test task 2',
    status: 'in-progress',
    createdAt: Date.now() - 1000,
  },
  {
    id: '3',
    content: 'Test task 3',
    status: 'completed',
    createdAt: Date.now() - 2000,
  },
];

describe('TaskBoard', () => {
  const mockGetTasksByStatus = vi.fn();
  const mockUpdateTaskStatus = vi.fn();
  const mockDeleteTask = vi.fn();
  const mockRefreshTasks = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();
    
    const { useTasksContext } = await import('../../contexts/TasksContext');
    vi.mocked(useTasksContext).mockReturnValue({
      tasks: mockTasks,
      loading: false,
      error: null,
      createTask: vi.fn(),
      updateTask: vi.fn(),
      updateTaskStatus: mockUpdateTaskStatus,
      deleteTask: mockDeleteTask,
      getTasksByStatus: mockGetTasksByStatus,
      clearAllTasks: vi.fn(),
      refreshTasks: mockRefreshTasks,
      isTaskPending: vi.fn(() => false),
    } as any);
  });

  describe('mode switching', () => {
    it('should render Kanban mode when viewMode is kanban', () => {
      mockGetTasksByStatus.mockImplementation((status: string) => 
        mockTasks.filter(t => t.status === status)
      );
      
      render(
        <TasksProvider>
          <TaskBoard viewMode="kanban" />
        </TasksProvider>
      );

      const taskBoard = screen.getByTestId('task-board');
      expect(taskBoard).toHaveClass('task-board--kanban');
      
      // Should have three columns
      expect(screen.getByTestId('task-column-todo')).toBeInTheDocument();
      expect(screen.getByTestId('task-column-in-progress')).toBeInTheDocument();
      expect(screen.getByTestId('task-column-completed')).toBeInTheDocument();
    });

    it('should render Compact mode when viewMode is compact', () => {
      mockGetTasksByStatus.mockImplementation((status: string) => 
        mockTasks.filter(t => t.status === status)
      );
      
      render(
        <TasksProvider>
          <TaskBoard viewMode="compact" />
        </TasksProvider>
      );

      const taskBoard = screen.getByTestId('task-board');
      expect(taskBoard).toHaveClass('task-board--compact');
      
      // Should have StatusTabs
      expect(screen.getByTestId('status-tabs')).toBeInTheDocument();
    });
  });

  describe('task count accuracy', () => {
    it('should display correct task counts in Kanban mode', () => {
      mockGetTasksByStatus.mockImplementation((status: string) => 
        mockTasks.filter(t => t.status === status)
      );
      
      render(
        <TasksProvider>
          <TaskBoard viewMode="kanban" />
        </TasksProvider>
      );

      // Check task counts in column headers
      const todoCount = screen.getByTestId('task-count-todo');
      expect(todoCount).toHaveTextContent('(1)');
      
      const inProgressCount = screen.getByTestId('task-count-in-progress');
      expect(inProgressCount).toHaveTextContent('(1)');
      
      const completedCount = screen.getByTestId('task-count-completed');
      expect(completedCount).toHaveTextContent('(1)');
    });

    it('should update task counts when tasks change', async () => {
      let currentTasks = [...mockTasks];
      
      mockGetTasksByStatus.mockImplementation((status: string) => 
        currentTasks.filter(t => t.status === status)
      );
      
      const { rerender } = render(
        <TasksProvider>
          <TaskBoard viewMode="kanban" />
        </TasksProvider>
      );

      // Initial counts
      expect(screen.getByTestId('task-count-todo')).toHaveTextContent('(1)');
      
      // Add a new todo task
      currentTasks = [
        ...currentTasks,
        {
          id: '4',
          content: 'New task',
          status: 'todo',
          createdAt: Date.now(),
        },
      ];
      
      // Update mock
      const { useTasksContext } = await import('../../contexts/TasksContext');
      vi.mocked(useTasksContext).mockReturnValue({
        tasks: currentTasks,
        loading: false,
        error: null,
        createTask: vi.fn(),
        updateTask: vi.fn(),
        updateTaskStatus: mockUpdateTaskStatus,
        deleteTask: mockDeleteTask,
        getTasksByStatus: mockGetTasksByStatus,
        clearAllTasks: vi.fn(),
        refreshTasks: mockRefreshTasks,
        isTaskPending: vi.fn(() => false),
      } as any);
      
      rerender(
        <TasksProvider>
          <TaskBoard viewMode="kanban" />
        </TasksProvider>
      );
      
      // Count should update
      expect(screen.getByTestId('task-count-todo')).toHaveTextContent('(2)');
    });
  });

  describe('loading state', () => {
    it('should show loading skeleton in Kanban mode', async () => {
      const { useTasksContext } = await import('../../contexts/TasksContext');
      vi.mocked(useTasksContext).mockReturnValue({
        tasks: [],
        loading: true,
        error: null,
        createTask: vi.fn(),
        updateTask: vi.fn(),
        updateTaskStatus: mockUpdateTaskStatus,
        deleteTask: mockDeleteTask,
        getTasksByStatus: mockGetTasksByStatus,
        clearAllTasks: vi.fn(),
        refreshTasks: mockRefreshTasks,
        isTaskPending: vi.fn(() => false),
      } as any);
      
      render(
        <TasksProvider>
          <TaskBoard viewMode="kanban" />
        </TasksProvider>
      );

      const loadingBoard = screen.getByTestId('task-board-loading');
      expect(loadingBoard).toBeInTheDocument();
      expect(loadingBoard).toHaveClass('task-board--kanban');
    });

    it('should show loading skeleton in Compact mode', async () => {
      const { useTasksContext } = await import('../../contexts/TasksContext');
      vi.mocked(useTasksContext).mockReturnValue({
        tasks: [],
        loading: true,
        error: null,
        createTask: vi.fn(),
        updateTask: vi.fn(),
        updateTaskStatus: mockUpdateTaskStatus,
        deleteTask: mockDeleteTask,
        getTasksByStatus: mockGetTasksByStatus,
        clearAllTasks: vi.fn(),
        refreshTasks: mockRefreshTasks,
        isTaskPending: vi.fn(() => false),
      } as any);
      
      render(
        <TasksProvider>
          <TaskBoard viewMode="compact" />
        </TasksProvider>
      );

      const loadingBoard = screen.getByTestId('task-board-loading');
      expect(loadingBoard).toBeInTheDocument();
      expect(loadingBoard).toHaveClass('task-board--compact');
    });
  });

  describe('error state', () => {
    it('should show error state with correct mode class', async () => {
      const { useTasksContext } = await import('../../contexts/TasksContext');
      vi.mocked(useTasksContext).mockReturnValue({
        tasks: [],
        loading: false,
        error: new Error('Failed to load tasks'),
        createTask: vi.fn(),
        updateTask: vi.fn(),
        updateTaskStatus: mockUpdateTaskStatus,
        deleteTask: mockDeleteTask,
        getTasksByStatus: mockGetTasksByStatus,
        clearAllTasks: vi.fn(),
        refreshTasks: mockRefreshTasks,
        isTaskPending: vi.fn(() => false),
      } as any);
      
      render(
        <TasksProvider>
          <TaskBoard viewMode="kanban" />
        </TasksProvider>
      );

      const errorBoard = screen.getByText('Unable to Load Tasks').closest('.task-board-error');
      expect(errorBoard).toBeInTheDocument();
      expect(errorBoard).toHaveClass('task-board--kanban');
    });
  });
});

