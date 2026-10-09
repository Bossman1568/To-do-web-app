import { Task, Priority, TaskCategory } from '../types/task';

/**
 * Downloads a file to the client browser
 */
function downloadFile(content: string, fileName: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Export tasks as formatted JSON file
 */
export function exportTasksToJSON(tasks: Task[]): void {
  const jsonContent = JSON.stringify(tasks, null, 2);
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(jsonContent, `taskflow-backup-${dateStr}.json`, 'application/json');
}

/**
 * Export tasks as CSV file
 */
export function exportTasksToCSV(tasks: Task[]): void {
  const headers = [
    'ID',
    'Title',
    'Status',
    'Priority',
    'Category',
    'Tags',
    'Due Date',
    'Due Time',
    'Starred',
    'Pinned',
    'Created At',
    'Completed At',
    'Subtasks',
    'Description',
  ];

  const escapeCSV = (val: string | undefined | null): string => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = tasks.map(t => {
    const subtaskSummary = (t.subtasks || [])
      .map(s => `[${s.completed ? 'x' : ' '}] ${s.title}`)
      .join('; ');

    return [
      escapeCSV(t.id),
      escapeCSV(t.title),
      escapeCSV(t.completed ? 'Completed' : 'Pending'),
      escapeCSV(t.priority),
      escapeCSV(t.category),
      escapeCSV((t.tags || []).join(', ')),
      escapeCSV(t.dueDate || ''),
      escapeCSV(t.dueTime || ''),
      escapeCSV(t.starred ? 'Yes' : 'No'),
      escapeCSV(t.pinned ? 'Yes' : 'No'),
      escapeCSV(t.createdAt),
      escapeCSV(t.completedAt || ''),
      escapeCSV(subtaskSummary),
      escapeCSV(t.description || ''),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(csvContent, `taskflow-tasks-${dateStr}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Validates and imports tasks from JSON string
 */
export function parseAndValidateTaskJSON(
  jsonText: string
): { success: boolean; tasks?: Task[]; error?: string } {
  try {
    const parsed = JSON.parse(jsonText);
    if (!Array.isArray(parsed)) {
      return { success: false, error: 'Invalid format: JSON file must contain an array of tasks.' };
    }

    if (parsed.length === 0) {
      return { success: false, error: 'The uploaded file contains an empty task array.' };
    }

    const validPriorities: Priority[] = ['low', 'medium', 'high', 'urgent'];
    const validCategories: TaskCategory[] = ['Work', 'Personal', 'Study', 'Health', 'Finance', 'General'];

    const validatedTasks: Task[] = [];

    for (let i = 0; i < parsed.length; i++) {
      const item = parsed[i];
      if (!item || typeof item !== 'object') {
        return { success: false, error: `Invalid task entry at item index ${i + 1}.` };
      }

      if (!item.title || typeof item.title !== 'string') {
        return { success: false, error: `Item index ${i + 1} is missing a required title string.` };
      }

      const priority: Priority = validPriorities.includes(item.priority) ? item.priority : 'medium';
      const category: TaskCategory = validCategories.includes(item.category) ? item.category : 'General';

      validatedTasks.push({
        id: item.id && typeof item.id === 'string' ? item.id : `task-${Date.now()}-${i}`,
        title: item.title.trim(),
        description: item.description && typeof item.description === 'string' ? item.description : undefined,
        completed: Boolean(item.completed),
        priority,
        category,
        tags: Array.isArray(item.tags) ? item.tags.filter((t: unknown) => typeof t === 'string') : undefined,
        dueDate: item.dueDate && typeof item.dueDate === 'string' ? item.dueDate : undefined,
        dueTime: item.dueTime && typeof item.dueTime === 'string' ? item.dueTime : undefined,
        starred: Boolean(item.starred),
        pinned: Boolean(item.pinned),
        subtasks: Array.isArray(item.subtasks)
          ? item.subtasks.map((s: { id?: string; title?: string; completed?: boolean }, sIdx: number) => ({
              id: s.id || `sub-${i}-${sIdx}`,
              title: String(s.title || 'Subtask'),
              completed: Boolean(s.completed),
            }))
          : undefined,
        createdAt: item.createdAt || new Date().toISOString(),
        completedAt: item.completedAt || undefined,
      });
    }

    return { success: true, tasks: validatedTasks };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown JSON parse error';
    return { success: false, error: `JSON parsing failed: ${msg}` };
  }
}
