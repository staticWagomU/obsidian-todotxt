/**
 * Recurrence feature tests
 * rec: tag parsing and recurring task generation
 */

import { describe, it, expect } from 'vitest';
import { parseRecurrenceTag, calculateNextDueDate, type RecurrencePattern } from './recurrence';

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
