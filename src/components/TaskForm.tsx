import React, { useState } from 'react';
import { Plus, Calendar, Tag, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { Priority, TaskCategory, Subtask } from '../types/task';

interface TaskFormProps {
  onAddTask: (task: {
    title: string;
    description?: string;
    priority: Priority;
    category: TaskCategory;
    dueDate?: string;
    dueTime?: string;
    tags?: string[];
    subtasks?: Subtask[];
  }) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

const CATEGORIES: TaskCategory[] = ['Work', 'Personal', 'Study', 'Health', 'Finance', 'General'];

export const TaskForm: React.FC<TaskFormProps> = ({ onAddTask, inputRef }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<TaskCategory>('Work');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState('');

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Please enter a task title');
      return;
    }

    onAddTask({
      title: trimmedTitle,
      description: description.trim() || undefined,
      priority,
      category,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      tags: tags.length > 0 ? tags : undefined,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setPriority('medium');
    setCategory('Work');
    setDueDate('');
    setDueTime('');
    setTags([]);
    setTagInput('');
    setError('');
    setIsExpanded(false);
  };

  return (
    <div className="bg-white dark:bg-neutral-900/80 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm overflow-hidden mb-6 transition-colors">
      <form onSubmit={handleSubmit} className="p-4 sm:p-5">
        {/* Main Title Input row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={e => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="What needs to be done? e.g. Finish client proposal... (Press Enter to add)"
              className={`w-full px-4 py-2.5 rounded-xl border bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-sm focus:outline-none focus:ring-2 transition-all ${
                error
                  ? 'border-rose-400 focus:ring-rose-400'
                  : 'border-neutral-200 dark:border-neutral-800 focus:ring-indigo-500/80 focus:border-indigo-500'
              }`}
            />
            {error && (
              <p className="absolute -bottom-5 left-1 text-[11px] text-rose-500 font-medium">
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Priority Selector (Low, Medium, High, Urgent) */}
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-800/80 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setPriority('low')}
                title="Low Priority"
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                  priority === 'low'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Low
              </button>
              <button
                type="button"
                onClick={() => setPriority('medium')}
                title="Medium Priority"
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                  priority === 'medium'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Med
              </button>
              <button
                type="button"
                onClick={() => setPriority('high')}
                title="High Priority"
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                  priority === 'high'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                High
              </button>
              <button
                type="button"
                onClick={() => setPriority('urgent')}
                title="Urgent Priority"
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                  priority === 'urgent'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Urgent
              </button>
            </div>

            {/* Toggle More Details */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1 transition-colors ${
                isExpanded
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
              title="Add details (due date, due time, description, tags)"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              className="px-4 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Expandable Details Section */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 space-y-3.5">
            {/* Description Textarea */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                Description / Notes (Optional)
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Add more details, links, or instructions..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Category & Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as TaskCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Custom Tags
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="e.g. Design, Sprint (Press Enter)"
                    className="flex-1 px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-2.5 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  >
                    Add
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {tags.map(t => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[11px] text-neutral-700 dark:text-neutral-300"
                      >
                        #{t}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="hover:text-rose-500 text-neutral-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Due Date and Due Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Due Date (Optional)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Due Time (Optional)
                </label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={e => setDueTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
