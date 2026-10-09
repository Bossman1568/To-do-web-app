import React, { useState } from 'react';
import {
  Check,
  Trash2,
  Edit3,
  Calendar,
  Tag,
  AlertTriangle,
  Star,
  Pin,
  Copy,
  Plus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Task, Priority } from '../types/task';
import { formatCreationDate, formatDueDate } from '../utils/date';
import confetti from 'canvas-confetti';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onRequestDelete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onToggleStar: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDuplicate: (task: Task) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onRequestDelete,
  onEdit,
  onToggleStar,
  onTogglePin,
  onDuplicate,
  onToggleSubtask,
  onAddSubtask,
}) => {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [quickSubtaskTitle, setQuickSubtaskTitle] = useState('');

  const { text: dueDateText, isOverdue, isToday } = formatDueDate(task.dueDate, task.dueTime);
  const createdDateText = formatCreationDate(task.createdAt);

  const subtasks = task.subtasks || [];
  const completedSubtasksCount = subtasks.filter(s => s.completed).length;

  const handleToggle = () => {
    if (!task.completed) {
      try {
        confetti({
          particleCount: task.priority === 'urgent' ? 60 : task.priority === 'high' ? 40 : 25,
          spread: 60,
          origin: { y: 0.75 },
          colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
          disableForReducedMotion: true,
        });
      } catch {
        // Safe fallback
      }
    }
    onToggleComplete(task.id);
  };

  const getPriorityStyle = (priority: Priority) => {
    switch (priority) {
      case 'urgent':
        return {
          textColor: 'text-rose-600 dark:text-rose-400 font-bold',
          dotColor: 'bg-rose-600 animate-pulse',
          label: 'Urgent',
        };
      case 'high':
        return {
          textColor: 'text-orange-600 dark:text-orange-400 font-semibold',
          dotColor: 'bg-orange-500',
          label: 'High Priority',
        };
      case 'medium':
        return {
          textColor: 'text-amber-600 dark:text-amber-400 font-medium',
          dotColor: 'bg-amber-500',
          label: 'Medium',
        };
      case 'low':
        return {
          textColor: 'text-emerald-600 dark:text-emerald-400 font-medium',
          dotColor: 'bg-emerald-500',
          label: 'Low',
        };
    }
  };

  const priorityMeta = getPriorityStyle(task.priority);

  const handleAddQuickSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSubtaskTitle.trim()) {
      onAddSubtask(task.id, quickSubtaskTitle.trim());
      setQuickSubtaskTitle('');
    }
  };

  return (
    <div
      className={`group relative rounded-2xl border p-4 sm:p-5 transition-all duration-200 ${
        task.completed
          ? 'bg-neutral-50/70 dark:bg-neutral-900/40 border-neutral-200/60 dark:border-neutral-800/60 opacity-80'
          : task.pinned
          ? 'bg-white dark:bg-neutral-900/90 border-indigo-200 dark:border-indigo-900/60 shadow-xs'
          : 'bg-white dark:bg-neutral-900/80 border-neutral-200/90 dark:border-neutral-800 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Completion Checkbox */}
        <button
          type="button"
          onClick={handleToggle}
          aria-label={task.completed ? 'Mark task as incomplete' : 'Mark task as completed'}
          className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all duration-150 shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
            task.completed
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
              : 'border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 hover:border-indigo-500 dark:hover:border-indigo-400'
          }`}
        >
          {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Content Body */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              {task.pinned && (
                <span title="Pinned to top" className="text-indigo-500 inline-flex items-center">
                  <Pin className="w-3.5 h-3.5 fill-current" />
                </span>
              )}
              <h3
                className={`text-sm sm:text-base font-semibold leading-snug break-words transition-all ${
                  task.completed
                    ? 'line-through text-neutral-400 dark:text-neutral-500'
                    : 'text-neutral-900 dark:text-neutral-100'
                }`}
              >
                {task.title}
              </h3>
            </div>

            {/* Creation Date */}
            <span className="text-[11px] font-mono tabular-nums text-neutral-400 dark:text-neutral-500 shrink-0">
              {createdDateText}
            </span>
          </div>

          {/* Description */}
          {task.description && (
            <p
              className={`text-xs mt-1 leading-relaxed ${
                task.completed
                  ? 'text-neutral-400/80 dark:text-neutral-600 line-through'
                  : 'text-neutral-600 dark:text-neutral-300'
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Subtasks Progress Bar & Toggle */}
          {subtasks.length > 0 && (
            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => setShowSubtasks(!showSubtasks)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                {showSubtasks ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
                <span>
                  Checklist ({completedSubtasksCount}/{subtasks.length})
                </span>
                <span className="font-mono text-[11px] text-neutral-400">
                  {Math.round((completedSubtasksCount / subtasks.length) * 100)}%
                </span>
              </button>

              {/* Expanded Subtasks List */}
              {showSubtasks && (
                <div className="mt-2 pl-2 border-l-2 border-neutral-200 dark:border-neutral-800 space-y-1.5">
                  {subtasks.map(s => (
                    <div
                      key={s.id}
                      onClick={() => onToggleSubtask(task.id, s.id)}
                      className="flex items-center gap-2 py-1 text-xs cursor-pointer group/sub"
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                          s.completed
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900'
                        }`}
                      >
                        {s.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span
                        className={`break-words ${
                          s.completed
                            ? 'line-through text-neutral-400 dark:text-neutral-500'
                            : 'text-neutral-700 dark:text-neutral-300 group-hover/sub:text-neutral-900 dark:group-hover/sub:text-white'
                        }`}
                      >
                        {s.title}
                      </span>
                    </div>
                  ))}

                  {/* Quick Add Subtask Input */}
                  <form onSubmit={handleAddQuickSubtask} className="flex items-center gap-1 pt-1">
                    <input
                      type="text"
                      value={quickSubtaskTitle}
                      onChange={e => setQuickSubtaskTitle(e.target.value)}
                      placeholder="Add subtask..."
                      className="text-xs px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={!quickSubtaskTitle.trim()}
                      className="text-xs px-2 py-1 bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-700 disabled:opacity-40"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* Clean Metadata Line (Zero-Pill discipline) */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-3 text-xs text-neutral-500 dark:text-neutral-400">
            {/* Priority Indicator */}
            <span className={`inline-flex items-center gap-1.5 ${priorityMeta.textColor}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priorityMeta.dotColor}`} />
              {priorityMeta.label}
            </span>

            <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>

            {/* Category */}
            <span className="inline-flex items-center gap-1">
              <Tag className="w-3 h-3 text-neutral-400" />
              <span>{task.category}</span>
            </span>

            {/* Custom Tags */}
            {task.tags && task.tags.length > 0 && (
              <>
                <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
                <span className="inline-flex items-center gap-1.5">
                  {task.tags.map(t => (
                    <span key={t} className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      #{t}
                    </span>
                  ))}
                </span>
              </>
            )}

            {/* Due Date & Time */}
            {task.dueDate && (
              <>
                <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
                <span
                  className={`inline-flex items-center gap-1 font-medium ${
                    task.completed
                      ? 'text-neutral-400 dark:text-neutral-500'
                      : isOverdue
                      ? 'text-rose-600 dark:text-rose-400 font-semibold'
                      : isToday
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {isOverdue && !task.completed ? (
                    <AlertTriangle className="w-3 h-3 text-rose-500" />
                  ) : (
                    <Calendar className="w-3 h-3 text-neutral-400" />
                  )}
                  <span>{dueDateText}</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Controls: Star, Pin, Duplicate, Edit, Delete */}
        <div className="flex items-center gap-1 shrink-0 pt-0.5">
          {/* Star Button */}
          <button
            type="button"
            onClick={() => onToggleStar(task.id)}
            title={task.starred ? 'Unstar' : 'Star'}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              task.starred
                ? 'text-amber-500 hover:text-amber-600'
                : 'text-neutral-400 hover:text-amber-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Star className={`w-4 h-4 ${task.starred ? 'fill-current' : ''}`} />
          </button>

          {/* Pin Button */}
          <button
            type="button"
            onClick={() => onTogglePin(task.id)}
            title={task.pinned ? 'Unpin' : 'Pin to top'}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              task.pinned
                ? 'text-indigo-500 hover:text-indigo-600'
                : 'text-neutral-400 hover:text-indigo-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Pin className={`w-4 h-4 ${task.pinned ? 'fill-current' : ''}`} />
          </button>

          {/* Duplicate Button */}
          <button
            type="button"
            onClick={() => onDuplicate(task)}
            title="Duplicate task"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* Edit Button */}
          <button
            type="button"
            onClick={() => onEdit(task)}
            title="Edit task"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => onRequestDelete(task)}
            title="Delete task"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
