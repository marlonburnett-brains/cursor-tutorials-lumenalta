import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StatusTabs from './StatusTabs';

describe('StatusTabs', () => {
  const mockOnTabChange = vi.fn();
  const defaultTaskCounts = {
    todo: 5,
    'in-progress': 3,
    completed: 10,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('tab rendering', () => {
    it('should render all three tabs', () => {
      render(
        <StatusTabs
          activeTab="todo"
          onTabChange={mockOnTabChange}
          taskCounts={defaultTaskCounts}
        />
      );

      expect(screen.getByTestId('status-tab-todo')).toBeInTheDocument();
      expect(screen.getByTestId('status-tab-in-progress')).toBeInTheDocument();
      expect(screen.getByTestId('status-tab-completed')).toBeInTheDocument();
    });

    it('should display task counts for each tab', () => {
      render(
        <StatusTabs
          activeTab="todo"
          onTabChange={mockOnTabChange}
          taskCounts={defaultTaskCounts}
        />
      );

      expect(screen.getByText('(5)')).toBeInTheDocument();
      expect(screen.getByText('(3)')).toBeInTheDocument();
      expect(screen.getByText('(10)')).toBeInTheDocument();
    });

    it('should show correct labels', () => {
      render(
        <StatusTabs
          activeTab="todo"
          onTabChange={mockOnTabChange}
          taskCounts={defaultTaskCounts}
        />
      );

      expect(screen.getByText('To Do')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
    });
  });

  describe('active state', () => {
    it('should mark active tab correctly', () => {
      render(
        <StatusTabs
          activeTab="in-progress"
          onTabChange={mockOnTabChange}
          taskCounts={defaultTaskCounts}
        />
      );

      const activeTab = screen.getByTestId('status-tab-in-progress');
      expect(activeTab).toHaveClass('active');
      expect(activeTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should not mark inactive tabs as active', () => {
      render(
        <StatusTabs
          activeTab="todo"
          onTabChange={mockOnTabChange}
          taskCounts={defaultTaskCounts}
        />
      );

      const inProgressTab = screen.getByTestId('status-tab-in-progress');
      expect(inProgressTab).not.toHaveClass('active');
      expect(inProgressTab).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('filtering', () => {
    it('should call onTabChange when tab is clicked', async () => {
      const user = userEvent.setup();
      render(
        <StatusTabs
          activeTab="todo"
          onTabChange={mockOnTabChange}
          taskCounts={defaultTaskCounts}
        />
      );

      const inProgressTab = screen.getByTestId('status-tab-in-progress');
      await user.click(inProgressTab);

      expect(mockOnTabChange).toHaveBeenCalledWith('in-progress');
    });
  });

  describe('keyboard navigation', () => {
    it('should navigate to previous tab with ArrowLeft', async () => {
      const user = userEvent.setup();
      render(
        <StatusTabs
          activeTab="in-progress"
          onTabChange={mockOnTabChange}
          taskCounts={defaultTaskCounts}
        />
      );

      const inProgressTab = screen.getByTestId('status-tab-in-progress');
      inProgressTab.focus();

      await user.keyboard('{ArrowLeft}');

      const todoTab = screen.getByTestId('status-tab-todo');
      expect(todoTab).toHaveFocus();
    });

    it('should navigate to next tab with ArrowRight', async () => {
      const user = userEvent.setup();
      render(
        <StatusTabs
          activeTab="todo"
          onTabChange={mockOnTabChange}
          taskCounts={defaultTaskCounts}
        />
      );

      const todoTab = screen.getByTestId('status-tab-todo');
      todoTab.focus();

      await user.keyboard('{ArrowRight}');

      const inProgressTab = screen.getByTestId('status-tab-in-progress');
      expect(inProgressTab).toHaveFocus();
    });

    it('should wrap around when navigating past last tab', async () => {
      const user = userEvent.setup();
      render(
        <StatusTabs
          activeTab="completed"
          onTabChange={mockOnTabChange}
          taskCounts={defaultTaskCounts}
        />
      );

      const completedTab = screen.getByTestId('status-tab-completed');
      completedTab.focus();

      await user.keyboard('{ArrowRight}');

      const todoTab = screen.getByTestId('status-tab-todo');
      expect(todoTab).toHaveFocus();
    });

    it('should wrap around when navigating before first tab', async () => {
      const user = userEvent.setup();
      render(
        <StatusTabs
          activeTab="todo"
          onTabChange={mockOnTabChange}
          taskCounts={defaultTaskCounts}
        />
      );

      const todoTab = screen.getByTestId('status-tab-todo');
      todoTab.focus();

      await user.keyboard('{ArrowLeft}');

      const completedTab = screen.getByTestId('status-tab-completed');
      expect(completedTab).toHaveFocus();
    });

    it('should activate tab with Enter key', async () => {
      const user = userEvent.setup();
      render(
        <StatusTabs
          activeTab="todo"
          onTabChange={mockOnTabChange}
          taskCounts={defaultTaskCounts}
        />
      );

      const inProgressTab = screen.getByTestId('status-tab-in-progress');
      inProgressTab.focus();

      await user.keyboard('{Enter}');

      expect(mockOnTabChange).toHaveBeenCalledWith('in-progress');
    });

    it('should activate tab with Space key', async () => {
      const user = userEvent.setup();
      render(
        <StatusTabs
          activeTab="todo"
          onTabChange={mockOnTabChange}
          taskCounts={defaultTaskCounts}
        />
      );

      const completedTab = screen.getByTestId('status-tab-completed');
      completedTab.focus();

      await user.keyboard(' ');

      expect(mockOnTabChange).toHaveBeenCalledWith('completed');
    });
  });

  describe('ARIA attributes', () => {
    it('should have correct ARIA roles', () => {
      render(
        <StatusTabs
          activeTab="todo"
          onTabChange={mockOnTabChange}
          taskCounts={defaultTaskCounts}
        />
      );

      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeInTheDocument();

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(3);
    });

    it('should set aria-selected correctly', () => {
      render(
        <StatusTabs
          activeTab="in-progress"
          onTabChange={mockOnTabChange}
          taskCounts={defaultTaskCounts}
        />
      );

      const activeTab = screen.getByTestId('status-tab-in-progress');
      expect(activeTab).toHaveAttribute('aria-selected', 'true');

      const inactiveTabs = [
        screen.getByTestId('status-tab-todo'),
        screen.getByTestId('status-tab-completed'),
      ];
      inactiveTabs.forEach((tab) => {
        expect(tab).toHaveAttribute('aria-selected', 'false');
      });
    });
  });
});

