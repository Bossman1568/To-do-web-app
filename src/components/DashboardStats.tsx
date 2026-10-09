import React from 'react';
import { ListTodo, CheckCircle2, Clock, AlertOctagon, Target, CalendarDays, Plus, Minus } from 'lucide-react';
import { TaskView } from '../types/task';

interface DashboardStatsProps {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  dueToday: number;
  completedToday: number;
  dailyGoal: number;
  onUpdateDailyGoal: (newGoal: number) => void;
  currentView: TaskView;
  onSelectView: (view: TaskView) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  total,
  completed,
  pending,
  overdue,
  dueToday,
  completedToday,
  dailyGoal,
  onUpdateDailyGoal,
  currentView,
  onSelectView,
}) => {
  const goalProgress = dailyGoal > 0 ? Math.min(100, Math.round((completedToday / dailyGoal) * 100)) : 0;
  const isGoalMet = completedToday >= dailyGoal && dailyGoal > 0;

  return (
    <section aria-label="Task Analytics Dashboard" className="mb-6 space-y-3.5">
      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Tasks Card */}
        <button
          onClick={() => onSelectView('all')}
          className={`text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer ${
            currentView === 'all'
              ? 'bg-neutral-900 text-white dark:bg-neutral-800 dark:border-neutral-700 shadow-sm'
              : 'bg-white dark:bg-neutral-900/60 border-neutral-200/80 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 hover:border-neutral-300 dark:hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span
              className={`text-[11px] font-medium uppercase tracking-wider ${
                currentView === 'all' ? 'text-neutral-300 dark:text-neutral-300' : 'text-neutral-500 dark:text-neutral-400'
              }`}
            >
              Total Tasks
            </span>
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${
                currentView === 'all'
                  ? 'bg-neutral-800 text-neutral-200 dark:bg-neutral-700'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <ListTodo className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-tight">
              {total}
            </span>
            <span
              className={`text-xs ${
                currentView === 'all' ? 'text-neutral-400' : 'text-neutral-500 dark:text-neutral-400'
              }`}
            >
              all items
            </span>
          </div>
        </button>

        {/* Pending Tasks Card */}
        <button
          onClick={() => onSelectView('my-day')}
          className={`text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer ${
            currentView === 'my-day'
              ? 'bg-amber-950/20 border-amber-500/40 dark:bg-amber-950/30 dark:border-amber-500/50'
              : 'bg-white dark:bg-neutral-900/60 border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Pending
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100 tracking-tight">
              {pending}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">active</span>
          </div>
        </button>

        {/* Completed Tasks Card */}
        <button
          onClick={() => onSelectView('completed')}
          className={`text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer ${
            currentView === 'completed'
              ? 'bg-emerald-950/20 border-emerald-500/40 dark:bg-emerald-950/30 dark:border-emerald-500/50'
              : 'bg-white dark:bg-neutral-900/60 border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Completed
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100 tracking-tight">
              {completed}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">done</span>
          </div>
        </button>

        {/* Overdue Tasks Card */}
        <button
          onClick={() => onSelectView('overdue')}
          className={`text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer ${
            currentView === 'overdue'
              ? 'bg-rose-950/20 border-rose-500/40 dark:bg-rose-950/30 dark:border-rose-500/50'
              : 'bg-white dark:bg-neutral-900/60 border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Overdue
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-tight ${
                overdue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-900 dark:text-neutral-100'
              }`}
            >
              {overdue}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {overdue === 1 ? 'task' : 'tasks'}
            </span>
          </div>
        </button>
      </div>

      {/* Daily Productivity & Daily Goal Bar */}
      <div className="p-4 sm:p-5 rounded-2xl border bg-white dark:bg-neutral-900/60 border-neutral-200/80 dark:border-neutral-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left: Daily Completion Goal with +/- controllers */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                Daily Goal:
              </span>
              <span className="text-xs font-mono tabular-nums text-neutral-700 dark:text-neutral-300">
                {completedToday} / {dailyGoal} completed today
              </span>
              {isGoalMet && (
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                  Goal Met! 🎉
                </span>
              )}
            </div>

            {/* Stepper to adjust goal */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onUpdateDailyGoal(Math.max(1, dailyGoal - 1))}
                title="Decrease daily goal"
                className="w-6 h-6 rounded-md border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-xs font-mono tabular-nums w-5 text-center text-neutral-700 dark:text-neutral-300">
                {dailyGoal}
              </span>
              <button
                type="button"
                onClick={() => onUpdateDailyGoal(dailyGoal + 1)}
                title="Increase daily goal"
                className="w-6 h-6 rounded-md border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                isGoalMet
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-indigo-500 to-indigo-600'
              }`}
              style={{ width: `${goalProgress}%` }}
            />
          </div>
        </div>

        {/* Right: Quick Deadlines Indicators */}
        <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-100 dark:border-neutral-800 text-xs">
          <button
            onClick={() => onSelectView('my-day')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200/90 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors text-neutral-700 dark:text-neutral-300 cursor-pointer"
          >
            <CalendarDays className="w-3.5 h-3.5 text-amber-500" />
            <span>Due Today:</span>
            <span className="font-mono tabular-nums font-bold text-neutral-900 dark:text-white">
              {dueToday}
            </span>
          </button>

          <button
            onClick={() => onSelectView('upcoming')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200/90 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors text-neutral-700 dark:text-neutral-300 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>Upcoming:</span>
            <span className="font-mono tabular-nums font-bold text-neutral-900 dark:text-white">
              {Math.max(0, pending - dueToday)}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};
