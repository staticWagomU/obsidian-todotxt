/**
 * TodoItem - UI統合機能テスト
 * Phase 2+3の7機能統合テスト
 */

import { describe, it, expect } from "vitest";
import { getPriorityBadgeStyle } from "../lib/priority";
import { getDueDateStyle } from "../lib/due";

describe("TodoItem - Phase 2統合", () => {
  describe("PBI-008: 優先度バッジ", () => {
    it("優先度(A)が赤色バッジで表示される", () => {
      const style = getPriorityBadgeStyle("A");
      expect(style.backgroundColor).toBe("#ff4444");
      expect(style.display).toBe("inline-block");
    });

    it("優先度(B)が橙色バッジで表示される", () => {
      const style = getPriorityBadgeStyle("B");
      expect(style.backgroundColor).toBe("#ff9944");
      expect(style.display).toBe("inline-block");
    });

    it("優先度(C)が黄色バッジで表示される", () => {
      const style = getPriorityBadgeStyle("C");
      expect(style.backgroundColor).toBe("#ffdd44");
      expect(style.display).toBe("inline-block");
    });

    it("優先度なしタスクはバッジ非表示となる", () => {
      const style = getPriorityBadgeStyle(undefined);
      expect(style.display).toBe("none");
    });
  });

  describe("PBI-012: due表示", () => {
    it("期限切れ(過去)のタスクが赤色で表示される", () => {
      const pastDate = new Date("2024-01-01");
      const today = new Date("2024-12-31");
      const style = getDueDateStyle(pastDate, today);
      expect(style.color).toBe("#ff4444");
    });

    it("本日期限のタスクがオレンジ色で表示される", () => {
      const today = new Date("2024-12-31");
      const style = getDueDateStyle(today, today);
      expect(style.color).toBe("#ff9944");
    });

    it("未来期限のタスクが通常表示となる", () => {
      const futureDate = new Date("2025-12-31");
      const today = new Date("2024-12-31");
      const style = getDueDateStyle(futureDate, today);
      expect(style.color).toBeUndefined();
    });
  });
});
