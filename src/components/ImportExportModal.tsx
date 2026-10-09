import React, { useState, useRef } from 'react';
import { Download, Upload, FileText, CheckCircle2, AlertCircle, X, RotateCcw } from 'lucide-react';
import { Task } from '../types/task';
import { exportTasksToJSON, exportTasksToCSV, parseAndValidateTaskJSON } from '../utils/exportImport';

interface ImportExportModalProps {
  tasks: Task[];
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedTasks: Task[]) => void;
  onResetTasks: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  tasks,
  isOpen,
  onClose,
  onImportSuccess,
  onResetTasks,
}) => {
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccessMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setImportError('Please select a valid JSON file (.json)');
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const result = parseAndValidateTaskJSON(content);
      if (!result.success || !result.tasks) {
        setImportError(result.error || 'Failed to parse JSON file.');
      } else {
        onImportSuccess(result.tasks);
        setImportSuccessMsg(`Successfully imported ${result.tasks.length} tasks!`);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    };
    reader.onerror = () => {
      setImportError('Error reading uploaded file.');
    };
    reader.readAsText(file);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-export-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden p-6 transition-all"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h2 id="import-export-title" className="text-base font-semibold text-neutral-900 dark:text-white">
              Data Backup & Export
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Export your workspace or restore tasks from a backup
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Export Options */}
        <div className="mt-5 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Export Tasks ({tasks.length} total)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => exportTasksToJSON(tasks)}
              className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50 dark:bg-neutral-950/50 hover:bg-white dark:hover:bg-neutral-900 text-left transition-all group flex items-start gap-3 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Export as JSON
                </span>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Full backup including subtasks and tags
                </p>
              </div>
            </button>

            <button
              onClick={() => exportTasksToCSV(tasks)}
              className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50 dark:bg-neutral-950/50 hover:bg-white dark:hover:bg-neutral-900 text-left transition-all group flex items-start gap-3 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Export as CSV
                </span>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Spreadsheet compatible format
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Import from JSON Backup
          </h3>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-4 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-neutral-50 dark:bg-neutral-950/40 text-center transition-colors cursor-pointer flex flex-col items-center justify-center gap-1.5"
          >
            <Upload className="w-5 h-5 text-neutral-400" />
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
              Click to select JSON backup file
            </span>
            <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
              Validates schema and safely merges or replaces tasks
            </span>
          </button>

          {importError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{importError}</span>
            </div>
          )}

          {importSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{importSuccessMsg}</span>
            </div>
          )}
        </div>

        {/* Reset / Sample Data */}
        <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <button
            onClick={() => {
              onResetTasks();
              onClose();
            }}
            className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restore Sample Workspace
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
