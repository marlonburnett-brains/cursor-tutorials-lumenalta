import { useState } from 'react';
import { TaskStatus } from '../../types/task';
import { useTasksContext } from '../../contexts/TasksContext';
import StatusTabs from '../StatusTabs/StatusTabs';
import TaskCard from '../TaskCard/TaskCard';
import NewTaskCard from '../NewTaskCard/NewTaskCard';
import EmptyState from '../EmptyState/EmptyState';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';
import './CompactView.css';

/**
 * CompactView Component
 * 
 * Single-column layout component for Compact mode.
 * Features:
 * - StatusTabs for filtering tasks by status
 * - Filtered task list showing only tasks matching active tab
 * - NewTaskCard with defaultStatus prop matching active tab
 * - Empty states for each tab
 */
function CompactView() {
  const { tasks, getTasksByStatus, updateTaskStatus, deleteTask } = useTasksContext();
  const [activeTab, setActiveTab] = useState<TaskStatus>('todo');
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // Calculate task counts for each status
  const taskCounts = {
    todo: getTasksByStatus('todo').length,
    'in-progress': getTasksByStatus('in-progress').length,
    completed: getTasksByStatus('completed').length,
  };

  // Get filtered tasks for active tab
  const filteredTasks = getTasksByStatus(activeTab);

  // Sort tasks by createdAt descending (newest first)
  const sortedTasks = [...filteredTasks].sort((a, b) => b.createdAt - a.createdAt);

  // Determine defaultStatus for NewTaskCard
  // Exception: use 'todo' for 'done' tab
  const defaultStatus: TaskStatus = activeTab === 'completed' ? 'todo' : activeTab;

  const handleTabChange = (status: TaskStatus) => {
    setActiveTab(status);
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleDeleteClick = (taskId: string) => {
    setTaskToDelete(taskId);
  };

  const handleDeleteConfirm = async () => {
    if (taskToDelete) {
      try {
        await deleteTask(taskToDelete);
        setTaskToDelete(null);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setTaskToDelete(null);
  };

  return (
    <div className="compact-view" data-testid="compact-view">
      <StatusTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        taskCounts={taskCounts}
      />

      <div className="compact-view-content">
        <NewTaskCard defaultStatus={defaultStatus} />

        {sortedTasks.length === 0 ? (
          <EmptyState status={activeTab} viewMode="compact" />
        ) : (
          <div className="compact-task-list">
            {sortedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={handleDeleteClick}
                viewMode="compact"
                onStatusChange={(newStatus) => handleStatusChange(task.id, newStatus)}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={taskToDelete !== null}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}

export default CompactView;

