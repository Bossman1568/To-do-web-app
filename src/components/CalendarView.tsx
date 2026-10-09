import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Check, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Task, Priority } from '../types/task';
import { getMonthCalendarDays, getTodayDateString } from '../utils/date';

interface CalendarViewProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onAddTaskForDate: (title: string, dateString: string) => void;
  onEditTask: (task: Task) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  onToggleComplete,
  onAddTaskForDate,
  onEditTask,
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [quickTitle, setQuickTitle] = useState('');

  const days = getMonthCalendarDays(currentYear, currentMonth);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(getTodayDateString());
  };

  // Group tasks by dueDate
  const tasksByDate = tasks.reduce<Record<string, Task[]>>((acc, t) => {
    if (t.dueDate) {
      if (!acc[t.dueDate]) acc[t.dueDate] = [];
      acc[t.dueDate].push(t);
    }
    return acc;
  }, {});

  const selectedDateTasks = tasksByDate[selectedDate] || [];

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTitle.trim() && selectedDate) {
      onAddTaskForDate(quickTitle.trim(), selectedDate);
      setQuickTitle('');
    }
  };

  const getPriorityDot = (p: Priority) => {
    switch (p) {
      case 'urgent': return 'bg-rose-600';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-emerald-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 shadow-sm p-4 sm:p-6 transition-colors">
        {/* Header: Month, Year, and Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {tasks.filter(t => t.dueDate?.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`)).length} scheduled tasks this month
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleJumpToToday}
              className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Today
            </button>
            <div className="flex items-center rounded-xl border border-neutral-200 dark:border-neutral-800 p-0.5 bg-neutral-50 dark:bg-neutral-950">
              <button
                onClick={handlePrevMonth}
                title="Previous Month"
                className="p-1 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                title="Next Month"
                className="p-1 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-neutral-400 mb-2">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {days.map(day => {
            const dayTasks = tasksByDate[day.dateString] || [];
            const isSelected = selectedDate === day.dateString;
            const hasPending = dayTasks.some(t => !t.completed);

            return (
              <button
                key={day.dateString}
                onClick={() => setSelectedDate(day.dateString)}
                className={`min-h-[64px] sm:min-h-[80px] p-1.5 sm:p-2 rounded-xl text-left border transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                    : day.isToday
                    ? 'border-amber-400/80 bg-amber-50/30 dark:bg-amber-950/20'
                    : day.isCurrentMonth
                    ? 'border-neutral-100 dark:border-neutral-800/80 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/40 dark:bg-neutral-950/20'
                    : 'border-transparent text-neutral-300 dark:text-neutral-600 opacity-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono font-medium ${
                      day.isToday
                        ? 'w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold'
                        : isSelected
                        ? 'font-bold text-indigo-600 dark:text-indigo-400'
                        : day.isCurrentMonth
                        ? 'text-neutral-700 dark:text-neutral-300'
                        : 'text-neutral-400'
                    }`}
                  >
                    {day.dayNumber}
                  </span>

                  {dayTasks.length > 0 && (
                    <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
                      {dayTasks.length}
                    </span>
                  )}
                </div>

                {/* Task Indicators */}
                <div className="flex flex-col gap-0.5 mt-1 overflow-hidden">
                  {dayTasks.slice(0, 2).map(t => (
                    <div
                      key={t.id}
                      className={`text-[10px] truncate px-1 py-0.5 rounded flex items-center gap-1 ${
                        t.completed
                          ? 'line-through text-neutral-400 bg-neutral-100 dark:bg-neutral-800'
                          : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 shadow-2xs'
                      }`}
                    >
                      <span className={`w-1 h-1 rounded-full shrink-0 ${getPriorityDot(t.priority)}`} />
                      <span className="truncate">{t.title}</span>
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <span className="text-[9px] text-neutral-400 pl-1 font-mono">
                      +{dayTasks.length - 2} more
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Details Panel */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 shadow-sm p-5 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <span>Tasks for {selectedDate}</span>
              {selectedDate === getTodayDateString() && (
                <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
                  Today
                </span>
              )}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {selectedDateTasks.length} {selectedDateTasks.length === 1 ? 'task' : 'tasks'} scheduled
            </p>
          </div>

          {/* Quick Add for this date */}
          <form onSubmit={handleQuickAdd} className="flex items-center gap-2">
            <input
              type="text"
              value={quickTitle}
              onChange={e => setQuickTitle(e.target.value)}
              placeholder="Add task for this date..."
              className="px-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-52 sm:w-64"
            />
            <button
              type="submit"
              disabled={!quickTitle.trim()}
              className="px-3 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 rounded-xl text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors disabled:opacity-40 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>

        {/* Selected Tasks List */}
        <div className="mt-4 space-y-2">
          {selectedDateTasks.length === 0 ? (
            <p className="text-xs text-neutral-400 dark:text-neutral-500 py-6 text-center italic">
              No tasks scheduled for this day. Use the input above to schedule one.
            </p>
          ) : (
            selectedDateTasks.map(t => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 rounded-xl border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950/30"
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onToggleComplete(t.id)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                      t.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-neutral-300 dark:border-neutral-700 hover:border-indigo-500'
                    }`}
                  >
                    {t.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>

                  <div>
                    <h4
                      className={`text-xs font-semibold ${
                        t.completed
                          ? 'line-through text-neutral-400 dark:text-neutral-500'
                          : 'text-neutral-900 dark:text-neutral-100'
                      }`}
                    >
                      {t.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-0.5">
                      <span className={`inline-flex items-center gap-1 font-medium capitalize`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getPriorityDot(t.priority)}`} />
                        {t.priority}
                      </span>
                      {t.dueTime && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" /> {t.dueTime}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onEditTask(t)}
                  className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
