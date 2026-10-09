import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown, Sun, Calendar, AlertOctagon, Star, CheckCircle, ListTodo } from 'lucide-react';
import { TaskView, Priority, TaskSort, TaskCategory } from '../types/task';

interface TaskFiltersProps {
  currentView: TaskView;
  onViewChange: (view: TaskView) => void;
  priorityFilter: Priority | 'all';
  onPriorityFilterChange: (priority: Priority | 'all') => void;
  categoryFilter: TaskCategory | 'all';
  onCategoryFilterChange: (category: TaskCategory | 'all') => void;
  sort: TaskSort;
  onSortChange: (sort: TaskSort) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalMatching: number;
}

const CATEGORIES: (TaskCategory | 'all')[] = ['all', 'Work', 'Personal', 'Study', 'Health', 'Finance', 'General'];

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  currentView,
  onViewChange,
  priorityFilter,
  onPriorityFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  sort,
  onSortChange,
  searchQuery,
  onSearchChange,
  totalMatching,
}) => {
  const views: { id: TaskView; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Tasks', icon: <ListTodo className="w-3.5 h-3.5" /> },
    { id: 'my-day', label: 'My Day', icon: <Sun className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'upcoming', label: 'Upcoming', icon: <Calendar className="w-3.5 h-3.5 text-indigo-500" /> },
    { id: 'overdue', label: 'Overdue', icon: <AlertOctagon className="w-3.5 h-3.5 text-rose-500" /> },
    { id: 'starred', label: 'Starred', icon: <Star className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'completed', label: 'Completed', icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> },
  ];

  return (
    <div className="space-y-3.5 mb-5">
      {/* 1. Quick Views Bar (My Day, Upcoming, Overdue, Starred, Completed, All Tasks) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {views.map(v => {
          const isActive = currentView === v.id;
          return (
            <button
              key={v.id}
              onClick={() => onViewChange(v.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                  : 'bg-white dark:bg-neutral-900/70 border border-neutral-200/80 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              {v.icon}
              <span>{v.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Search Bar + Category Selector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search tasks, descriptions, or tags..."
            className="w-full pl-9 pr-9 py-2 rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400 hidden md:inline">
            Category:
          </span>
          <select
            value={categoryFilter}
            onChange={e => onCategoryFilterChange(e.target.value as TaskCategory | 'all')}
            className="px-3 py-2 rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 text-xs font-medium text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat} className="dark:bg-neutral-900">
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Priority Buttons & Sort dropdown & Result count */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 border-t border-neutral-100 dark:border-neutral-800/60">
        {/* Priority Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1 font-medium text-[11px] uppercase tracking-wider">
            <SlidersHorizontal className="w-3 h-3" /> Priority:
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPriorityFilterChange('all')}
              className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                priorityFilter === 'all'
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => onPriorityFilterChange('urgent')}
              className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                priorityFilter === 'urgent'
                  ? 'bg-rose-600 text-white'
                  : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
              }`}
            >
              Urgent
            </button>
            <button
              onClick={() => onPriorityFilterChange('high')}
              className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                priorityFilter === 'high'
                  ? 'bg-orange-500 text-white'
                  : 'text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30'
              }`}
            >
              High
            </button>
            <button
              onClick={() => onPriorityFilterChange('medium')}
              className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                priorityFilter === 'medium'
                  ? 'bg-amber-500 text-white'
                  : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
              }`}
            >
              Medium
            </button>
            <button
              onClick={() => onPriorityFilterChange('low')}
              className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                priorityFilter === 'low'
                  ? 'bg-emerald-500 text-white'
                  : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
              }`}
            >
              Low
            </button>
          </div>
        </div>

        {/* Sort selector & Count */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
            <ArrowUpDown className="w-3 h-3" />
            <span className="text-[11px] uppercase tracking-wider font-medium">Sort:</span>
            <select
              value={sort}
              onChange={e => onSortChange(e.target.value as TaskSort)}
              className="bg-transparent text-xs font-medium text-neutral-800 dark:text-neutral-200 border-none focus:outline-none cursor-pointer py-0.5"
            >
              <option value="newest" className="dark:bg-neutral-900">Newest Created</option>
              <option value="oldest" className="dark:bg-neutral-900">Oldest Created</option>
              <option value="priority" className="dark:bg-neutral-900">Priority (Urgent → Low)</option>
              <option value="dueDate" className="dark:bg-neutral-900">Due Date</option>
              <option value="alphabetical" className="dark:bg-neutral-900">Alphabetical (A → Z)</option>
            </select>
          </div>

          <span className="text-neutral-400 dark:text-neutral-600 font-mono tabular-nums text-xs">
            {totalMatching} {totalMatching === 1 ? 'task' : 'tasks'}
          </span>
        </div>
      </div>
    </div>
  );
};
