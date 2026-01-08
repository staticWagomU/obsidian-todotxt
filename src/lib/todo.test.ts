import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { toggleCompletion } from "./todo";
import type { Todo } from "./todo";

describe("toggle task completion status", () => {
	describe("未完了→完了へのトグル", () => {
		beforeEach(() => {
			// 2026-01-08でモック
			vi.useFakeTimers();
			vi.setSystemTime(new Date("2026-01-08"));
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it("completedがtrueになる", () => {
			const todo: Todo = {
				completed: false,
				description: "Buy milk",
				projects: [],
				contexts: [],
				tags: {},
				raw: "Buy milk",
			};

			const result = toggleCompletion(todo);

			expect(result.completed).toBe(true);
		});

		it("completionDateに今日の日付が設定される", () => {
			const todo: Todo = {
				completed: false,
				description: "Buy milk",
				projects: [],
				contexts: [],
				tags: {},
				raw: "Buy milk",
			};

			const result = toggleCompletion(todo);

			expect(result.completionDate).toBe("2026-01-08");
		});

		it("他のプロパティは保持される", () => {
			const todo: Todo = {
				completed: false,
				priority: "A",
				creationDate: "2026-01-01",
				description: "Buy milk +GroceryShopping @store",
				projects: ["GroceryShopping"],
				contexts: ["store"],
				tags: { due: "2026-01-10" },
				raw: "(A) 2026-01-01 Buy milk +GroceryShopping @store due:2026-01-10",
			};

			const result = toggleCompletion(todo);

			expect(result.priority).toBe("A");
			expect(result.creationDate).toBe("2026-01-01");
			expect(result.description).toBe("Buy milk +GroceryShopping @store");
			expect(result.projects).toEqual(["GroceryShopping"]);
			expect(result.contexts).toEqual(["store"]);
			expect(result.tags).toEqual({ due: "2026-01-10" });
		});
	});

	describe("完了→未完了へのトグル", () => {
		it("completedがfalseになる", () => {
			const todo: Todo = {
				completed: true,
				completionDate: "2026-01-08",
				description: "Buy milk",
				projects: [],
				contexts: [],
				tags: {},
				raw: "x 2026-01-08 Buy milk",
			};

			const result = toggleCompletion(todo);

			expect(result.completed).toBe(false);
		});

		it("completionDateが削除される", () => {
			const todo: Todo = {
				completed: true,
				completionDate: "2026-01-08",
				description: "Buy milk",
				projects: [],
				contexts: [],
				tags: {},
				raw: "x 2026-01-08 Buy milk",
			};

			const result = toggleCompletion(todo);

			expect(result.completionDate).toBeUndefined();
		});

		it("他のプロパティは保持される", () => {
			const todo: Todo = {
				completed: true,
				priority: "B",
				completionDate: "2026-01-08",
				creationDate: "2026-01-01",
				description: "Buy milk +GroceryShopping",
				projects: ["GroceryShopping"],
				contexts: [],
				tags: { pri: "A" },
				raw: "x (B) 2026-01-08 2026-01-01 Buy milk +GroceryShopping pri:A",
			};

			const result = toggleCompletion(todo);

			expect(result.priority).toBe("B");
			expect(result.creationDate).toBe("2026-01-01");
			expect(result.description).toBe("Buy milk +GroceryShopping");
			expect(result.projects).toEqual(["GroceryShopping"]);
			expect(result.tags).toEqual({ pri: "A" });
		});
	});
});
