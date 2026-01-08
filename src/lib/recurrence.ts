/**
 * Recurrence feature implementation
 * rec: tag parsing and recurring task generation
 */

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
  const match = value.match(/^(\+?)(\d+)([dwmy])$/);

  if (!match) {
    return null;
  }

  const [, strictPrefix, num, unit] = match;

  return {
    value: Number.parseInt(num, 10),
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

  return nextDate.toISOString().split('T')[0];
}
