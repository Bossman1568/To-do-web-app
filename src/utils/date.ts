/**
 * Format ISO date string into readable text (e.g. "Today at 2:30 PM", "Yesterday", "Oct 8, 2026")
 */
export function formatCreationDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Recently';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24 && date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (diffDays === 1) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return 'Recently';
  }
}

/**
 * Format due date and optional due time (YYYY-MM-DD, HH:mm) into readable text with status
 */
export function formatDueDate(
  dateString?: string,
  timeString?: string
): { text: string; isOverdue: boolean; isToday: boolean } {
  if (!dateString) return { text: '', isOverdue: false, isToday: false };

  try {
    const parts = dateString.split('-');
    if (parts.length !== 3) return { text: dateString, isOverdue: false, isToday: false };

    const dueYear = parseInt(parts[0], 10);
    const dueMonth = parseInt(parts[1], 10) - 1;
    const dueDay = parseInt(parts[2], 10);

    let dueHour = 23;
    let dueMinute = 59;
    let formattedTime = '';

    if (timeString && timeString.includes(':')) {
      const [h, m] = timeString.split(':');
      dueHour = parseInt(h, 10);
      dueMinute = parseInt(m, 10);
      const timeObj = new Date();
      timeObj.setHours(dueHour, dueMinute);
      formattedTime = ` at ${timeObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    }

    const targetDueDate = new Date(dueYear, dueMonth, dueDay, dueHour, dueMinute);
    const now = new Date();

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const dueDayDate = new Date(dueYear, dueMonth, dueDay, 0, 0, 0);

    const diffDays = Math.round((dueDayDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
    const isToday = diffDays === 0;
    const isOverdue = targetDueDate.getTime() < now.getTime();

    let text = '';
    if (isToday) {
      text = `Due today${formattedTime}`;
    } else if (diffDays === 1) {
      text = `Due tomorrow${formattedTime}`;
    } else if (diffDays === -1) {
      text = `Overdue by 1 day${formattedTime}`;
    } else if (diffDays < -1) {
      text = `Overdue by ${Math.abs(diffDays)} days`;
    } else {
      text = `Due ${dueDayDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}${formattedTime}`;
    }

    return { text, isOverdue, isToday };
  } catch {
    return { text: dateString, isOverdue: false, isToday: false };
  }
}

/**
 * Checks if a YYYY-MM-DD matches today
 */
export function isTodayDateString(dateString?: string): boolean {
  if (!dateString) return false;
  const todayStr = getTodayDateString();
  return dateString === todayStr;
}

/**
 * Returns today's date formatted as YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Checks if a task is overdue (pending and due date < today or time < now)
 */
export function isTaskOverdue(dueDate?: string, dueTime?: string): boolean {
  if (!dueDate) return false;
  const { isOverdue } = formatDueDate(dueDate, dueTime);
  return isOverdue;
}

/**
 * Generates days for calendar month
 */
export function getMonthCalendarDays(year: number, month: number) {
  // First day of month
  const firstDay = new Date(year, month, 1);
  const startingDayOfWeek = firstDay.getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: {
    dateString: string;
    dayNumber: number;
    isCurrentMonth: boolean;
    isToday: boolean;
  }[] = [];

  const todayStr = getTodayDateString();

  // Days from previous month for padding
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const prevDate = new Date(year, month - 1, prevMonthDays - i);
    const dStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(prevDate.getDate()).padStart(2, '0')}`;
    days.push({
      dateString: dStr,
      dayNumber: prevMonthDays - i,
      isCurrentMonth: false,
      isToday: dStr === todayStr,
    });
  }

  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({
      dateString: dStr,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: dStr === todayStr,
    });
  }

  // Padding days for next month to complete standard grid (up to multiple of 7)
  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    for (let n = 1; n <= remaining; n++) {
      const nextDate = new Date(year, month + 1, n);
      const dStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;
      days.push({
        dateString: dStr,
        dayNumber: n,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
      });
    }
  }

  return days;
}
