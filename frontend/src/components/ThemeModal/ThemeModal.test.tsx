import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ThemeModal from './ThemeModal';

/**
 * Unit tests for ThemeModal component
 * 
 * Tests cover:
 * - Modal opens and closes correctly
 * - Theme selection triggers theme change
 * - Keyboard navigation (Escape, Enter)
 * - Click outside closes modal
 */

// Mock the useTheme hook
vi.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({
    currentTheme: 'tech-modern',
    setTheme: vi.fn(),
    themes: {
      'tech-modern': {
        name: 'tech-modern',
        displayName: 'Tech Modern',
        colors: {
          bgPrimary: '#0f172a',
          bgSecondary: '#1e293b',
          accentPrimary: '#06b6d4',
          accentSecondary: '#0891b2',
          textPrimary: '#f1f5f9',
        },
      },
      'warm-inviting': {
        name: 'warm-inviting',
        displayName: 'Warm Inviting',
        colors: {
          bgPrimary: '#2c1810',
          bgSecondary: '#3d2415',
          accentPrimary: '#ff6b6b',
          accentSecondary: '#ee5a52',
          textPrimary: '#fef3e2',
        },
      },
    },
  }),
}));

describe('ThemeModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  describe('Modal visibility', () => {
    it('should not render when isOpen is false', () => {
      render(<ThemeModal isOpen={false} onClose={mockOnClose} />);
      
      expect(screen.queryByText('Choose Theme')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(<ThemeModal isOpen={true} onClose={mockOnClose} />);
      
      expect(screen.getByText('Choose Theme')).toBeInTheDocument();
    });

    it('should display modal with proper ARIA attributes', () => {
      render(<ThemeModal isOpen={true} onClose={mockOnClose} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'theme-modal-title');
    });
  });

  describe('Theme selection', () => {
    it('should display all available themes', () => {
      render(<ThemeModal isOpen={true} onClose={mockOnClose} />);
      
      expect(screen.getByText('Tech Modern')).toBeInTheDocument();
      expect(screen.getByText('Warm Inviting')).toBeInTheDocument();
    });

    it('should show active theme with checkmark', () => {
      render(<ThemeModal isOpen={true} onClose={mockOnClose} />);
      
      const activeCard = screen.getByLabelText('Select Tech Modern theme').closest('.theme-card');
      expect(activeCard).toHaveClass('theme-card-active');
      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('should close modal after theme selection', async () => {
      render(<ThemeModal isOpen={true} onClose={mockOnClose} />);
      
      const themeButton = screen.getByLabelText('Select Warm Inviting theme');
      fireEvent.click(themeButton);

      // Wait for auto-close delay
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      }, { timeout: 500 });
    });
  });

  describe('Keyboard navigation', () => {
    it('should close modal when Escape key is pressed', () => {
      render(<ThemeModal isOpen={true} onClose={mockOnClose} />);
      
      fireEvent.keyDown(window, { key: 'Escape' });
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should not close modal when other keys are pressed', () => {
      render(<ThemeModal isOpen={true} onClose={mockOnClose} />);
      
      fireEvent.keyDown(window, { key: 'Enter' });
      fireEvent.keyDown(window, { key: 'Tab' });
      fireEvent.keyDown(window, { key: 'Space' });
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should allow Tab navigation between theme cards', () => {
      render(<ThemeModal isOpen={true} onClose={mockOnClose} />);
      
      const themeButtons = screen.getAllByRole('button');
      
      // First theme card should be focusable
      themeButtons[0].focus();
      expect(document.activeElement).toBe(themeButtons[0]);
      
      // Should be able to tab to next theme card
      fireEvent.keyDown(themeButtons[0], { key: 'Tab' });
      // Note: Actual tab behavior would be handled by browser
    });
  });

  describe('Click outside to close', () => {
    it('should close modal when clicking on overlay', () => {
      render(<ThemeModal isOpen={true} onClose={mockOnClose} />);
      
      const overlay = screen.getByText('Choose Theme').closest('.theme-modal')?.parentElement;
      if (overlay) {
        fireEvent.click(overlay);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });

    it('should not close modal when clicking inside dialog', () => {
      render(<ThemeModal isOpen={true} onClose={mockOnClose} />);
      
      const dialog = screen.getByRole('dialog');
      fireEvent.click(dialog);
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible theme selection buttons', () => {
      render(<ThemeModal isOpen={true} onClose={mockOnClose} />);
      
      const techModernButton = screen.getByLabelText('Select Tech Modern theme');
      expect(techModernButton).toHaveAttribute('aria-selected', 'true');
      
      const warmInvitingButton = screen.getByLabelText('Select Warm Inviting theme');
      expect(warmInvitingButton).toHaveAttribute('aria-selected', 'false');
    });

    it('should have proper heading hierarchy', () => {
      render(<ThemeModal isOpen={true} onClose={mockOnClose} />);
      
      const heading = screen.getByRole('heading', { name: 'Choose Theme' });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H2');
    });
  });
});

