import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Task } from '../types/task';

interface ConfirmDeleteModalProps {
  task: Task | null;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  task,
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !task) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden p-6 transition-all"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3
              id="confirm-delete-title"
              className="text-base font-semibold text-neutral-900 dark:text-white"
            >
              Delete Task
            </h3>
            <p className="mt-1.5 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                "{task.title}"
              </span>
              ? You will have an undo option for a few seconds.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
};
