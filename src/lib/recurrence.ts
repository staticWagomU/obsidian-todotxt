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
