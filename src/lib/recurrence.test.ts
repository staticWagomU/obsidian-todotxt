/**
 * Recurrence feature tests
 * rec: tag parsing and recurring task generation
 */

import { describe, it, expect } from 'vitest';
import { parseRecurrenceTag } from './recurrence';

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
