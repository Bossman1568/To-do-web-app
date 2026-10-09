import { AIProductivityContext, TaskActionProposal } from '../types/ai';

export interface AIChatResponse {
  response: string;
  actionProposal?: TaskActionProposal;
  isDemoMode: boolean;
  model: string;
}

export async function sendChatMessage(
  message: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  context: AIProductivityContext
): Promise<AIChatResponse> {
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history,
        context,
      }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return {
      response: data.response || 'I processed your request.',
      actionProposal: data.actionProposal,
      isDemoMode: Boolean(data.isDemoMode),
      model: data.model || 'gemini-3.8-flash',
    };
  } catch (error: unknown) {
    console.warn('Network request to /api/ai/chat failed, using client fallback:', error);

    // Client-side intelligent fallback so the chat NEVER breaks
    const q = message.toLowerCase();
    const { tasksList, todayDate, tasksSummary } = context;
    const pendingTasks = tasksList.filter(t => !t.completed);
    const urgentTasks = pendingTasks.filter(t => t.priority === 'urgent');
    const highTasks = pendingTasks.filter(t => t.priority === 'high');
    const overdueTasks = pendingTasks.filter(t => t.dueDate && t.dueDate < todayDate);
    const topTask = urgentTasks[0] || overdueTasks[0] || highTasks[0] || pendingTasks[0];

    if (q.includes('priorit') || q.includes('work on') || q.includes('first')) {
      return {
        response: topTask
          ? `Based on your real-time task data, you should focus on **"${topTask.title}"** first.\n\n• Priority: \`${topTask.priority.toUpperCase()}\`\n• Category: ${topTask.category}\n${topTask.dueDate ? `• Due Date: ${topTask.dueDate}\n` : ''}\nThis task will give you the highest leverage. Consider starting a 25-minute Pomodoro session to gain momentum.`
          : `All your tasks are completed! You can celebrate or plan tomorrow's goals.`,
        isDemoMode: true,
        model: 'local-productivity-coach',
      };
    }

    if (q.includes('plan') || q.includes('day') || q.includes('schedule')) {
      return {
        response: `Here is a daily schedule based on your ${pendingTasks.length} pending tasks:\n\n🌅 **Morning (09:00 - 11:00)**: Deep focus on *"${topTask?.title || 'your top task'}"*.\n☀️ **Midday (11:30 - 13:00)**: Handle active checklist items and communications.\n🌆 **Afternoon (14:00 - 16:30)**: Complete quick wins and review progress toward your daily goal of ${context.userGoal} tasks.`,
        isDemoMode: true,
        model: 'local-productivity-coach',
      };
    }

    if (q.includes('break') || q.includes('subtask') || q.includes('step')) {
      const target = topTask || pendingTasks[0];
      if (target) {
        const subtasks = [
          'Clarify acceptance criteria & objectives',
          'Draft initial implementation or outline',
          'Review edge cases and test thoroughly',
          'Final wrap-up and documentation',
        ];
        return {
          response: `I've broken down **"${target.title}"** into 4 actionable steps to reduce procrastination. Review the proposal below and click **"Confirm & Apply"** to add them to your task.`,
          actionProposal: {
            id: `prop-${Date.now()}`,
            type: 'add_subtasks',
            title: `Add 4 subtasks to "${target.title}"`,
            description: `Auto-generated subtasks for progressive execution`,
            status: 'pending',
            data: {
              taskId: target.id,
              taskTitle: target.title,
              subtasks,
            },
          },
          isDemoMode: true,
          model: 'local-productivity-coach',
        };
      }
    }

    if (q.includes('summar') || q.includes('status')) {
      return {
        response: `**Task Summary (${todayDate})**:\n• Total Tasks: ${tasksSummary.total}\n• Active Pending: ${tasksSummary.pending} (${urgentTasks.length} urgent, ${highTasks.length} high)\n• Completed: ${tasksSummary.completed} (${tasksSummary.completedToday} today)\n• Overdue: ${overdueTasks.length}`,
        isDemoMode: true,
        model: 'local-productivity-coach',
      };
    }

    return {
      response: `I am your TaskFlow AI Productivity Assistant. You currently have ${pendingTasks.length} active tasks in your workspace${topTask ? `, with **"${topTask.title}"** being your highest priority` : ''}. Ask me to plan your day, break down a task, or suggest which items to tackle first!`,
      isDemoMode: true,
      model: 'local-productivity-coach',
    };
  }
}
