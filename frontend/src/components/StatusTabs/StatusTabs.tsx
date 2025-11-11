import { useState, useRef, useEffect } from 'react';
import { TaskStatus } from '../../types/task';
import './StatusTabs.css';

interface StatusTabsProps {
  activeTab: TaskStatus;
  onTabChange: (status: TaskStatus) => void;
  taskCounts: {
    todo: number;
    'in-progress': number;
    completed: number;
  };
}

const TABS: Array<{ status: TaskStatus; label: string }> = [
  { status: 'todo', label: 'To Do' },
  { status: 'in-progress', label: 'In Progress' },
  { status: 'completed', label: 'Done' },
];

/**
 * StatusTabs Component
 * 
 * Tab navigation component for Compact mode (To Do, In Progress, Done).
 * Features:
 * - Three tabs with task counts
 * - Active tab state and click handlers
 * - Keyboard navigation (Arrow keys to switch tabs, Enter/Space to activate)
 * - Touch-friendly size (44px height minimum)
 */
function StatusTabs({ activeTab, onTabChange, taskCounts }: StatusTabsProps) {
  const [focusedIndex, setFocusedIndex] = useState(
    TABS.findIndex((tab) => tab.status === activeTab)
  );
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Update focused index when activeTab changes externally
  useEffect(() => {
    const index = TABS.findIndex((tab) => tab.status === activeTab);
    if (index !== -1) {
      setFocusedIndex(index);
    }
  }, [activeTab]);

  const handleTabClick = (status: TaskStatus) => {
    onTabChange(status);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        const prevIndex = index > 0 ? index - 1 : TABS.length - 1;
        setFocusedIndex(prevIndex);
        tabRefs.current[prevIndex]?.focus();
        break;
      case 'ArrowRight':
        e.preventDefault();
        const nextIndex = index < TABS.length - 1 ? index + 1 : 0;
        setFocusedIndex(nextIndex);
        tabRefs.current[nextIndex]?.focus();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleTabClick(TABS[index].status);
        break;
      default:
        break;
    }
  };

  return (
    <div
      className="status-tabs"
      role="tablist"
      aria-label="Task status tabs"
      data-testid="status-tabs"
    >
      {TABS.map((tab, index) => (
        <button
          key={tab.status}
          ref={(el) => {
            tabRefs.current[index] = el;
          }}
          className={`status-tab ${activeTab === tab.status ? 'active' : ''}`}
          role="tab"
          aria-selected={activeTab === tab.status}
          aria-controls={`tabpanel-${tab.status}`}
          id={`tab-${tab.status}`}
          onClick={() => handleTabClick(tab.status)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          data-testid={`status-tab-${tab.status}`}
        >
          <span className="status-tab-label">{tab.label}</span>
          <span className="status-tab-count" aria-label={`${taskCounts[tab.status]} tasks`}>
            ({taskCounts[tab.status]})
          </span>
        </button>
      ))}
    </div>
  );
}

export default StatusTabs;

