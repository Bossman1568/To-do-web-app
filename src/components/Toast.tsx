import React from 'react';
import { RotateCcw, X } from 'lucide-react';

interface ToastProps {
  message: string;
  onUndo?: () => void;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onUndo, onClose }) => {
  return (
    <div
      role="alert"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-3 rounded-2xl shadow-xl border border-neutral-800 dark:border-neutral-200 text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <span>{message}</span>
      {onUndo && (
        <button
          onClick={onUndo}
          className="ml-2 font-semibold text-indigo-400 dark:text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Undo
        </button>
      )}
      <button
        onClick={onClose}
        className="p-1 rounded-md text-neutral-400 hover:text-white dark:hover:text-neutral-900 transition-colors ml-1"
        aria-label="Close notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
