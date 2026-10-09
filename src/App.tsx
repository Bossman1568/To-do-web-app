import { useState, useMemo, useRef, useEffect } from 'react';
import { Task, TaskView, Priority, TaskSort, TaskCategory, MainTab, UserPreferences, Subtask } from './types/task';
import { TaskActionProposal, AIProductivityContext } from './types/ai';
import { INITIAL_TASKS } from './data/initialTasks';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTheme } from './hooks/useTheme';
import { isTodayDateString, isTaskOverdue, getTodayDateString } from './utils/date';
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { TaskForm } from './components/TaskForm';
import { TaskFilters } from './components/TaskFilters';
import { TaskList } from './components/TaskList';
import { CalendarView } from './components/CalendarView';
import { PomodoroTimer } from './components/PomodoroTimer';
import { ProductivityAnalytics } from './components/ProductivityAnalytics';
import { FocusMode } from './components/FocusMode';
import { EditTaskModal } from './components/EditTaskModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { ImportExportModal } from './components/ImportExportModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { AIChatPanel } from './components/AIChatPanel';
import { AIFloatingTrigger } from './components/AIFloatingTrigger';
import { Toast } from './components/Toast';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [tasks, setTasks] = useLocalStorage<Task[]>('taskflow_tasks', INITIAL_TASKS);
  const [userPrefs, setUserPrefs] = useLocalStorage<UserPreferences>('taskflow_prefs', {
    dailyGoal: 5,
    focusMinutes: 25,
    breakMinutes: 5,
    longBreakMinutes: 15,
  });

  // Navigation & View state
  const [activeTab, setActiveTab] = useState<MainTab>('tasks');
  const [currentView, setCurrentView] = useState<TaskView>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'all'>('all');
  const [sort, setSort] = useState<TaskSort>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Panels
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [confirmDeleteTask, setConfirmDeleteTask] = useState<Task | null>(null);
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; deletedTask?: Task } | null>(null);

  const taskInputRef = useRef<HTMLInputElement>(null);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside an input or textarea
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setActiveTab('tasks');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => taskInputRef.current?.focus(), 50);
      } else if (e.key === '/') {
        e.preventDefault();
        setActiveTab('tasks');
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        searchInput?.focus();
      } else if (e.key === 'c' || e.key === 'C') {
        setIsAIChatOpen(prev => !prev);
      } else if (e.key === '1') {
        setActiveTab('tasks');
      } else if (e.key === '2') {
        setActiveTab('calendar');
      } else if (e.key === '3') {
        setActiveTab('pomodoro');
      } else if (e.key === '4') {
        setActiveTab('analytics');
      } else if (e.key === 'f' || e.key === 'F') {
        setIsFocusModeOpen(prev => !prev);
      } else if (e.key === 'd' || e.key === 'D') {
        toggleTheme();
      } else if (e.key === '?') {
        setIsShortcutsOpen(true);
      } else if (e.key === 'Escape') {
        setIsFocusModeOpen(false);
        setIsImportExportOpen(false);
        setIsShortcutsOpen(false);
        setIsAIChatOpen(false);
        setEditingTask(null);
        setConfirmDeleteTask(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTheme]);

  // Compute Dashboard Statistics
  const todayStr = getTodayDateString();
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    const overdue = tasks.filter(
      t => !t.completed && isTaskOverdue(t.dueDate, t.dueTime)
    ).length;

    const dueToday = tasks.filter(
      t => !t.completed && isTodayDateString(t.dueDate)
    ).length;

    const highPriorityPending = tasks.filter(
      t => !t.completed && (t.priority === 'urgent' || t.priority === 'high')
    ).length;

    const completedToday = tasks.filter(t => {
      if (!t.completed || !t.completedAt) return false;
      return t.completedAt.split('T')[0] === todayStr;
    }).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      pending,
      overdue,
      dueToday,
      highPriorityPending,
      completedToday,
      completionRate,
    };
  }, [tasks, todayStr]);

  // Filter and Sort Tasks
  const filteredAndSortedTasks = useMemo(() => {
    return tasks
      .filter(task => {
        // View filter
        if (currentView === 'my-day') {
          const isDueToday = isTodayDateString(task.dueDate);
          const isCreatedToday = task.createdAt.split('T')[0] === todayStr;
          if (!isDueToday && !task.pinned && !isCreatedToday) return false;
        } else if (currentView === 'upcoming') {
          if (!task.dueDate || task.dueDate <= todayStr) return false;
        } else if (currentView === 'overdue') {
          if (task.completed || !isTaskOverdue(task.dueDate, task.dueTime)) return false;
        } else if (currentView === 'starred') {
          if (!task.starred) return false;
        } else if (currentView === 'completed') {
          if (!task.completed) return false;
        }

        // Priority filter
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

        // Category filter
        if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;

        // Search query filter (matches title, description, and tags)
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().replace(/^#/, '');
          const matchTitle = task.title.toLowerCase().includes(query);
          const matchDesc = task.description?.toLowerCase().includes(query) ?? false;
          const matchCat = task.category.toLowerCase().includes(query);
          const matchTags = (task.tags || []).some(t => t.toLowerCase().includes(query));
          if (!matchTitle && !matchDesc && !matchCat && !matchTags) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Pinned tasks always float to top (unless sorting completed view)
        if (currentView !== 'completed') {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
        }

        switch (sort) {
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'priority': {
            const weights: Record<Priority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
            return weights[b.priority] - weights[a.priority];
          }
          case 'dueDate': {
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            const diff = a.dueDate.localeCompare(b.dueDate);
            if (diff !== 0) return diff;
            return (a.dueTime || '').localeCompare(b.dueTime || '');
          }
          case 'alphabetical':
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });
  }, [tasks, currentView, priorityFilter, categoryFilter, sort, searchQuery, todayStr]);

  // Task Actions
  const handleAddTask = (newTaskData: {
    title: string;
    description?: string;
    priority: Priority;
    category: TaskCategory;
    dueDate?: string;
    dueTime?: string;
    tags?: string[];
    subtasks?: Subtask[];
  }) => {
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: newTaskData.title,
      description: newTaskData.description,
      completed: false,
      priority: newTaskData.priority,
      category: newTaskData.category,
      dueDate: newTaskData.dueDate,
      dueTime: newTaskData.dueTime,
      tags: newTaskData.tags,
      subtasks: newTaskData.subtasks,
      createdAt: new Date().toISOString(),
    };

    setTasks(prev => [newTask, ...prev]);
    setToast({ message: `Added "${newTask.title.slice(0, 24)}"` });
  };

  const handleAddTaskForDate = (title: string, dateString: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      completed: false,
      priority: 'medium',
      category: 'Work',
      dueDate: dateString,
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
    setToast({ message: `Scheduled task for ${dateString}` });
  };

  const handleToggleComplete = (id: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === id) {
          const nextCompleted = !task.completed;
          return {
            ...task,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
          };
        }
        return task;
      })
    );
  };

  // Star & Pin
  const handleToggleStar = (id: string) => {
    setTasks(prev =>
      prev.map(task => (task.id === id ? { ...task, starred: !task.starred } : task))
    );
  };

  const handleTogglePin = (id: string) => {
    setTasks(prev =>
      prev.map(task => (task.id === id ? { ...task, pinned: !task.pinned } : task))
    );
  };

  // Duplicate task
  const handleDuplicateTask = (task: Task) => {
    const duplicated: Task = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: `${task.title} (Copy)`,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: undefined,
      subtasks: task.subtasks ? task.subtasks.map(s => ({ ...s, completed: false, id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}` })) : undefined,
    };
    setTasks(prev => [duplicated, ...prev]);
    setToast({ message: `Duplicated "${task.title.slice(0, 20)}"` });
  };

  // Subtasks
  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId && task.subtasks) {
          return {
            ...task,
            subtasks: task.subtasks.map(s =>
              s.id === subtaskId ? { ...s, completed: !s.completed } : s
            ),
          };
        }
        return task;
      })
    );
  };

  const handleAddSubtask = (taskId: string, title: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          const currentSubs = task.subtasks || [];
          return {
            ...task,
            subtasks: [
              ...currentSubs,
              {
                id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                title,
                completed: false,
              },
            ],
          };
        }
        return task;
      })
    );
  };

  // Deletion with confirmation dialog + undo
  const handleRequestDelete = (task: Task) => {
    setConfirmDeleteTask(task);
  };

  const handleConfirmDelete = () => {
    if (!confirmDeleteTask) return;
    const taskToDelete = confirmDeleteTask;
    setTasks(prev => prev.filter(t => t.id !== taskToDelete.id));
    setConfirmDeleteTask(null);
    setToast({
      message: `Deleted "${taskToDelete.title.slice(0, 24)}${taskToDelete.title.length > 24 ? '...' : ''}"`,
      deletedTask: taskToDelete,
    });
  };

  const handleUndoDelete = () => {
    if (toast?.deletedTask) {
      setTasks(prev => [toast.deletedTask!, ...prev]);
      setToast(null);
    }
  };

  const handleSaveEditTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => (t.id === updatedTask.id ? updatedTask : t)));
    setEditingTask(null);
    setToast({ message: 'Task updated successfully' });
  };

  const handleClearCompleted = () => {
    const completedTasks = tasks.filter(t => t.completed);
    if (completedTasks.length === 0) return;

    if (window.confirm(`Clear all ${completedTasks.length} completed tasks?`)) {
      setTasks(prev => prev.filter(t => !t.completed));
      setToast({
        message: `Cleared ${completedTasks.length} completed task${completedTasks.length > 1 ? 's' : ''}`,
      });
    }
  };

  const handleMarkAllCompleted = () => {
    setTasks(prev =>
      prev.map(t => ({
        ...t,
        completed: true,
        completedAt: t.completed ? t.completedAt : new Date().toISOString(),
      }))
    );
    setToast({ message: 'Marked all tasks as completed! 🎉' });
  };

  const handleResetTasks = () => {
    if (window.confirm('Reset all tasks to sample list? Any unsaved custom tasks will be overwritten.')) {
      setTasks(INITIAL_TASKS);
      setToast({ message: 'Reset workspace to sample tasks' });
    }
  };

  const handleImportSuccess = (imported: Task[]) => {
    setTasks(imported);
    setToast({ message: `Imported ${imported.length} tasks from backup!` });
  };

  const handleUpdateDailyGoal = (newGoal: number) => {
    setUserPrefs(prev => ({ ...prev, dailyGoal: newGoal }));
  };

  const handleFocusInput = () => {
    setActiveTab('tasks');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => taskInputRef.current?.focus(), 50);
  };

  // Memoized context for AI Productivity Assistant
  const aiContext: AIProductivityContext = useMemo(() => {
    return {
      tasksSummary: {
        total: stats.total,
        pending: stats.pending,
        completed: stats.completed,
        overdue: stats.overdue,
        dueToday: stats.dueToday,
        highPriorityPending: stats.highPriorityPending,
        completedToday: stats.completedToday,
      },
      tasksList: tasks.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        priority: t.priority,
        category: t.category,
        completed: t.completed,
        dueDate: t.dueDate,
        dueTime: t.dueTime,
        tags: t.tags,
        subtasks: t.subtasks?.map(s => ({ title: s.title, completed: s.completed })),
        starred: t.starred,
        pinned: t.pinned,
      })),
      todayDate: todayStr,
      userGoal: userPrefs.dailyGoal,
    };
  }, [tasks, stats, todayStr, userPrefs.dailyGoal]);

  const handleApplyAIAction = (proposal: TaskActionProposal) => {
    if (proposal.type === 'create_task') {
      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: proposal.data.newTitle || proposal.title,
        description: proposal.data.newDescription,
        priority: proposal.data.newPriority || 'medium',
        category: proposal.data.newCategory || 'Work',
        dueDate: proposal.data.newDueDate,
        dueTime: proposal.data.newDueTime,
        tags: proposal.data.newTags,
        subtasks: proposal.data.subtasks?.map(st => ({
          id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: st,
          completed: false,
        })),
        completed: false,
        createdAt: new Date().toISOString(),
      };
      setTasks(prev => [newTask, ...prev]);
      setToast({ message: `Created "${newTask.title.slice(0, 24)}" from AI proposal!` });
    } else if (proposal.type === 'add_subtasks' && proposal.data.subtasks) {
      const targetId = proposal.data.taskId;
      setTasks(prev =>
        prev.map(t => {
          if (t.id === targetId || t.title === proposal.data.taskTitle) {
            const currentSubs = t.subtasks || [];
            const newSubs = proposal.data.subtasks!.map(title => ({
              id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              title,
              completed: false,
            }));
            return {
              ...t,
              subtasks: [...currentSubs, ...newSubs],
            };
          }
          return t;
        })
      );
      setToast({ message: `Added ${proposal.data.subtasks.length} subtasks from AI proposal!` });
    } else if (proposal.type === 'update_priority' && proposal.data.newPriority) {
      setTasks(prev =>
        prev.map(t => {
          if (t.id === proposal.data.taskId || t.title === proposal.data.taskTitle) {
            return { ...t, priority: proposal.data.newPriority! };
          }
          return t;
        })
      );
      setToast({ message: `Updated priority to ${proposal.data.newPriority.toUpperCase()}!` });
    } else if (proposal.type === 'update_due_date' && proposal.data.newDueDate) {
      setTasks(prev =>
        prev.map(t => {
          if (t.id === proposal.data.taskId || t.title === proposal.data.taskTitle) {
            return {
              ...t,
              dueDate: proposal.data.newDueDate,
              dueTime: proposal.data.newDueTime || t.dueTime,
            };
          }
          return t;
        })
      );
      setToast({ message: `Updated deadline to ${proposal.data.newDueDate}!` });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans antialiased transition-colors duration-200">
      {/* Top Bar Header */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        tasks={tasks}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenFocusMode={() => setIsFocusModeOpen(true)}
        onOpenImportExport={() => setIsImportExportOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenAIChat={() => setIsAIChatOpen(true)}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Render Tab Contents */}
        {activeTab === 'tasks' && (
          <>
            {/* Dashboard Statistics Panel */}
            <DashboardStats
              total={stats.total}
              completed={stats.completed}
              pending={stats.pending}
              overdue={stats.overdue}
              dueToday={stats.dueToday}
              completedToday={stats.completedToday}
              dailyGoal={userPrefs.dailyGoal}
              onUpdateDailyGoal={handleUpdateDailyGoal}
              currentView={currentView}
              onSelectView={setCurrentView}
            />

            {/* Task Creation Form */}
            <TaskForm onAddTask={handleAddTask} inputRef={taskInputRef} />

            {/* Task Filters & Views Bar */}
            <TaskFilters
              currentView={currentView}
              onViewChange={setCurrentView}
              priorityFilter={priorityFilter}
              onPriorityFilterChange={setPriorityFilter}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              sort={sort}
              onSortChange={setSort}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              totalMatching={filteredAndSortedTasks.length}
            />

            {/* Task List */}
            <TaskList
              tasks={filteredAndSortedTasks}
              allTasks={tasks}
              filter={currentView === 'completed' ? 'completed' : 'all'}
              searchQuery={searchQuery}
              onToggleComplete={handleToggleComplete}
              onRequestDelete={handleRequestDelete}
              onEdit={setEditingTask}
              onToggleStar={handleToggleStar}
              onTogglePin={handleTogglePin}
              onDuplicate={handleDuplicateTask}
              onToggleSubtask={handleToggleSubtask}
              onAddSubtask={handleAddSubtask}
              onClearCompleted={handleClearCompleted}
              onMarkAllCompleted={handleMarkAllCompleted}
              onClearSearch={() => setSearchQuery('')}
              onLoadSamples={() => setTasks(INITIAL_TASKS)}
              onFocusInput={handleFocusInput}
            />
          </>
        )}

        {/* Tab 2: Monthly Calendar View */}
        {activeTab === 'calendar' && (
          <CalendarView
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
            onAddTaskForDate={handleAddTaskForDate}
            onEditTask={setEditingTask}
          />
        )}

        {/* Tab 3: Pomodoro Focus Timer */}
        {activeTab === 'pomodoro' && (
          <PomodoroTimer tasks={tasks} onToggleComplete={handleToggleComplete} />
        )}

        {/* Tab 4: Productivity Analytics */}
        {activeTab === 'analytics' && (
          <ProductivityAnalytics tasks={tasks} dailyGoal={userPrefs.dailyGoal} />
        )}
      </main>

      {/* Fullscreen Distraction-Free Focus Mode */}
      {isFocusModeOpen && (
        <FocusMode
          tasks={tasks}
          onToggleComplete={handleToggleComplete}
          onExit={() => setIsFocusModeOpen(false)}
        />
      )}

      {/* Modal for Editing Tasks */}
      <EditTaskModal
        task={editingTask}
        isOpen={editingTask !== null}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveEditTask}
      />

      {/* Confirmation Dialog Before Deletion */}
      <ConfirmDeleteModal
        task={confirmDeleteTask}
        isOpen={confirmDeleteTask !== null}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteTask(null)}
      />

      {/* Modal for Import / Export */}
      <ImportExportModal
        tasks={tasks}
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        onImportSuccess={handleImportSuccess}
        onResetTasks={handleResetTasks}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Floating AI Chat Trigger */}
      <AIFloatingTrigger
        isOpen={isAIChatOpen}
        onToggle={() => setIsAIChatOpen(prev => !prev)}
        pendingTasksCount={stats.pending}
      />

      {/* AI Productivity Chat Panel */}
      <AIChatPanel
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        context={aiContext}
        onApplyAction={handleApplyAIAction}
      />

      {/* Floating Action / Undo Notification Toast */}
      {toast && (
        <Toast
          message={toast.message}
          onUndo={toast.deletedTask ? handleUndoDelete : undefined}
          onClose={() => setToast(null)}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-neutral-200/60 dark:border-neutral-800/80 py-6 text-center text-xs text-neutral-400 dark:text-neutral-600">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TaskFlow — Minimalist & Responsive Productivity System</span>
          <div className="flex items-center gap-3">
            <span>Offline localStorage</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsShortcutsOpen(true)}
              className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
            >
              Shortcuts (?)
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsImportExportOpen(true)}
              className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
            >
              Backup & Restore
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
