import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { AIProductivityContext, TaskActionProposal } from './src/types/ai.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '5mb' }));

// Initialize GoogleGenAI client if API key is present
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Local smart productivity reasoning engine for fallback / demo mode
function generateLocalProductivityResponse(
  userMessage: string,
  context: AIProductivityContext
): { text: string; actionProposal?: TaskActionProposal } {
  const q = userMessage.toLowerCase();
  const { tasksSummary, tasksList, todayDate, userGoal } = context;

  const pendingTasks = tasksList.filter(t => !t.completed);
  const overdueTasks = pendingTasks.filter(t => t.dueDate && t.dueDate < todayDate);
  const todayTasks = pendingTasks.filter(t => t.dueDate === todayDate);
  const urgentTasks = pendingTasks.filter(t => t.priority === 'urgent');
  const highTasks = pendingTasks.filter(t => t.priority === 'high');

  // 1. "Summarize my pending tasks" or "Summary"
  if (q.includes('summar') || q.includes('overview') || q.includes('status')) {
    let summaryText = `Here is your current task summary for today (${todayDate}):\n\n`;
    summaryText += `• **Total Tasks**: ${tasksSummary.total}\n`;
    summaryText += `• **Pending Tasks**: ${tasksSummary.pending} (${urgentTasks.length} urgent, ${highTasks.length} high priority)\n`;
    summaryText += `• **Completed**: ${tasksSummary.completed} (${tasksSummary.completedToday} completed today, goal: ${userGoal})\n`;
    summaryText += `• **Overdue**: ${overdueTasks.length}\n`;
    summaryText += `• **Due Today**: ${todayTasks.length}\n\n`;

    if (overdueTasks.length > 0) {
      summaryText += `⚠️ **Attention Needed**: You have ${overdueTasks.length} overdue task(s):\n`;
      overdueTasks.slice(0, 3).forEach(t => {
        summaryText += `- *${t.title}* (was due on ${t.dueDate})\n`;
      });
      summaryText += `\nI recommend tackling these first or rescheduling realistic deadlines.`;
    } else {
      summaryText += `✨ Great job! You have zero overdue tasks. Everything is currently on schedule.`;
    }

    return { text: summaryText };
  }

  // 2. "Which tasks should I prioritize?" or "Prioritize"
  if (q.includes('prioriti') || q.includes('what should i work on') || q.includes('first')) {
    let text = `Based on your actual workspace, here is the recommended order of priority using the Eisenhower Matrix:\n\n`;

    const topUrgent = urgentTasks[0] || overdueTasks[0] || highTasks[0] || pendingTasks[0];

    if (topUrgent) {
      text += `1. **Immediate Focus (Eat the Frog)**:\n`;
      text += `   • **"${topUrgent.title}"**\n`;
      text += `   • Priority: \`${topUrgent.priority.toUpperCase()}\` · Category: ${topUrgent.category}\n`;
      if (topUrgent.dueDate) text += `   • Due: ${topUrgent.dueDate}${topUrgent.dueTime ? ' at ' + topUrgent.dueTime : ''}\n`;
      text += `   *Why*: It has the highest urgency impact and will clear maximum mental bandwidth.\n\n`;
    }

    if (todayTasks.length > 0) {
      text += `2. **Scheduled for Today**:\n`;
      todayTasks.forEach(t => {
        text += `   • *${t.title}* (${t.priority} priority)\n`;
      });
      text += `\n`;
    }

    text += `💡 **Recommendation**: Try doing a 25-minute Pomodoro session on "${topUrgent?.title || 'your top task'}". Would you like me to suggest subtasks for this?`;

    return { text };
  }

  // 3. "Help me plan my day" or "Daily plan"
  if (q.includes('plan my day') || q.includes('daily plan') || q.includes('schedule')) {
    let plan = `Here is a structured, balanced daily plan tailored to your ${pendingTasks.length} pending tasks:\n\n`;

    plan += `🌅 **Morning Block (Deep Focus · High Energy)**\n`;
    const deepFocusTask = urgentTasks[0] || highTasks[0] || pendingTasks[0];
    if (deepFocusTask) {
      plan += `• **09:00 - 10:30**: Work on *"${deepFocusTask.title}"* (2x 25-min Pomodoros + 5-min break).\n`;
    }
    plan += `• **10:30 - 10:45**: Stand up, stretch, hydrate.\n\n`;

    plan += `☀️ **Midday Block (Core Execution)**\n`;
    const middayTask = todayTasks[0] || pendingTasks[1] || deepFocusTask;
    if (middayTask && middayTask !== deepFocusTask) {
      plan += `• **11:00 - 12:30**: Progress on *"${middayTask.title}"*.\n`;
    } else {
      plan += `• **11:00 - 12:30**: Complete scheduled checklist items and daily admin.\n`;
    }
    plan += `• **12:30 - 13:30**: Lunch & restful break.\n\n`;

    plan += `🌆 **Afternoon Block (Quick Wins & Review)**\n`;
    const lowOrMedTasks = pendingTasks.filter(t => t.priority === 'medium' || t.priority === 'low');
    if (lowOrMedTasks.length > 0) {
      plan += `• **14:00 - 15:30**: Quick wins: *${lowOrMedTasks[0].title}*.\n`;
    }
    plan += `• **16:30 - 17:00**: Daily review, log completions toward your goal of ${userGoal} tasks.\n\n`;
    plan += `Would you like me to propose a new task or time-block for any specific goal?`;

    return { text: plan };
  }

  // 4. "Break a large task into smaller steps" or "Break down" / "Subtasks"
  if (q.includes('break') || q.includes('subtask') || q.includes('steps')) {
    const targetTask = urgentTasks[0] || highTasks[0] || pendingTasks[0];

    if (!targetTask) {
      return {
        text: `You don't have any pending tasks right now! Would you like me to help create a new project task first?`,
      };
    }

    const proposedSubtasks = [
      `Define project requirements & acceptance criteria`,
      `Outline initial drafts and key technical components`,
      `Review edge cases and test thoroughly`,
      `Final polish and share with stakeholders`,
    ];

    const proposal: TaskActionProposal = {
      id: `prop-${Date.now()}`,
      type: 'add_subtasks',
      title: `Add 4 subtasks to "${targetTask.title}"`,
      description: `Break down "${targetTask.title}" into clear, progressive execution steps.`,
      status: 'pending',
      data: {
        taskId: targetTask.id,
        taskTitle: targetTask.title,
        subtasks: proposedSubtasks,
      },
    };

    return {
      text: `I've analyzed your task **"${targetTask.title}"** (${targetTask.priority} priority). Breaking complex tasks into smaller chunks reduces cognitive friction and procrastination.\n\nHere is a suggested breakdown:\n1. ${proposedSubtasks[0]}\n2. ${proposedSubtasks[1]}\n3. ${proposedSubtasks[2]}\n4. ${proposedSubtasks[3]}\n\nI have created a preview below. Click **"Confirm & Apply"** to add these subtasks directly to your task.`,
      actionProposal: proposal,
    };
  }

  // 5. "Help me overcome procrastination"
  if (q.includes('procrastinat') || q.includes('overwhelm') || q.includes('stuck') || q.includes('lazy')) {
    const firstTask = urgentTasks[0] || highTasks[0] || pendingTasks[0];
    let advice = `Procrastination is rarely about laziness—it's usually emotional regulation reacting to feeling overwhelmed or uncertain.\n\n`;
    advice += `Here are 3 research-backed strategies you can apply right now:\n\n`;
    advice += `1. **The 2-Minute Rule**: Don't commit to finishing the task. Just commit to opening the file or writing the first sentence for 120 seconds.\n`;
    advice += `2. **Lower the Bar**: Turn *"${firstTask?.title || 'your task'}"* into an absurdly small micro-step (e.g., "Draft bullet points for 5 minutes").\n`;
    advice += `3. **Use the Built-in Pomodoro Timer**: Switch to the **Pomodoro** tab in the top header and start a single 25-minute focus burst.\n\n`;
    advice += `Would you like me to help break down *"${firstTask?.title || 'your top task'}"* into manageable micro-steps?`;

    return { text: advice };
  }

  // 6. Generic or custom question
  const topTask = urgentTasks[0] || highTasks[0] || pendingTasks[0];
  let reply = `I'm your **TaskFlow AI Productivity Assistant**. I have real-time visibility into your workspace (${pendingTasks.length} active tasks, ${tasksSummary.completedToday} completed today).\n\n`;

  if (topTask) {
    reply += `Your current highest priority is **"${topTask.title}"** (${topTask.priority} priority, category: ${topTask.category}).\n\n`;
  }

  reply += `Here are a few things I can assist you with:\n`;
  reply += `• Ask **"Help me plan my day"** for a tailored schedule.\n`;
  reply += `• Ask **"Which tasks should I prioritize?"** for deadline guidance.\n`;
  reply += `• Ask **"Break down my top task"** to automatically generate actionable subtasks.\n`;
  reply += `• Ask about productivity frameworks (Eisenhower Matrix, Pomodoro, Time-blocking).\n\n`;
  reply += `How would you like to proceed?`;

  return { text: reply };
}

// POST /api/ai/chat
app.post('/api/ai/chat', async (req: Request, res: Response): Promise<void> => {
  const { message, history, context } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  // If Gemini API client is available and API key is set, try calling Gemini 3.8 Flash
  if (aiClient && process.env.GEMINI_API_KEY) {
    try {
      const systemInstruction = `You are TaskFlow AI, an elite productivity coach and task assistant integrated into the user's personal task management app.
The user has provided their real-time task data in the context:
Current Date: ${context?.todayDate || new Date().toISOString().split('T')[0]}
Tasks Summary: ${JSON.stringify(context?.tasksSummary || {})}
Tasks List: ${JSON.stringify((context?.tasksList || []).slice(0, 30))}
Daily Goal: ${context?.userGoal || 5}

Guidelines:
1. Always reference the user's REAL tasks and deadlines accurately. Never invent fictitious tasks or fake dates.
2. Be concise, actionable, and encouraging without being robotic or overly motivational.
3. Apply productivity frameworks (Eisenhower Matrix, Pomodoro Technique, 2-minute rule, Eat the Frog) where appropriate.
4. If the user asks to create a task, break down a task, or update priority/deadline, provide helpful text AND include a JSON action proposal in a code block starting with \`\`\`json_action and ending with \`\`\`:
{
  "type": "create_task" | "add_subtasks" | "update_priority" | "update_due_date",
  "title": "Short title of proposal",
  "description": "Short explanation",
  "data": { ... }
}
5. The user must confirm any proposed action before it is executed; never pretend an action was executed already.`;

      // Build conversation messages for Gemini
      const contents = [];
      if (Array.isArray(history)) {
        for (const h of history.slice(-6)) {
          contents.push({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content }],
          });
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API call timed out')), 4000)
      );

      const response = await Promise.race([
        aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        }),
        timeoutPromise,
      ]);

      const rawText = response.text || '';

      // Check if response contains a json_action code block
      let actionProposal: TaskActionProposal | undefined = undefined;
      const actionMatch = rawText.match(/```json_action\s*([\s\S]*?)\s*```/);
      let cleanText = rawText;

      if (actionMatch) {
        try {
          const parsed = JSON.parse(actionMatch[1]);
          actionProposal = {
            id: `prop-${Date.now()}`,
            type: parsed.type,
            title: parsed.title,
            description: parsed.description,
            status: 'pending',
            data: parsed.data || {},
          };
          cleanText = rawText.replace(/```json_action[\s\S]*?```/, '').trim();
        } catch {
          // ignore parse errors
        }
      }

      res.json({
        response: cleanText,
        actionProposal,
        isDemoMode: false,
        model: 'gemini-3.8-flash',
      });
      return;
    } catch (err: unknown) {
      console.warn('Gemini API call failed, falling back to local productivity engine:', err);
      // Fall through to local engine
    }
  }

  // Fallback to local intelligent productivity engine
  const localRes = generateLocalProductivityResponse(message, context || {
    tasksSummary: { total: 0, pending: 0, completed: 0, overdue: 0, dueToday: 0, highPriorityPending: 0, completedToday: 0 },
    tasksList: [],
    todayDate: new Date().toISOString().split('T')[0],
    userGoal: 5,
  });

  res.json({
    response: localRes.text,
    actionProposal: localRes.actionProposal,
    isDemoMode: true,
    model: 'local-productivity-coach',
  });
});

async function start() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TaskFlow Server running at http://localhost:${PORT}`);
  });
}

start();
