import React from 'react';
import { CheckCircle2, SearchX, Plus, Sparkles, Star, Calendar, Sun, AlertOctagon } from 'lucide-react';
import { TaskFilter, TaskView } from '../types/task';

interface EmptyStateProps {
  filter?: TaskFilter;
  view?: TaskView;
  searchQuery: string;
  totalTasks: number;
  onClearSearch: () => void;
  onLoadSamples: () => void;
  onFocusInput: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  filter,
  view,
  searchQuery,
  totalTasks,
  onClearSearch,
  onLoadSamples,
  onFocusInput,
}) => {
  if (searchQuery) {
    return (
      <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/40">
        <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
          <SearchX className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          No tasks found matching "{searchQuery}"
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
          Try checking for spelling errors, clearing your search term, or searching tags with #.
        </p>
        <button
          onClick={onClearSearch}
          className="mt-4 px-3.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          Clear Search
        </button>
      </div>
    );
  }

  if (totalTasks === 0) {
    return (
      <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/40">
        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
          No tasks in your workspace
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
          Start building your momentum by adding your first to-do item or restore sample tasks.
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            onClick={onFocusInput}
            className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add First Task
          </button>
          <button
            onClick={onLoadSamples}
            className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Load Sample Tasks
          </button>
        </div>
      </div>
    );
  }

  // View specific empty states
  if (view === 'starred') {
    return (
      <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/40">
        <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
          <Star className="w-5 h-5 fill-current" />
        </div>
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          No starred tasks
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Click the star icon on any task to bookmark it here for quick access.
        </p>
      </div>
    );
  }

  if (view === 'my-day') {
    return (
      <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/40">
        <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <Sun className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          No tasks scheduled for today
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Add a task with today's date or pin high-priority goals to your day.
        </p>
      </div>
    );
  }

  if (view === 'upcoming') {
    return (
      <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/40">
        <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <Calendar className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          No upcoming tasks scheduled
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Set future due dates on tasks to plan your week ahead.
        </p>
      </div>
    );
  }

  if (view === 'overdue') {
    return (
      <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/40">
        <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          No overdue tasks!
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Everything is right on track. Great job keeping on top of your deadlines!
        </p>
      </div>
    );
  }

  if (view === 'completed' || filter === 'completed') {
    return (
      <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/40">
        <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          No completed tasks yet
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Check off pending items to see them saved in your archive.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/40">
      <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
        <CheckCircle2 className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
        You're all caught up!
      </h3>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
        There are no matching active tasks. Add a new goal to get started!
      </p>
    </div>
  );
};
