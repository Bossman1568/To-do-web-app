export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskFilter = 'all' | 'active' | 'completed';

export type TaskView = 'all' | 'my-day' | 'upcoming' | 'overdue' | 'starred' | 'completed';

export type MainTab = 'tasks' | 'calendar' | 'pomodoro' | 'analytics';

export type TaskSort = 'newest' | 'oldest' | 'priority' | 'alphabetical' | 'dueDate';

export type TaskCategory = 'Work' | 'Personal' | 'Study' | 'Health' | 'Finance' | 'General';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  category: TaskCategory;
  tags?: string[];
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  subtasks?: Subtask[];
  starred?: boolean;
  pinned?: boolean;
  createdAt: string; // ISO string
  completedAt?: string; // ISO string
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  dueToday: number;
  completionRate: number;
  highPriorityPending: number;
  completedToday: number;
}

export interface UserPreferences {
  dailyGoal: number;
  focusMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
}
