import { TaskStatus } from '../../types/task';
import './StatusChangeButtons.css';

interface StatusChangeButtonsProps {
  currentStatus: TaskStatus;
  onStatusChange: (newStatus: TaskStatus) => void;
}

/**
 * StatusChangeButtons Component
 * 
 * Inline status change buttons for task cards in Compact mode.
 * Features:
 * - Conditional buttons based on task status (Start, Complete, Revert, Reopen)
 * - Touch-friendly (32x32px minimum)
 * - Visually distinct and positioned consistently
 */
function StatusChangeButtons({ currentStatus, onStatusChange }: StatusChangeButtonsProps) {
  const handleStatusChange = (newStatus: TaskStatus) => {
    onStatusChange(newStatus);
  };

  // Determine which buttons to show based on current status
  const getAvailableActions = () => {
    switch (currentStatus) {
      case 'todo':
        return [
          {
            label: 'Start',
            status: 'in-progress' as TaskStatus,
            ariaLabel: 'Start working on this task',
            emoji: '▶️',
          },
        ];
      case 'in-progress':
        return [
          {
            label: 'Complete',
            status: 'completed' as TaskStatus,
            ariaLabel: 'Mark this task as completed',
            emoji: '✅',
          },
          {
            label: 'Revert',
            status: 'todo' as TaskStatus,
            ariaLabel: 'Revert this task back to To Do',
            emoji: '↩️',
          },
        ];
      case 'completed':
        return [
          {
            label: 'Reopen',
            status: 'in-progress' as TaskStatus,
            ariaLabel: 'Reopen this task',
            emoji: '🔄',
          },
        ];
      default:
        return [];
    }
  };

  const actions = getAvailableActions();

  if (actions.length === 0) {
    return null;
  }

  return (
    <div 
      className="status-change-buttons" 
      data-testid="status-change-buttons"
      style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        gap: '0.5rem',
        alignItems: 'center'
      }}
    >
      {actions.map((action) => (
        <button
          key={action.status}
          className="status-change-button"
          onClick={() => handleStatusChange(action.status)}
          aria-label={action.ariaLabel}
          title={action.label}
          type="button"
          data-testid={`status-change-${action.status}`}
          style={{
            display: 'flex',
            flexDirection: 'row',
            flex: '0 0 auto'
          }}
        >
          <span className="status-change-emoji" aria-hidden="true">
            {action.emoji}
          </span>
          <span className="status-change-label">{action.label}</span>
        </button>
      ))}
    </div>
  );
}

export default StatusChangeButtons;

