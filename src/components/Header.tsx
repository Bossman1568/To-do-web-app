import React from 'react';
import {
  Sun,
  Moon,
  CheckCircle2,
  ListTodo,
  Calendar,
  Timer,
  BarChart2,
  Maximize2,
  Download,
  Keyboard,
  Sparkles,
} from 'lucide-react';
import { Theme } from '../hooks/useTheme';
import { Task, MainTab } from '../types/task';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  tasks: Task[];
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  onOpenFocusMode: () => void;
  onOpenImportExport: () => void;
  onOpenShortcuts: () => void;
  onOpenAIChat?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  tasks,
  activeTab,
  onTabChange,
  onOpenFocusMode,
  onOpenImportExport,
  onOpenShortcuts,
  onOpenAIChat,
}) => {
  const completedCount = tasks.filter(t => t.completed).length;

  const tabs: { id: MainTab; label: string; icon: React.ReactNode }[] = [
    { id: 'tasks', label: 'Tasks', icon: <ListTodo className="w-3.5 h-3.5" /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: 'pomodoro', label: 'Pomodoro', icon: <Timer className="w-3.5 h-3.5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="border-b border-neutral-200/80 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-indigo-400 dark:text-indigo-600 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white leading-none">
              TaskFlow
            </h1>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium mt-0.5">
              Personal Task Manager
            </p>
          </div>
        </div>

        {/* Center Zone: Main Navigation Tabs */}
        <nav
          aria-label="App Navigation"
          className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl"
        >
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Zone: AI Coach, Focus Mode, Backup, Shortcuts, Theme */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* AI Coach Trigger */}
          {onOpenAIChat && (
            <button
              onClick={onOpenAIChat}
              title="Open AI Productivity Assistant (C)"
              aria-label="Open AI Assistant"
              className="px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden md:inline">AI Coach</span>
            </button>
          )}

          {/* Focus Mode Trigger */}
          <button
            onClick={onOpenFocusMode}
            title="Enter Distraction-free Focus Mode (F)"
            aria-label="Focus mode"
            className="p-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors hidden md:flex items-center gap-1 text-xs font-medium cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
            <span>Focus</span>
          </button>

          {/* Data Backup & Export / Import */}
          <button
            onClick={onOpenImportExport}
            title="Import or Export Tasks (JSON / CSV)"
            aria-label="Data backup and export"
            className="p-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Keyboard Shortcuts Trigger */}
          <button
            onClick={onOpenShortcuts}
            title="Keyboard shortcuts (?)"
            aria-label="Keyboard shortcuts"
            className="p-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors hidden sm:flex cursor-pointer"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className="p-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
            <span className="text-xs font-medium hidden lg:inline">
              {theme === 'light' ? 'Dark' : 'Light'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
