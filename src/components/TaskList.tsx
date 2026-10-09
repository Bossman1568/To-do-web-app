import React from 'react';
import { Task, TaskFilter } from '../types/task';
import { TaskItem } from './TaskItem';
import { EmptyState } from './EmptyState';
import { CheckCheck, Trash2 } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  allTasks: Task[];
  filter: TaskFilter;
  searchQuery: string;
  onToggleComplete: (id: string) => void;
  onRequestDelete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onToggleStar: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDuplicate: (task: Task) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onClearCompleted: () => void;
  onMarkAllCompleted: () => void;
  onClearSearch: () => void;
  onLoadSamples: () => void;
  onFocusInput: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  allTasks,
  filter,
  searchQuery,
  onToggleComplete,
  onRequestDelete,
  onEdit,
  onToggleStar,
  onTogglePin,
  onDuplicate,
  onToggleSubtask,
  onAddSubtask,
  onClearCompleted,
  onMarkAllCompleted,
  onClearSearch,
  onLoadSamples,
  onFocusInput,
}) => {
  const hasCompletedTasks = allTasks.some(t => t.completed);
  const hasActiveTasks = allTasks.some(t => !t.completed);

  if (tasks.length === 0) {
    return (
      <EmptyState
        filter={filter}
        searchQuery={searchQuery}
        totalTasks={allTasks.length}
        onClearSearch={onClearSearch}
        onLoadSamples={onLoadSamples}
        onFocusInput={onFocusInput}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Batch Actions Bar (when tasks exist) */}
      <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 px-1">
        <span>
          Showing {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </span>

        <div className="flex items-center gap-3">
          {hasActiveTasks && (
            <button
              onClick={onMarkAllCompleted}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 font-medium cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all done
            </button>
          )}

          {hasCompletedTasks && (
            <button
              onClick={onClearCompleted}
              className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1 font-medium cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear completed
            </button>
          )}
        </div>
      </div>

      {/* Task Items List */}
      <div className="space-y-2.5">
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onToggleComplete={onToggleComplete}
            onRequestDelete={onRequestDelete}
            onEdit={onEdit}
            onToggleStar={onToggleStar}
            onTogglePin={onTogglePin}
            onDuplicate={onDuplicate}
            onToggleSubtask={onToggleSubtask}
            onAddSubtask={onAddSubtask}
          />
        ))}
      </div>
    </div>
  );
};
