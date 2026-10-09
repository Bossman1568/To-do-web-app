import { Priority, TaskCategory } from './task';

export type ActionType = 'create_task' | 'add_subtasks' | 'update_priority' | 'update_due_date';

export interface TaskActionProposal {
  id: string;
  type: ActionType;
  title: string;
  description: string;
  status: 'pending' | 'applied' | 'dismissed';
  data: {
    taskId?: string;
    taskTitle?: string;
    newTitle?: string;
    newPriority?: Priority;
    newCategory?: TaskCategory;
    newDueDate?: string;
    newDueTime?: string;
    newDescription?: string;
    newTags?: string[];
    subtasks?: string[];
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  status?: 'sending' | 'sent' | 'error';
  actionProposal?: TaskActionProposal;
  isDemoMode?: boolean;
}

export interface AIProductivityContext {
  tasksSummary: {
    total: number;
    pending: number;
    completed: number;
    overdue: number;
    dueToday: number;
    highPriorityPending: number;
    completedToday: number;
  };
  tasksList: {
    id: string;
    title: string;
    description?: string;
    priority: Priority;
    category: TaskCategory;
    completed: boolean;
    dueDate?: string;
    dueTime?: string;
    tags?: string[];
    subtasks?: { title: string; completed: boolean }[];
    starred?: boolean;
    pinned?: boolean;
  }[];
  todayDate: string;
  userGoal: number;
}
