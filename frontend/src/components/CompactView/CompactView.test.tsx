import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import CompactView from './CompactView';
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

describe('CompactView', () => {
  const mockGetTasksByStatus = vi.fn();
  const mockUpdateTaskStatus = vi.fn();
  const mockDeleteTask = vi.fn();

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
      refreshTasks: vi.fn(),
      isTaskPending: vi.fn(() => false),
    } as any);
  });

  describe('rendering', () => {
    it('should render StatusTabs', () => {
      mockGetTasksByStatus.mockImplementation((status: string) => 
        mockTasks.filter(t => t.status === status)
      );
      
      render(
        <TasksProvider>
          <CompactView />
        </TasksProvider>
      );

      expect(screen.getByTestId('status-tabs')).toBeInTheDocument();
    });

    it('should render NewTaskCard', () => {
      mockGetTasksByStatus.mockImplementation((status: string) => 
        mockTasks.filter(t => t.status === status)
      );
      
      render(
        <TasksProvider>
          <CompactView />
        </TasksProvider>
      );

      expect(screen.getByText('New Task')).toBeInTheDocument();
    });
  });

  describe('filtering', () => {
    it('should show only tasks matching active tab', () => {
      mockGetTasksByStatus.mockImplementation((status: string) => 
        mockTasks.filter(t => t.status === status)
      );
      
      render(
        <TasksProvider>
          <CompactView />
        </TasksProvider>
      );

      // Initially should show todo tasks
      expect(mockGetTasksByStatus).toHaveBeenCalledWith('todo');
    });
  });

  describe('empty states', () => {
    it('should show empty state when no tasks match active tab', () => {
      mockGetTasksByStatus.mockReturnValue([]);
      
      render(
        <TasksProvider>
          <CompactView />
        </TasksProvider>
      );

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });
  });
});

