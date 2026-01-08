/**
 * Recurrence feature tests
 * rec: tag parsing and recurring task generation
 */

import { describe, it, expect } from 'vitest';
import { parseRecurrenceTag, calculateNextDueDate, preserveThresholdInterval, type RecurrencePattern } from './recurrence';

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
