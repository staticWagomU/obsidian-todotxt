/**
 * Recurrence feature tests
 * rec: tag parsing and recurring task generation
 */

import { describe, it, expect } from 'vitest';
import { parseRecurrenceTag, calculateNextDueDate, preserveThresholdInterval, createRecurringTask, type RecurrencePattern } from './recurrence';
import type { Todo } from './todo';

describe('parseRecurrenceTag', () => {
  it('rec:1d形式をパース: 1日non-strictモード', () => {
    const result = parseRecurrenceTag('rec:1d');
    expect(result).toEqual({ value: 1, unit: 'd', strict: false });
  });

  it('rec:+1w形式をパース: 1週間strictモード', () => {
    const result = parseRecurrenceTag('rec:+1w');
    expect(result).toEqual({ value: 1, unit: 'w', strict: true });
  });

  it('rec:3m形式をパース: 3ヶ月non-strictモード', () => {
    const result = parseRecurrenceTag('rec:3m');
    expect(result).toEqual({ value: 3, unit: 'm', strict: false });
  });

  it('rec:1y形式をパース: 1年non-strictモード', () => {
    const result = parseRecurrenceTag('rec:1y');
    expect(result).toEqual({ value: 1, unit: 'y', strict: false });
  });

  it('rec:+5d形式をパース: 5日strictモード', () => {
    const result = parseRecurrenceTag('rec:+5d');
    expect(result).toEqual({ value: 5, unit: 'd', strict: true });
  });

  it('不正な形式: 数値なし → null', () => {
    const result = parseRecurrenceTag('rec:d');
    expect(result).toBeNull();
  });

  it('不正な形式: 単位なし → null', () => {
    const result = parseRecurrenceTag('rec:5');
    expect(result).toBeNull();
  });

  it('不正な形式: 不正な単位(x) → null', () => {
    const result = parseRecurrenceTag('rec:1x');
    expect(result).toBeNull();
  });

  it('不正な形式: 空文字列 → null', () => {
    const result = parseRecurrenceTag('rec:');
    expect(result).toBeNull();
  });
});

describe('calculateNextDueDate (non-strict)', () => {
  it('1日後: baseDate + 1日', () => {
    const baseDate = '2026-01-09';
    const pattern: RecurrencePattern = { value: 1, unit: 'd', strict: false };
    const result = calculateNextDueDate(pattern, baseDate);
    expect(result).toBe('2026-01-10');
  });

  it('1週間後: baseDate + 7日', () => {
    const baseDate = '2026-01-09';
    const pattern: RecurrencePattern = { value: 1, unit: 'w', strict: false };
    const result = calculateNextDueDate(pattern, baseDate);
    expect(result).toBe('2026-01-16');
  });

  it('2週間後: baseDate + 14日', () => {
    const baseDate = '2026-01-09';
    const pattern: RecurrencePattern = { value: 2, unit: 'w', strict: false };
    const result = calculateNextDueDate(pattern, baseDate);
    expect(result).toBe('2026-01-23');
  });

  it('1ヶ月後: baseDate + 1ヶ月(月末自動補正)', () => {
    const baseDate = '2026-01-31';
    const pattern: RecurrencePattern = { value: 1, unit: 'm', strict: false };
    const result = calculateNextDueDate(pattern, baseDate);
    expect(result).toBe('2026-02-28'); // 2月は28日まで
  });

  it('3ヶ月後: baseDate + 3ヶ月', () => {
    const baseDate = '2026-01-15';
    const pattern: RecurrencePattern = { value: 3, unit: 'm', strict: false };
    const result = calculateNextDueDate(pattern, baseDate);
    expect(result).toBe('2026-04-15');
  });

  it('1年後: baseDate + 1年', () => {
    const baseDate = '2026-01-09';
    const pattern: RecurrencePattern = { value: 1, unit: 'y', strict: false };
    const result = calculateNextDueDate(pattern, baseDate);
    expect(result).toBe('2027-01-09');
  });

  it('閏年: 2月29日 + 1年 → 2月28日(自動補正)', () => {
    const baseDate = '2024-02-29'; // 閏年
    const pattern: RecurrencePattern = { value: 1, unit: 'y', strict: false };
    const result = calculateNextDueDate(pattern, baseDate);
    expect(result).toBe('2025-02-28'); // 平年に自動補正
  });
});

describe('calculateNextDueDate (strict)', () => {
  it('strict=true: currentDueDate基準で1日後', () => {
    const baseDate = '2026-01-09'; // 完了日
    const currentDueDate = '2026-01-05'; // 元のdue:
    const pattern: RecurrencePattern = { value: 1, unit: 'd', strict: true };
    const result = calculateNextDueDate(pattern, baseDate, currentDueDate);
    expect(result).toBe('2026-01-06'); // due: + 1日
  });

  it('strict=true: currentDueDate基準で1週間後', () => {
    const baseDate = '2026-01-10';
    const currentDueDate = '2026-01-05';
    const pattern: RecurrencePattern = { value: 1, unit: 'w', strict: true };
    const result = calculateNextDueDate(pattern, baseDate, currentDueDate);
    expect(result).toBe('2026-01-12'); // due: + 7日
  });

  it('strict=true: currentDueDate基準で1ヶ月後', () => {
    const baseDate = '2026-02-05';
    const currentDueDate = '2026-01-31';
    const pattern: RecurrencePattern = { value: 1, unit: 'm', strict: true };
    const result = calculateNextDueDate(pattern, baseDate, currentDueDate);
    expect(result).toBe('2026-02-28'); // due: + 1ヶ月(月末補正)
  });

  it('strict=true: currentDueDate基準で1年後', () => {
    const baseDate = '2027-02-28';
    const currentDueDate = '2024-02-29'; // 閏年
    const pattern: RecurrencePattern = { value: 1, unit: 'y', strict: true };
    const result = calculateNextDueDate(pattern, baseDate, currentDueDate);
    expect(result).toBe('2025-02-28'); // due: + 1年(閏年補正)
  });

  it('strict=false (non-strict再確認): baseDate基準', () => {
    const baseDate = '2026-01-15';
    const currentDueDate = '2026-01-10'; // 無視される
    const pattern: RecurrencePattern = { value: 1, unit: 'd', strict: false };
    const result = calculateNextDueDate(pattern, baseDate, currentDueDate);
    expect(result).toBe('2026-01-16'); // baseDate + 1日
  });
});

describe('preserveThresholdInterval', () => {
  it('7日間隔(t:1/1, due:1/8): 新due:1/15 → 新t:1/8', () => {
    const originalThreshold = '2026-01-01';
    const originalDueDate = '2026-01-08';
    const newDueDate = '2026-01-15';
    const result = preserveThresholdInterval(originalThreshold, originalDueDate, newDueDate);
    expect(result).toBe('2026-01-08'); // 7日前
  });

  it('3日間隔(t:1/5, due:1/8): 新due:1/15 → 新t:1/12', () => {
    const originalThreshold = '2026-01-05';
    const originalDueDate = '2026-01-08';
    const newDueDate = '2026-01-15';
    const result = preserveThresholdInterval(originalThreshold, originalDueDate, newDueDate);
    expect(result).toBe('2026-01-12'); // 3日前
  });

  it('0日間隔(t:1/10, due:1/10): 新due:1/20 → 新t:1/20', () => {
    const originalThreshold = '2026-01-10';
    const originalDueDate = '2026-01-10';
    const newDueDate = '2026-01-20';
    const result = preserveThresholdInterval(originalThreshold, originalDueDate, newDueDate);
    expect(result).toBe('2026-01-20'); // 0日前
  });

  it('月跨ぎ14日間隔(t:12/25, due:1/8): 新due:2/8 → 新t:1/25', () => {
    const originalThreshold = '2025-12-25';
    const originalDueDate = '2026-01-08';
    const newDueDate = '2026-02-08';
    const result = preserveThresholdInterval(originalThreshold, originalDueDate, newDueDate);
    expect(result).toBe('2026-01-25'); // 14日前
  });

  it('年跨ぎ10日間隔(t:12/25, due:1/4): 新due:2/4 → 新t:1/25', () => {
    const originalThreshold = '2025-12-25';
    const originalDueDate = '2026-01-04';
    const newDueDate = '2026-02-04';
    const result = preserveThresholdInterval(originalThreshold, originalDueDate, newDueDate);
    expect(result).toBe('2026-01-25'); // 10日前
  });
});

describe('createRecurringTask', () => {
  it('rec:1d, due:なし → 完了日+1日のdue:設定、completed=false、creationDate=今日', () => {
    const completedTodo: Todo = {
      completed: true,
      completionDate: '2026-01-09',
      creationDate: '2026-01-01',
      description: 'Daily task',
      projects: [],
      contexts: [],
      tags: { rec: 'rec:1d' },
      raw: 'x 2026-01-09 2026-01-01 Daily task rec:1d'
    };

    const result = createRecurringTask(completedTodo, '2026-01-09');

    expect(result.completed).toBe(false);
    expect(result.completionDate).toBeUndefined();
    expect(result.creationDate).toBe('2026-01-09');
    expect(result.tags.due).toBe('2026-01-10'); // 完了日 + 1日
    expect(result.description).toBe('Daily task');
    expect(result.tags.rec).toBe('rec:1d'); // rec:は保持
  });

  it('rec:+1w, due:1/5 → strictモードでdue:1/12、completed=false', () => {
    const completedTodo: Todo = {
      completed: true,
      completionDate: '2026-01-10',
      creationDate: '2026-01-01',
      description: 'Weekly task',
      projects: [],
      contexts: [],
      tags: { rec: 'rec:+1w', due: 'due:2026-01-05' },
      raw: 'x 2026-01-10 2026-01-01 Weekly task due:2026-01-05 rec:+1w'
    };

    const result = createRecurringTask(completedTodo, '2026-01-10');

    expect(result.completed).toBe(false);
    expect(result.tags.due).toBe('2026-01-12'); // due: + 1週間
    expect(result.tags.rec).toBe('rec:+1w');
  });

  it('rec:1m, due:1/31, t:1/24 → due:2/28, t:2/21(7日間隔保持)', () => {
    const completedTodo: Todo = {
      completed: true,
      completionDate: '2026-02-05',
      creationDate: '2026-01-01',
      description: 'Monthly task',
      projects: [],
      contexts: [],
      tags: { rec: 'rec:1m', due: 'due:2026-01-31', t: 't:2026-01-24' },
      raw: 'x 2026-02-05 2026-01-01 Monthly task due:2026-01-31 t:2026-01-24 rec:1m'
    };

    const result = createRecurringTask(completedTodo, '2026-02-05');

    expect(result.completed).toBe(false);
    expect(result.tags.due).toBe('2026-02-28'); // 月末補正
    expect(result.tags.t).toBe('2026-02-21'); // 7日間隔保持
  });

  it('pri:タグは削除される(新タスクは優先度なし)', () => {
    const completedTodo: Todo = {
      completed: true,
      priority: 'A',
      completionDate: '2026-01-09',
      creationDate: '2026-01-01',
      description: 'Task with priority',
      projects: [],
      contexts: [],
      tags: { rec: 'rec:1d', due: 'due:2026-01-09', pri: 'pri:A' },
      raw: '(A) x 2026-01-09 2026-01-01 Task with priority due:2026-01-09 rec:1d pri:A'
    };

    const result = createRecurringTask(completedTodo, '2026-01-09');

    expect(result.priority).toBeUndefined();
    expect(result.tags.pri).toBeUndefined();
  });

  it('rec:なし → nullを返す', () => {
    const completedTodo: Todo = {
      completed: true,
      completionDate: '2026-01-09',
      creationDate: '2026-01-01',
      description: 'Non-recurring task',
      projects: [],
      contexts: [],
      tags: {},
      raw: 'x 2026-01-09 2026-01-01 Non-recurring task'
    };

    const result = createRecurringTask(completedTodo, '2026-01-09');

    expect(result).toBeNull();
  });
});
