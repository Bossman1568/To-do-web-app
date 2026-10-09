import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'N', desc: 'Focus task creation input' },
    { key: '/', desc: 'Quick search tasks' },
    { key: 'C', desc: 'Open AI Productivity Coach' },
    { key: '1', desc: 'Go to Tasks tab' },
    { key: '2', desc: 'Go to Calendar tab' },
    { key: '3', desc: 'Go to Pomodoro focus timer' },
    { key: '4', desc: 'Go to Analytics & Stats' },
    { key: 'F', desc: 'Toggle Distraction-free Focus Mode' },
    { key: 'D', desc: 'Toggle Dark / Light mode' },
    { key: '?', desc: 'Show this shortcuts guide' },
    { key: 'Esc', desc: 'Close any active modal or panel' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden p-6 transition-all"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Keyboard className="w-4 h-4" />
            </div>
            <h2 id="shortcuts-title" className="text-base font-semibold text-neutral-900 dark:text-white">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 divide-y divide-neutral-100 dark:divide-neutral-800">
          {shortcuts.map(s => (
            <div key={s.key} className="py-2.5 flex items-center justify-between text-xs">
              <span className="text-neutral-600 dark:text-neutral-400">{s.desc}</span>
              <kbd className="px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-mono text-[11px] text-neutral-800 dark:text-neutral-200 shadow-xs font-semibold">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
