import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { toggleCompletion, createTask, createAndAppendTask, editTask, editAndUpdateTask, removeTaskFromList, deleteAndRemoveTask } from "./todo";
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

			expect(result.originalTask.completed).toBe(true);
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

			expect(result.originalTask.completionDate).toBe("2026-01-08");
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

			expect(result.originalTask.priority).toBe("A");
			expect(result.originalTask.creationDate).toBe("2026-01-01");
			expect(result.originalTask.description).toBe("Buy milk +GroceryShopping @store");
			expect(result.originalTask.projects).toEqual(["GroceryShopping"]);
			expect(result.originalTask.contexts).toEqual(["store"]);
			expect(result.originalTask.tags).toEqual({ due: "2026-01-10" });
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

			expect(result.originalTask.completed).toBe(false);
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

			expect(result.originalTask.completionDate).toBeUndefined();
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

			expect(result.originalTask.priority).toBe("B");
			expect(result.originalTask.creationDate).toBe("2026-01-01");
			expect(result.originalTask.description).toBe("Buy milk +GroceryShopping");
			expect(result.originalTask.projects).toEqual(["GroceryShopping"]);
			expect(result.originalTask.tags).toEqual({ pri: "A" });
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

describe("remove task from list", () => {
	it("配列からタスクを除去して新配列を返す", () => {
		const todos: Todo[] = [
			{
				completed: false,
				description: "Task 1",
				projects: [],
				contexts: [],
				tags: {},
				raw: "Task 1",
			},
			{
				completed: false,
				description: "Task 2",
				projects: [],
				contexts: [],
				tags: {},
				raw: "Task 2",
			},
			{
				completed: false,
				description: "Task 3",
				projects: [],
				contexts: [],
				tags: {},
				raw: "Task 3",
			},
		];

		const result = removeTaskFromList(todos, 1);

		expect(result).toHaveLength(2);
		expect(result[0]?.description).toBe("Task 1");
		expect(result[1]?.description).toBe("Task 3");
	});

	it("インデックス境界チェック（範囲外の場合は元の配列を返す）", () => {
		const todos: Todo[] = [
			{
				completed: false,
				description: "Task 1",
				projects: [],
				contexts: [],
				tags: {},
				raw: "Task 1",
			},
		];

		// 範囲外（正）
		const resultOutOfBounds = removeTaskFromList(todos, 5);
		expect(resultOutOfBounds).toEqual(todos);

		// 範囲外（負）
		const resultNegative = removeTaskFromList(todos, -1);
		expect(resultNegative).toEqual(todos);
	});

	it("単一要素配列からタスクを削除すると空配列になる", () => {
		const todos: Todo[] = [
			{
				completed: false,
				description: "Task 1",
				projects: [],
				contexts: [],
				tags: {},
				raw: "Task 1",
			},
		];

		const result = removeTaskFromList(todos, 0);

		expect(result).toHaveLength(0);
		expect(result).toEqual([]);
	});

	it("複数要素配列から先頭・中間・末尾を削除できる", () => {
		const todos: Todo[] = [
			{
				completed: false,
				description: "Task 1",
				projects: [],
				contexts: [],
				tags: {},
				raw: "Task 1",
			},
			{
				completed: false,
				description: "Task 2",
				projects: [],
				contexts: [],
				tags: {},
				raw: "Task 2",
			},
			{
				completed: false,
				description: "Task 3",
				projects: [],
				contexts: [],
				tags: {},
				raw: "Task 3",
			},
		];

		// 先頭削除
		const resultFirst = removeTaskFromList(todos, 0);
		expect(resultFirst).toHaveLength(2);
		expect(resultFirst[0]?.description).toBe("Task 2");
		expect(resultFirst[1]?.description).toBe("Task 3");

		// 中間削除
		const resultMiddle = removeTaskFromList(todos, 1);
		expect(resultMiddle).toHaveLength(2);
		expect(resultMiddle[0]?.description).toBe("Task 1");
		expect(resultMiddle[1]?.description).toBe("Task 3");

		// 末尾削除
		const resultLast = removeTaskFromList(todos, 2);
		expect(resultLast).toHaveLength(2);
		expect(resultLast[0]?.description).toBe("Task 1");
		expect(resultLast[1]?.description).toBe("Task 2");
	});
});

describe("delete and remove task integration", () => {
	it("統合削除処理（ファイル内容から指定タスクを削除）", () => {
		const content = "(A) 2026-01-01 Call Mom\n(B) 2026-01-02 Buy milk\n(C) 2026-01-03 Write report";

		const result = deleteAndRemoveTask(content, 1);

		expect(result).toBe("(A) 2026-01-01 Call Mom\n(C) 2026-01-03 Write report");
	});

	it("削除後のファイル更新（パース→削除→シリアライズ）", () => {
		const content = "x (A) 2026-01-08 2026-01-01 Task 1 +Project @context\n(B) 2026-01-02 Task 2\n(C) 2026-01-03 Task 3";

		const result = deleteAndRemoveTask(content, 0);

		// 完了状態・優先度・日付・プロジェクト・コンテキストを含むタスクを削除できる
		expect(result).toBe("(B) 2026-01-02 Task 2\n(C) 2026-01-03 Task 3");
	});

	it("エッジケース組み合わせ（単一行削除で空文字列）", () => {
		const content = "(A) 2026-01-01 Call Mom";

		const result = deleteAndRemoveTask(content, 0);

		expect(result).toBe("");
	});

	it("削除後のパース結果確認（タスク数減少）", () => {
		const content = "(A) Task 1\n(B) Task 2\n(C) Task 3";

		const result = deleteAndRemoveTask(content, 1);

		// 削除後も正しくパースできることを確認
		expect(result).toBe("(A) Task 1\n(C) Task 3");
	});

	it("空ファイル変換（最後のタスク削除）", () => {
		const content = "(A) 2026-01-01 Only task";

		const result = deleteAndRemoveTask(content, 0);

		expect(result).toBe("");
	});
});

describe("toggle task completion with priority preservation (pri: tag)", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-09"));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("(A)のタスクを完了すると、(A)が削除されpri:Aタグが追加される", () => {
		const todo: Todo = {
			completed: false,
			priority: "A",
			creationDate: "2026-01-01",
			description: "Important task",
			projects: [],
			contexts: [],
			tags: {},
			raw: "(A) 2026-01-01 Important task",
		};

		const result = toggleCompletion(todo);

		// 完了後、priorityはundefinedになる
		expect(result.originalTask.priority).toBeUndefined();
		// pri:Aタグが追加される
		expect(result.originalTask.tags.pri).toBe("A");
		expect(result.originalTask.completed).toBe(true);
	});
});

describe("toggle task completion with recurrence", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-09"));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("rec:1d - 完了時に次回タスク生成(non-strict)", () => {
		const todo: Todo = {
			completed: false,
			creationDate: "2026-01-01",
			description: "Daily task",
			projects: [],
			contexts: [],
			tags: { rec: "rec:1d" },
			raw: "2026-01-01 Daily task rec:1d",
		};

		const result = toggleCompletion(todo);

		// 元タスクは完了
		expect(result.originalTask.completed).toBe(true);
		expect(result.originalTask.completionDate).toBe("2026-01-09");

		// 新タスクが生成される
		expect(result.recurringTask).toBeDefined();
		expect(result.recurringTask?.completed).toBe(false);
		expect(result.recurringTask?.creationDate).toBe("2026-01-09");
		expect(result.recurringTask?.tags.due).toBe("due:2026-01-10");
		expect(result.recurringTask?.tags.rec).toBe("rec:1d");
	});

	it("rec:+1w, due:1/5 - 完了時に次回タスク生成(strict)", () => {
		const todo: Todo = {
			completed: false,
			creationDate: "2026-01-01",
			description: "Weekly task",
			projects: [],
			contexts: [],
			tags: { rec: "rec:+1w", due: "due:2026-01-05" },
			raw: "2026-01-01 Weekly task due:2026-01-05 rec:+1w",
		};

		const result = toggleCompletion(todo);

		expect(result.originalTask.completed).toBe(true);
		expect(result.recurringTask).toBeDefined();
		expect(result.recurringTask?.tags.due).toBe("due:2026-01-12"); // 元due: + 1週間
		expect(result.recurringTask?.tags.rec).toBe("rec:+1w");
	});

	it("rec:なし - 通常の完了処理(新タスク生成なし)", () => {
		const todo: Todo = {
			completed: false,
			creationDate: "2026-01-01",
			description: "Normal task",
			projects: [],
			contexts: [],
			tags: {},
			raw: "2026-01-01 Normal task",
		};

		const result = toggleCompletion(todo);

		expect(result.originalTask.completed).toBe(true);
		expect(result.recurringTask).toBeUndefined();
	});

	it("完了→未完了への切り替え時は新タスク生成しない", () => {
		const todo: Todo = {
			completed: true,
			completionDate: "2026-01-08",
			creationDate: "2026-01-01",
			description: "Completed recurring task",
			projects: [],
			contexts: [],
			tags: { rec: "rec:1d" },
			raw: "x 2026-01-08 2026-01-01 Completed recurring task rec:1d",
		};

		const result = toggleCompletion(todo);

		expect(result.originalTask.completed).toBe(false);
		expect(result.recurringTask).toBeUndefined();
	});
});
