import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StatusChangeButtons from './StatusChangeButtons';

describe('StatusChangeButtons', () => {
  const mockOnStatusChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering logic for each status', () => {
    it('should show Start button for todo status', () => {
      render(
        <StatusChangeButtons
          currentStatus="todo"
          onStatusChange={mockOnStatusChange}
        />
      );

      const startButton = screen.getByTestId('status-change-in-progress');
      expect(startButton).toBeInTheDocument();
      expect(startButton).toHaveTextContent('Start');
      expect(startButton).toHaveAttribute('aria-label', 'Start working on this task');
    });

    it('should show Complete and Revert buttons for in-progress status', () => {
      render(
        <StatusChangeButtons
          currentStatus="in-progress"
          onStatusChange={mockOnStatusChange}
        />
      );

      const completeButton = screen.getByTestId('status-change-completed');
      const revertButton = screen.getByTestId('status-change-todo');

      expect(completeButton).toBeInTheDocument();
      expect(completeButton).toHaveTextContent('Complete');
      expect(completeButton).toHaveAttribute('aria-label', 'Mark this task as completed');

      expect(revertButton).toBeInTheDocument();
      expect(revertButton).toHaveTextContent('Revert');
      expect(revertButton).toHaveAttribute('aria-label', 'Revert this task back to To Do');
    });

    it('should show Reopen button for completed status', () => {
      render(
        <StatusChangeButtons
          currentStatus="completed"
          onStatusChange={mockOnStatusChange}
        />
      );

      const reopenButton = screen.getByTestId('status-change-in-progress');
      expect(reopenButton).toBeInTheDocument();
      expect(reopenButton).toHaveTextContent('Reopen');
      expect(reopenButton).toHaveAttribute('aria-label', 'Reopen this task');
    });
  });

  describe('click handling', () => {
    it('should call onStatusChange with correct status when Start is clicked', async () => {
      const user = userEvent.setup();
      render(
        <StatusChangeButtons
          currentStatus="todo"
          onStatusChange={mockOnStatusChange}
        />
      );

      const startButton = screen.getByTestId('status-change-in-progress');
      await user.click(startButton);

      expect(mockOnStatusChange).toHaveBeenCalledWith('in-progress');
    });

    it('should call onStatusChange with correct status when Complete is clicked', async () => {
      const user = userEvent.setup();
      render(
        <StatusChangeButtons
          currentStatus="in-progress"
          onStatusChange={mockOnStatusChange}
        />
      );

      const completeButton = screen.getByTestId('status-change-completed');
      await user.click(completeButton);

      expect(mockOnStatusChange).toHaveBeenCalledWith('completed');
    });

    it('should call onStatusChange with correct status when Revert is clicked', async () => {
      const user = userEvent.setup();
      render(
        <StatusChangeButtons
          currentStatus="in-progress"
          onStatusChange={mockOnStatusChange}
        />
      );

      const revertButton = screen.getByTestId('status-change-todo');
      await user.click(revertButton);

      expect(mockOnStatusChange).toHaveBeenCalledWith('todo');
    });

    it('should call onStatusChange with correct status when Reopen is clicked', async () => {
      const user = userEvent.setup();
      render(
        <StatusChangeButtons
          currentStatus="completed"
          onStatusChange={mockOnStatusChange}
        />
      );

      const reopenButton = screen.getByTestId('status-change-in-progress');
      await user.click(reopenButton);

      expect(mockOnStatusChange).toHaveBeenCalledWith('in-progress');
    });
  });
});

