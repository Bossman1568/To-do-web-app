import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag, AlertCircle, Plus, Check, Trash2, Clock, Star, Pin } from 'lucide-react';
import { Task, Priority, TaskCategory, Subtask } from '../types/task';

interface EditTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
}

const CATEGORIES: TaskCategory[] = ['Work', 'Personal', 'Study', 'Health', 'Finance', 'General'];

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<TaskCategory>('Work');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [starred, setStarred] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setCategory(task.category);
      setDueDate(task.dueDate || '');
      setDueTime(task.dueTime || '');
      setStarred(Boolean(task.starred));
      setPinned(Boolean(task.pinned));
      setTags(task.tags || []);
      setSubtasks(task.subtasks ? [...task.subtasks] : []);
      setError('');
      setNewTagInput('');
      setNewSubtaskTitle('');
    }
  }, [task]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const handleAddTag = () => {
    const trimmed = newTagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleAddSubtask = () => {
    const trimmed = newSubtaskTitle.trim();
    if (trimmed) {
      setSubtasks([
        ...subtasks,
        {
          id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: trimmed,
          completed: false,
        },
      ]);
      setNewSubtaskTitle('');
    }
  };

  const handleToggleSubtask = (subId: string) => {
    setSubtasks(
      subtasks.map(s => (s.id === subId ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleRemoveSubtask = (subId: string) => {
    setSubtasks(subtasks.filter(s => s.id !== subId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Task title cannot be empty');
      return;
    }

    onSave({
      ...task,
      title: trimmedTitle,
      description: description.trim() || undefined,
      priority,
      category,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      starred,
      pinned,
      tags: tags.length > 0 ? tags : undefined,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-task-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden my-6 transition-all"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <h2 id="edit-task-title" className="text-base font-semibold text-neutral-900 dark:text-white">
              Edit Task Details
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Quick Star Toggle */}
            <button
              type="button"
              onClick={() => setStarred(!starred)}
              title={starred ? 'Unstar task' : 'Star task'}
              className={`p-1.5 rounded-lg border transition-colors ${
                starred
                  ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-500'
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
              }`}
            >
              <Star className="w-4 h-4 fill-current" />
            </button>
            {/* Quick Pin Toggle */}
            <button
              type="button"
              onClick={() => setPinned(!pinned)}
              title={pinned ? 'Unpin task' : 'Pin to top'}
              className={`p-1.5 rounded-lg border transition-colors ${
                pinned
                  ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500'
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
              }`}
            >
              <Pin className="w-4 h-4 fill-current" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Prepare client deck"
              autoFocus
            />
            {error && (
              <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
              Description & Notes
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Add extra context, guidelines, or reference links..."
            />
          </div>

          {/* Priority Levels (4 levels: Low, Medium, High, Urgent) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
              Priority Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPriority('low')}
                className={`py-2 px-2 rounded-xl text-xs font-medium border transition-all ${
                  priority === 'low'
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                Low
              </button>
              <button
                type="button"
                onClick={() => setPriority('medium')}
                className={`py-2 px-2 rounded-xl text-xs font-medium border transition-all ${
                  priority === 'medium'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                Medium
              </button>
              <button
                type="button"
                onClick={() => setPriority('high')}
                className={`py-2 px-2 rounded-xl text-xs font-medium border transition-all ${
                  priority === 'high'
                    ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                High
              </button>
              <button
                type="button"
                onClick={() => setPriority('urgent')}
                className={`py-2 px-2 rounded-xl text-xs font-medium border transition-all ${
                  priority === 'urgent'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                Urgent
              </button>
            </div>
          </div>

          {/* Subtasks Checklist Management */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
              Subtasks ({subtasks.filter(s => s.completed).length}/{subtasks.length} done)
            </label>
            <div className="space-y-1.5 mb-2">
              {subtasks.map(sub => (
                <div
                  key={sub.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40 text-xs"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleSubtask(sub.id)}
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      sub.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-neutral-300 dark:border-neutral-700'
                    }`}
                  >
                    {sub.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                  <span
                    className={`flex-1 break-words ${
                      sub.completed ? 'line-through text-neutral-400 dark:text-neutral-500' : 'text-neutral-800 dark:text-neutral-200'
                    }`}
                  >
                    {sub.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(sub.id)}
                    className="text-neutral-400 hover:text-rose-500 p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={e => setNewSubtaskTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Add subtask item (Press Enter)..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-medium hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* Category & Tags Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Custom Tags
              </label>
              <div className="flex items-center gap-1 mb-1.5">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={e => setNewTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="e.g. Design, Sprint"
                  className="flex-1 px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-2.5 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {tags.map(t => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[11px] text-neutral-700 dark:text-neutral-300"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-rose-500"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Due Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Due Time
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={e => setDueTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 text-xs font-semibold transition-all shadow-sm cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
