import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { toggleCompletion, createTask, createAndAppendTask, editTask, editAndUpdateTask } from "./todo";
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

describe("create task with description only", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-08"));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("説明文のみで新規タスクを作成できる", () => {
		const result = createTask("Buy milk");

		expect(result.description).toBe("Buy milk");
		expect(result.completed).toBe(false);
		expect(result.projects).toEqual([]);
		expect(result.contexts).toEqual([]);
		expect(result.tags).toEqual({});
	});

	it("作成日付が自動的に今日の日付になる", () => {
		const result = createTask("Buy milk");

		expect(result.creationDate).toBe("2026-01-08");
	});
});

describe("create task with optional fields", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-08"));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("優先度を指定して作成できる", () => {
		const result = createTask("Buy milk", "A");

		expect(result.description).toBe("Buy milk");
		expect(result.priority).toBe("A");
		expect(result.creationDate).toBe("2026-01-08");
	});

	it("プロジェクトを指定して作成できる", () => {
		const result = createTask("Buy milk +GroceryShopping");

		expect(result.description).toBe("Buy milk +GroceryShopping");
		expect(result.projects).toEqual(["GroceryShopping"]);
		expect(result.creationDate).toBe("2026-01-08");
	});

	it("コンテキストを指定して作成できる", () => {
		const result = createTask("Buy milk @store");

		expect(result.description).toBe("Buy milk @store");
		expect(result.contexts).toEqual(["store"]);
		expect(result.creationDate).toBe("2026-01-08");
	});

	it("優先度・プロジェクト・コンテキストをすべて指定して作成できる", () => {
		const result = createTask("Buy milk +GroceryShopping @store", "B");

		expect(result.description).toBe("Buy milk +GroceryShopping @store");
		expect(result.priority).toBe("B");
		expect(result.projects).toEqual(["GroceryShopping"]);
		expect(result.contexts).toEqual(["store"]);
		expect(result.creationDate).toBe("2026-01-08");
	});
});

describe("create and append task", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-08"));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("空ファイルに説明文のみのタスクを追加", () => {
		const content = "";
		const result = createAndAppendTask(content, "Buy milk");

		expect(result).toBe("2026-01-08 Buy milk");
	});

	it("既存ファイルに説明文のみのタスクを追加", () => {
		const content = "(A) 2026-01-01 Call Mom";
		const result = createAndAppendTask(content, "Buy milk");

		expect(result).toBe("(A) 2026-01-01 Call Mom\n2026-01-08 Buy milk");
	});

	it("優先度付きタスクを追加", () => {
		const content = "(A) 2026-01-01 Call Mom";
		const result = createAndAppendTask(content, "Buy groceries", "B");

		expect(result).toBe("(A) 2026-01-01 Call Mom\n(B) 2026-01-08 Buy groceries");
	});

	it("プロジェクト付きタスクを追加", () => {
		const content = "";
		const result = createAndAppendTask(content, "Buy milk +GroceryShopping");

		expect(result).toBe("2026-01-08 Buy milk +GroceryShopping");
	});

	it("コンテキスト付きタスクを追加", () => {
		const content = "";
		const result = createAndAppendTask(content, "Call Mom @phone");

		expect(result).toBe("2026-01-08 Call Mom @phone");
	});

	it("優先度・プロジェクト・コンテキストをすべて含むタスクを追加", () => {
		const content = "(A) 2026-01-01 Call Mom";
		const result = createAndAppendTask(content, "Write report +Work @office", "C");

		expect(result).toBe("(A) 2026-01-01 Call Mom\n(C) 2026-01-08 Write report +Work @office");
	});
});

describe("edit task properties", () => {
	it("説明文のみを編集できる", () => {
		const todo: Todo = {
			completed: false,
			priority: "A",
			creationDate: "2026-01-01",
			description: "Buy milk",
			projects: [],
			contexts: [],
			tags: {},
			raw: "(A) 2026-01-01 Buy milk",
		};

		const result = editTask(todo, { description: "Buy bread" });

		expect(result.description).toBe("Buy bread");
		expect(result.priority).toBe("A");
		expect(result.creationDate).toBe("2026-01-01");
		expect(result.completed).toBe(false);
	});

	it("優先度のみを編集できる", () => {
		const todo: Todo = {
			completed: false,
			priority: "A",
			creationDate: "2026-01-01",
			description: "Buy milk",
			projects: [],
			contexts: [],
			tags: {},
			raw: "(A) 2026-01-01 Buy milk",
		};

		const result = editTask(todo, { priority: "B" });

		expect(result.priority).toBe("B");
		expect(result.description).toBe("Buy milk");
		expect(result.creationDate).toBe("2026-01-01");
	});

	it("完了状態を保持する", () => {
		const todo: Todo = {
			completed: true,
			completionDate: "2026-01-08",
			creationDate: "2026-01-01",
			description: "Buy milk",
			projects: [],
			contexts: [],
			tags: {},
			raw: "x 2026-01-08 2026-01-01 Buy milk",
		};

		const result = editTask(todo, { description: "Buy bread" });

		expect(result.completed).toBe(true);
		expect(result.completionDate).toBe("2026-01-08");
	});

	it("作成日を保持する", () => {
		const todo: Todo = {
			completed: false,
			creationDate: "2026-01-01",
			description: "Buy milk",
			projects: [],
			contexts: [],
			tags: {},
			raw: "2026-01-01 Buy milk",
		};

		const result = editTask(todo, { description: "Buy bread" });

		expect(result.creationDate).toBe("2026-01-01");
	});

	it("完了日を保持する", () => {
		const todo: Todo = {
			completed: true,
			completionDate: "2026-01-07",
			creationDate: "2026-01-01",
			description: "Buy milk",
			projects: [],
			contexts: [],
			tags: {},
			raw: "x 2026-01-07 2026-01-01 Buy milk",
		};

		const result = editTask(todo, { priority: "A" });

		expect(result.completionDate).toBe("2026-01-07");
		expect(result.completed).toBe(true);
	});

	it("空文字列やundefinedを処理できる", () => {
		const todo: Todo = {
			completed: false,
			priority: "A",
			creationDate: "2026-01-01",
			description: "Buy milk",
			projects: [],
			contexts: [],
			tags: {},
			raw: "(A) 2026-01-01 Buy milk",
		};

		const result = editTask(todo, { priority: undefined, description: "" });

		expect(result.priority).toBeUndefined();
		expect(result.description).toBe("");
	});
});

describe("edit task extracts projects and contexts", () => {
	it("新規プロジェクトを追加できる", () => {
		const todo: Todo = {
			completed: false,
			creationDate: "2026-01-01",
			description: "Buy milk",
			projects: [],
			contexts: [],
			tags: {},
			raw: "2026-01-01 Buy milk",
		};

		const result = editTask(todo, { description: "Buy milk +GroceryShopping" });

		expect(result.description).toBe("Buy milk +GroceryShopping");
		expect(result.projects).toEqual(["GroceryShopping"]);
	});

	it("既存プロジェクトを削除できる", () => {
		const todo: Todo = {
			completed: false,
			creationDate: "2026-01-01",
			description: "Buy milk +GroceryShopping",
			projects: ["GroceryShopping"],
			contexts: [],
			tags: {},
			raw: "2026-01-01 Buy milk +GroceryShopping",
		};

		const result = editTask(todo, { description: "Buy milk" });

		expect(result.description).toBe("Buy milk");
		expect(result.projects).toEqual([]);
	});

	it("新規コンテキストを追加できる", () => {
		const todo: Todo = {
			completed: false,
			creationDate: "2026-01-01",
			description: "Buy milk",
			projects: [],
			contexts: [],
			tags: {},
			raw: "2026-01-01 Buy milk",
		};

		const result = editTask(todo, { description: "Buy milk @store" });

		expect(result.description).toBe("Buy milk @store");
		expect(result.contexts).toEqual(["store"]);
	});

	it("既存コンテキストを削除できる", () => {
		const todo: Todo = {
			completed: false,
			creationDate: "2026-01-01",
			description: "Buy milk @store",
			projects: [],
			contexts: ["store"],
			tags: {},
			raw: "2026-01-01 Buy milk @store",
		};

		const result = editTask(todo, { description: "Buy milk" });

		expect(result.description).toBe("Buy milk");
		expect(result.contexts).toEqual([]);
	});
});

describe("edit and update task integration", () => {
	it("完全な編集フロー（説明+優先度）", () => {
		const content = "(A) 2026-01-01 Call Mom\n(B) 2026-01-02 Buy milk\n(C) 2026-01-03 Write report";

		const result = editAndUpdateTask(content, 1, {
			description: "Buy bread +GroceryShopping",
			priority: "A",
		});

		expect(result).toBe("(A) 2026-01-01 Call Mom\n(A) 2026-01-02 Buy bread +GroceryShopping\n(C) 2026-01-03 Write report");
	});

	it("メタデータ保持確認", () => {
		const content = "x (B) 2026-01-08 2026-01-01 Buy milk";

		const result = editAndUpdateTask(content, 0, {
			description: "Buy bread",
		});

		// 完了状態、完了日、作成日、優先度を保持
		expect(result).toBe("x (B) 2026-01-08 2026-01-01 Buy bread");
	});

	it("serializeTodo統合（形式正確性）", () => {
		const content = "(A) 2026-01-01 Call Mom";

		const result = editAndUpdateTask(content, 0, {
			description: "Call Mom +Family @phone",
		});

		// todo.txt形式に正しくシリアライズされる
		expect(result).toBe("(A) 2026-01-01 Call Mom +Family @phone");
	});

	it("複数タスク中の1タスク編集", () => {
		const content = "(A) 2026-01-01 Task 1\n(B) 2026-01-02 Task 2\n(C) 2026-01-03 Task 3";

		const result = editAndUpdateTask(content, 1, {
			description: "Updated Task 2",
		});

		expect(result).toBe("(A) 2026-01-01 Task 1\n(B) 2026-01-02 Updated Task 2\n(C) 2026-01-03 Task 3");
	});

	it("前後のタスク不変性", () => {
		const content = "(A) 2026-01-01 Task 1\n(B) 2026-01-02 Task 2\n(C) 2026-01-03 Task 3";

		const result = editAndUpdateTask(content, 1, {
			priority: "D",
		});

		// Task 1とTask 3は変更されない
		const lines = result.split("\n");
		expect(lines[0]).toBe("(A) 2026-01-01 Task 1");
		expect(lines[2]).toBe("(C) 2026-01-03 Task 3");
	});

	it("パース→編集→シリアライズ往復", () => {
		const content = "x (A) 2026-01-08 2026-01-01 Buy milk +GroceryShopping @store due:2026-01-10";

		const result = editAndUpdateTask(content, 0, {
			description: "Buy bread +GroceryShopping @store due:2026-01-10",
		});

		// 往復後も形式が保持される
		expect(result).toBe("x (A) 2026-01-08 2026-01-01 Buy bread +GroceryShopping @store due:2026-01-10");
	});
});
