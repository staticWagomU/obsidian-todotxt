/**
 * Recurrence feature implementation
 * rec: tag parsing and recurring task generation
 */

import type { Todo } from './todo';

/**
 * Recurrence pattern format: rec:[+]<value><unit>
 * - Group 1: '+' prefix for strict mode (optional)
 * - Group 2: numeric value (1, 2, 3, ...)
 * - Group 3: unit (d=days, w=weeks, m=months, y=years)
 * Example: rec:1d, rec:+1w, rec:3m, rec:1y
 */
const RECURRENCE_PATTERN = /^(\+?)(\d+)([dwmy])$/;

export interface RecurrencePattern {
  value: number;      // 数値 (1, 2, 3, ...)
  unit: 'd' | 'w' | 'm' | 'y';  // 期間単位
  strict: boolean;    // +の有無
}

/**
 * Parse rec: tag format
 * Supports: rec:1d, rec:+1w, rec:3m, rec:1y
 * Returns null for invalid formats
 */
export function parseRecurrenceTag(recTag: string): RecurrencePattern | null {
  if (!recTag || !recTag.startsWith('rec:')) {
    return null;
  }

  const value = recTag.substring(4); // Remove 'rec:' prefix
  const match = value.match(RECURRENCE_PATTERN);

  if (!match) {
    return null;
  }

  const [, strictPrefix, num, unit] = match;

  return {
    value: Number.parseInt(num!, 10),
    unit: unit as 'd' | 'w' | 'm' | 'y',
    strict: strictPrefix === '+',
  };
}

/**
 * Calculate next due date based on recurrence pattern
 * Non-strict mode: based on completion date (baseDate)
 * Strict mode: based on current due date (currentDueDate)
 * Returns YYYY-MM-DD format
 */
export function calculateNextDueDate(
  pattern: RecurrencePattern,
  baseDate: string,
  currentDueDate?: string
): string {
  // Determine which date to use as base
  const referenceDate = pattern.strict && currentDueDate ? currentDueDate : baseDate;
  const base = new Date(referenceDate);
  const originalDay = base.getDate();

  let nextDate: Date;

  switch (pattern.unit) {
    case 'd':
      nextDate = new Date(base);
      nextDate.setDate(base.getDate() + pattern.value);
      break;
    case 'w':
      nextDate = new Date(base);
      nextDate.setDate(base.getDate() + pattern.value * 7);
      break;
    case 'm':
      nextDate = new Date(base);
      nextDate.setMonth(base.getMonth() + pattern.value);
      // Handle month-end overflow (e.g., Jan 31 + 1 month should be Feb 28, not Mar 3)
      if (nextDate.getDate() !== originalDay) {
        nextDate.setDate(0); // Set to last day of previous month
      }
      break;
    case 'y':
      nextDate = new Date(base);
      nextDate.setFullYear(base.getFullYear() + pattern.value);
      // Handle leap year overflow (e.g., Feb 29, 2024 + 1 year should be Feb 28, 2025)
      if (nextDate.getDate() !== originalDay) {
        nextDate.setDate(0); // Set to last day of previous month
      }
      break;
    default:
      nextDate = base;
  }

  return nextDate.toISOString().split('T')[0]!;
}

/**
 * Calculate new threshold date preserving the interval between original threshold and due date
 * Interval = originalDueDate - originalThreshold (in days)
 * Returns: newDueDate - interval (in YYYY-MM-DD format)
 */
export function preserveThresholdInterval(
  originalThreshold: string,
  originalDueDate: string,
  newDueDate: string
): string {
  const threshold = new Date(originalThreshold);
  const due = new Date(originalDueDate);
  const newDue = new Date(newDueDate);

  // Calculate interval in milliseconds
  const intervalMs = due.getTime() - threshold.getTime();

  // Calculate new threshold
  const newThreshold = new Date(newDue.getTime() - intervalMs);

  return newThreshold.toISOString().split('T')[0]!;
}

/**
 * Create a recurring task from a completed task
 * Updates due:/t: dates, resets completion status, sets creationDate to today
 * Removes pri: tag and priority field
 * Returns null if rec: tag is not present
 */
export function createRecurringTask(
  completedTask: Todo,
  completionDate: string
): Todo | null {
  // Check for rec: tag
  const recTag = completedTask.tags.rec;
  if (!recTag) {
    return null;
  }

  // Parse recurrence pattern
  const pattern = parseRecurrenceTag(recTag);
  if (!pattern) {
    return null;
  }

  // Extract current due date from tags (remove prefix if present)
  const currentDueTag = completedTask.tags.due;
  const currentDueDate = currentDueTag?.replace(/^due:/, '');

  // Calculate next due date
  const nextDueDate = calculateNextDueDate(pattern, completionDate, currentDueDate);

  // Clone task
  const newTask: Todo = {
    ...completedTask,
    completed: false,
    completionDate: undefined,
    creationDate: completionDate,
    priority: undefined, // Remove priority
    tags: { ...completedTask.tags },
  };

  // Update due: tag
  newTask.tags.due = `due:${nextDueDate}`;

  // Update threshold if present
  const currentThresholdTag = completedTask.tags.t;
  if (currentThresholdTag && currentDueDate) {
    const currentThreshold = currentThresholdTag.replace(/^t:/, '');
    const newThreshold = preserveThresholdInterval(currentThreshold, currentDueDate, nextDueDate);
    newTask.tags.t = `t:${newThreshold}`;
  }

  // Remove pri: tag
  delete newTask.tags.pri;

  return newTask;
}
