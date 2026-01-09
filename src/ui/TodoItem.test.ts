/**
 * TodoItem - UI統合機能テスト
 * Phase 2+3の7機能統合テスト
 */

import { describe, it, expect, vi } from "vitest";
import { getPriorityBadgeStyle } from "../lib/priority";
import { getDueDateStyle } from "../lib/due";
import { getThresholdDateStyle } from "../lib/threshold";
import { extractInternalLinks } from "../lib/internallink";
import { extractExternalLinks } from "../lib/externallink";
import { toggleCompletion } from "../lib/todo";
import type { Todo } from "../lib/todo";

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

describe("TodoItem - Phase 3統合", () => {
  describe("PBI-013: threshold表示", () => {
    it("しきい値が未来のタスクがグレーアウト表示される", () => {
      const todo: Todo = {
        completed: false,
        description: "Future task",
        projects: [],
        contexts: [],
        tags: { t: "2025-12-31" },
        raw: "Future task t:2025-12-31",
      };
      const today = new Date("2024-12-31");
      const style = getThresholdDateStyle(todo, today);
      expect(style.opacity).toBe("0.5");
    });

    it("しきい値が本日のタスクが通常表示となる", () => {
      const todo: Todo = {
        completed: false,
        description: "Today task",
        projects: [],
        contexts: [],
        tags: { t: "2024-12-31" },
        raw: "Today task t:2024-12-31",
      };
      const today = new Date("2024-12-31");
      const style = getThresholdDateStyle(todo, today);
      expect(style.opacity).toBeUndefined();
    });

    it("しきい値が過去のタスクが通常表示となる", () => {
      const todo: Todo = {
        completed: false,
        description: "Past task",
        projects: [],
        contexts: [],
        tags: { t: "2024-01-01" },
        raw: "Past task t:2024-01-01",
      };
      const today = new Date("2024-12-31");
      const style = getThresholdDateStyle(todo, today);
      expect(style.opacity).toBeUndefined();
    });

    it("しきい値なしタスクが通常表示となる", () => {
      const todo: Todo = {
        completed: false,
        description: "No threshold task",
        projects: [],
        contexts: [],
        tags: {},
        raw: "No threshold task",
      };
      const today = new Date("2024-12-31");
      const style = getThresholdDateStyle(todo, today);
      expect(style.opacity).toBeUndefined();
    });
  });

  describe("PBI-014: 内部リンク", () => {
    it("[[Note]]形式の内部リンクが抽出される", () => {
      const description = "Task with [[MyNote]]";
      const links = extractInternalLinks(description);
      expect(links).toHaveLength(1);
      expect(links[0]?.link).toBe("MyNote");
    });

    it("[[Note|Alias]]形式のエイリアス付き内部リンクが抽出される", () => {
      const description = "Task with [[MyNote|My Alias]]";
      const links = extractInternalLinks(description);
      expect(links).toHaveLength(1);
      expect(links[0]?.link).toBe("MyNote");
      expect(links[0]?.alias).toBe("My Alias");
    });

    it("複数の内部リンクが抽出される", () => {
      const description = "Task with [[Note1]] and [[Note2]]";
      const links = extractInternalLinks(description);
      expect(links).toHaveLength(2);
    });
  });

  describe("PBI-015: 外部リンク", () => {
    it("[text](url)形式の外部リンクが抽出される", () => {
      const description = "Task with [GitHub](https://github.com)";
      const links = extractExternalLinks(description);
      expect(links).toHaveLength(1);
      expect(links[0]?.text).toBe("GitHub");
      expect(links[0]?.url).toBe("https://github.com");
    });

    it("複数の外部リンクが抽出される", () => {
      const description = "[Link1](https://example.com) and [Link2](https://test.com)";
      const links = extractExternalLinks(description);
      expect(links).toHaveLength(2);
    });

    it("様々なURLスキームが検出される", () => {
      const description = "[HTTPS](https://example.com) [HTTP](http://example.com) [FTP](ftp://example.com)";
      const links = extractExternalLinks(description);
      expect(links).toHaveLength(3);
    });
  });

  describe("PBI-016: rec:繰り返しタスク", () => {
    it("rec:タグ付きタスクの完了時に新タスクが生成される", () => {
      const todo: Todo = {
        completed: false,
        description: "Recurring task",
        projects: [],
        contexts: [],
        tags: { rec: "rec:1w", due: "2024-12-31" },
        raw: "Recurring task rec:1w due:2024-12-31",
      };
      const result = toggleCompletion(todo);
      expect(result.originalTask.completed).toBe(true);
      expect(result.recurringTask).toBeDefined();
      expect(result.recurringTask?.completed).toBe(false);
    });

    it("rec:タグなしタスクの完了時に新タスクが生成されない", () => {
      const todo: Todo = {
        completed: false,
        description: "Normal task",
        projects: [],
        contexts: [],
        tags: {},
        raw: "Normal task",
      };
      const result = toggleCompletion(todo);
      expect(result.originalTask.completed).toBe(true);
      expect(result.recurringTask).toBeUndefined();
    });
  });

  describe("PBI-017: pri:タグ", () => {
    it("(A)タスク完了時にpri:Aタグが追加される", () => {
      const todo: Todo = {
        completed: false,
        priority: "A",
        description: "High priority task",
        projects: [],
        contexts: [],
        tags: {},
        raw: "(A) High priority task",
      };
      const result = toggleCompletion(todo);
      expect(result.originalTask.completed).toBe(true);
      expect(result.originalTask.priority).toBeUndefined();
      expect(result.originalTask.tags.pri).toBe("A");
    });

    it("pri:Aタグ付き完了タスクを未完了にすると(A)が復元される", () => {
      const todo: Todo = {
        completed: true,
        completionDate: "2024-12-31",
        description: "Completed high priority task",
        projects: [],
        contexts: [],
        tags: { pri: "A" },
        raw: "x 2024-12-31 Completed high priority task pri:A",
      };
      const result = toggleCompletion(todo);
      expect(result.originalTask.completed).toBe(false);
      expect(result.originalTask.completionDate).toBeUndefined();
      expect(result.originalTask.priority).toBe("A");
      expect(result.originalTask.tags.pri).toBeUndefined();
    });

    it("優先度なしタスクを完了してもpri:タグが追加されない", () => {
      const todo: Todo = {
        completed: false,
        description: "Normal task",
        projects: [],
        contexts: [],
        tags: {},
        raw: "Normal task",
      };
      const result = toggleCompletion(todo);
      expect(result.originalTask.completed).toBe(true);
      expect(result.originalTask.tags.pri).toBeUndefined();
    });
  });
});
