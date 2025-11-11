import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ViewModeToggle from './ViewModeToggle';

describe('ViewModeToggle', () => {
  const mockOnToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render Kanban icon when in kanban mode', () => {
      render(<ViewModeToggle currentMode="kanban" onToggle={mockOnToggle} />);
      
      const button = screen.getByTestId('view-mode-toggle');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('📊');
      expect(button).toHaveClass('active');
    });

    it('should render Compact icon when in compact mode', () => {
      render(<ViewModeToggle currentMode="compact" onToggle={mockOnToggle} />);
      
      const button = screen.getByTestId('view-mode-toggle');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('📋');
      expect(button).not.toHaveClass('active');
    });
  });

  describe('click handling', () => {
    it('should call onToggle when clicked', async () => {
      const user = userEvent.setup();
      render(<ViewModeToggle currentMode="kanban" onToggle={mockOnToggle} />);
      
      const button = screen.getByTestId('view-mode-toggle');
      await user.click(button);
      
      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it('should not call onToggle when disabled/locked', async () => {
      const user = userEvent.setup();
      render(<ViewModeToggle currentMode="kanban" onToggle={mockOnToggle} isLocked={true} />);
      
      const button = screen.getByTestId('view-mode-toggle');
      expect(button).toBeDisabled();
      
      await user.click(button);
      
      expect(mockOnToggle).not.toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('should show locked state when isLocked is true', () => {
      render(<ViewModeToggle currentMode="kanban" onToggle={mockOnToggle} isLocked={true} />);
      
      const button = screen.getByTestId('view-mode-toggle');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('locked');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('should not be disabled when isLocked is false', () => {
      render(<ViewModeToggle currentMode="kanban" onToggle={mockOnToggle} isLocked={false} />);
      
      const button = screen.getByTestId('view-mode-toggle');
      expect(button).not.toBeDisabled();
      expect(button).not.toHaveClass('locked');
    });
  });

  describe('ARIA attributes', () => {
    it('should have appropriate aria-label when not locked', () => {
      render(<ViewModeToggle currentMode="kanban" onToggle={mockOnToggle} />);
      
      const button = screen.getByTestId('view-mode-toggle');
      expect(button).toHaveAttribute('aria-label', 'Switch to Compact mode');
    });

    it('should have appropriate aria-label when locked', () => {
      render(<ViewModeToggle currentMode="kanban" onToggle={mockOnToggle} isLocked={true} />);
      
      const button = screen.getByTestId('view-mode-toggle');
      expect(button).toHaveAttribute('aria-label', 'View mode locked on mobile. Use desktop to change view mode.');
    });

    it('should have aria-disabled attribute when locked', () => {
      render(<ViewModeToggle currentMode="kanban" onToggle={mockOnToggle} isLocked={true} />);
      
      const button = screen.getByTestId('view-mode-toggle');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });
});

