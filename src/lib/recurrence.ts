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

/**
 * Recurrence pattern representation
 * This structure maintains a balance between type safety and usability.
 * Alternative discriminated union ({ days: number } | { weeks: number } | ...)
 * was considered but rejected due to:
 * - Complexity in parsing logic
 * - Difficulty in testing (requires more verbose test fixtures)
 * - Loss of strict flag integration
 * Current design provides sufficient type safety with literal union type for 'unit'
 */
export interface RecurrencePattern {
  value: number;      // 数値 (1, 2, 3, ...)
  unit: 'd' | 'w' | 'm' | 'y';  // 期間単位 (d=days, w=weeks, m=months, y=years)
  strict: boolean;    // +の有無 (strict mode: based on due date)
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
 * Adjust date to month-end if overflow occurred
 * Handles month-end and leap year edge cases
 * Example: Jan 31 + 1 month -> Feb 28, Feb 29 (leap) + 1 year -> Feb 28 (non-leap)
 */
function adjustToMonthEnd(date: Date, originalDay: number): void {
  if (date.getDate() !== originalDay) {
    date.setDate(0); // Set to last day of previous month
  }
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
      adjustToMonthEnd(nextDate, originalDay);
      break;
    case 'y':
      nextDate = new Date(base);
      nextDate.setFullYear(base.getFullYear() + pattern.value);
      adjustToMonthEnd(nextDate, originalDay);
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

  // Clone task (follows same pattern as toggleCompletion in todo.ts)
  // Shallow clone with spread operator, override specific fields
  const newTask: Todo = {
    ...completedTask,
    completed: false,
    completionDate: undefined,
    creationDate: completionDate,
    priority: undefined, // Remove priority (will be restored if user uncompletes)
    tags: { ...completedTask.tags }, // Shallow clone tags for safe mutation
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
