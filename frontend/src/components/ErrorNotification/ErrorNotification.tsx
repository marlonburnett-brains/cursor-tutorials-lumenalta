import { useEffect } from 'react';
import './ErrorNotification.css';

export interface ErrorNotificationProps {
  /** Error message to display */
  message: string;
  /** Callback to retry the failed operation */
  onRetry?: () => void;
  /** Callback to dismiss the notification */
  onDismiss: () => void;
  /** Auto-dismiss timeout in milliseconds (default: 5000) */
  autoHideDuration?: number;
}

/**
 * ErrorNotification Component
 * 
 * Displays error messages in a toast-style notification with:
 * - Glass morphism styling
 * - Dismiss button (X icon)
 * - Optional retry button
 * - Auto-dismiss after timeout
 */
export default function ErrorNotification({
  message,
  onRetry,
  onDismiss,
  autoHideDuration = 5000,
}: ErrorNotificationProps) {
  // Auto-dismiss after timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, autoHideDuration);

    return () => clearTimeout(timer);
  }, [autoHideDuration, onDismiss]);

  return (
    <div className="error-notification glass" role="alert" aria-live="assertive">
      <div className="error-notification-content">
        <div className="error-icon">⚠️</div>
        <p className="error-message">{message}</p>
      </div>
      
      <div className="error-notification-actions">
        {onRetry && (
          <button
            className="error-retry-button"
            onClick={onRetry}
            aria-label="Retry operation"
          >
            Retry
          </button>
        )}
        <button
          className="error-dismiss-button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

