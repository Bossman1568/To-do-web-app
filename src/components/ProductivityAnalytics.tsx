import React from 'react';
import { BarChart3, TrendingUp, CheckCircle, PieChart, Flame, Target } from 'lucide-react';
import { Task, Priority, TaskCategory } from '../types/task';

interface ProductivityAnalyticsProps {
  tasks: Task[];
  dailyGoal: number;
}

export const ProductivityAnalytics: React.FC<ProductivityAnalyticsProps> = ({ tasks, dailyGoal }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const overallCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Last 7 days completion data
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const last7Days: { dateStr: string; label: string; count: number; isToday: boolean }[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const isToday = i === 0;

    // Count tasks completed on this date
    const count = tasks.filter(t => {
      if (!t.completed || !t.completedAt) return false;
      return t.completedAt.split('T')[0] === dateStr;
    }).length;

    last7Days.push({
      dateStr,
      label: isToday ? 'Today' : daysOfWeek[d.getDay()],
      count,
      isToday,
    });
  }

  const maxDailyCount = Math.max(3, ...last7Days.map(d => d.count));

  // Category breakdown
  const categoryCounts = tasks.reduce<Record<string, { total: number; completed: number }>>((acc, t) => {
    if (!acc[t.category]) acc[t.category] = { total: 0, completed: 0 };
    acc[t.category].total += 1;
    if (t.completed) acc[t.category].completed += 1;
    return acc;
  }, {});

  // Priority breakdown
  const priorityCounts = tasks.reduce<Record<Priority, number>>(
    (acc, t) => {
      acc[t.priority] = (acc[t.priority] || 0) + 1;
      return acc;
    },
    { urgent: 0, high: 0, medium: 0, low: 0 }
  );

  // Subtask stats
  const allSubtasks = tasks.flatMap(t => t.subtasks || []);
  const completedSubtasks = allSubtasks.filter(s => s.completed).length;

  return (
    <div className="space-y-6">
      {/* Top 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Completion Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
              {overallCompletionRate}%
            </span>
            <span className="text-xs text-neutral-500">of all tasks</span>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Checklist Items
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
              {completedSubtasks} / {allSubtasks.length}
            </span>
            <span className="text-xs text-neutral-500">subtasks done</span>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Productivity Streak
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
              {last7Days.filter(d => d.count > 0).length}
            </span>
            <span className="text-xs text-neutral-500">active days this week</span>
          </div>
        </div>
      </div>

      {/* Weekly Activity Bar Chart */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Weekly Completion Activity
              </h3>
              <p className="text-xs text-neutral-500">Tasks marked completed in the last 7 days</p>
            </div>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            Target: {dailyGoal}/day
          </span>
        </div>

        {/* Bar chart container */}
        <div className="h-44 flex items-end justify-between gap-2 sm:gap-6 pt-4 px-2 border-b border-neutral-100 dark:border-neutral-800">
          {last7Days.map(d => {
            const heightPercent = Math.max(8, Math.round((d.count / maxDailyCount) * 100));
            return (
              <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[11px] font-mono text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {d.count}
                </span>
                <div
                  className={`w-full max-w-[42px] rounded-t-xl transition-all duration-500 ${
                    d.isToday
                      ? 'bg-indigo-600 dark:bg-indigo-500'
                      : d.count > 0
                      ? 'bg-neutral-800 dark:bg-neutral-700 hover:bg-indigo-500'
                      : 'bg-neutral-100 dark:bg-neutral-800/60'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
                <span
                  className={`text-[11px] font-medium pt-1 ${
                    d.isToday ? 'font-bold text-indigo-600 dark:text-indigo-400' : 'text-neutral-500'
                  }`}
                >
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Breakdown & Priority Breakdown 2-Column Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Categories */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-4 h-4 text-indigo-500" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Tasks by Category
            </h4>
          </div>

          <div className="space-y-3">
            {Object.entries(categoryCounts).map(([cat, counts]) => {
              const rate = counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">{cat}</span>
                    <span className="font-mono text-neutral-500 text-[11px]">
                      {counts.completed}/{counts.total} ({rate}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-rose-500" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Priority Distribution
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
              <span className="text-[11px] font-semibold uppercase text-rose-600 dark:text-rose-400">
                Urgent
              </span>
              <p className="text-2xl font-bold font-mono text-neutral-900 dark:text-white mt-1">
                {priorityCounts.urgent}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30">
              <span className="text-[11px] font-semibold uppercase text-orange-600 dark:text-orange-400">
                High
              </span>
              <p className="text-2xl font-bold font-mono text-neutral-900 dark:text-white mt-1">
                {priorityCounts.high}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
              <span className="text-[11px] font-semibold uppercase text-amber-600 dark:text-amber-400">
                Medium
              </span>
              <p className="text-2xl font-bold font-mono text-neutral-900 dark:text-white mt-1">
                {priorityCounts.medium}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
              <span className="text-[11px] font-semibold uppercase text-emerald-600 dark:text-emerald-400">
                Low
              </span>
              <p className="text-2xl font-bold font-mono text-neutral-900 dark:text-white mt-1">
                {priorityCounts.low}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
