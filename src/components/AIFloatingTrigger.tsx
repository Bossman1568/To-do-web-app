import React from 'react';
import { Sparkles, MessageSquare } from 'lucide-react';

interface AIFloatingTriggerProps {
  isOpen: boolean;
  onToggle: () => void;
  pendingTasksCount: number;
}

export const AIFloatingTrigger: React.FC<AIFloatingTriggerProps> = ({
  isOpen,
  onToggle,
  pendingTasksCount,
}) => {
  if (isOpen) return null;

  return (
    <button
      onClick={onToggle}
      aria-label="Open AI Productivity Assistant"
      title="Open AI Productivity Assistant"
      className="fixed bottom-5 right-5 z-40 group flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xl border border-neutral-800 dark:border-neutral-200 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <div className="relative">
        <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        {pendingTasksCount > 0 && (
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-neutral-900 dark:ring-white" />
        )}
      </div>

      <div className="flex flex-col text-left">
        <span className="text-xs font-bold leading-none tracking-tight">AI Coach</span>
        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium mt-0.5">
          Ask or plan
        </span>
      </div>
    </button>
  );
};
