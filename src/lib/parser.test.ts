import { describe, it, expect } from "vitest";
import { parseTodoLine, parseTodoTxt, serializeTodo, updateTodoInList } from "./parser";
import type { Todo } from "./todo";

describe("parse completion", () => {
	it("行頭にxがある場合、completedがtrueになる", () => {
		const result = parseTodoLine("x Buy milk");
		expect(result.completed).toBe(true);
	});

	it("行頭にxがない場合、completedがfalseになる", () => {
		const result = parseTodoLine("Buy milk");
		expect(result.completed).toBe(false);
	});

	it("完了マークは行頭のx+スペースのみ有効", () => {
		const result1 = parseTodoLine("x Buy milk");
		expect(result1.completed).toBe(true);

		const result2 = parseTodoLine("Buy x milk");
		expect(result2.completed).toBe(false);
	});
});

describe("parse priority", () => {
	it("行頭の(A)-(Z)を優先度としてパース", () => {
		const result = parseTodoLine("(A) Call Mom");
		expect(result.priority).toBe("A");
	});

	it("完了マーク後の優先度をパース", () => {
		const result = parseTodoLine("x (B) 2026-01-08 Call Mom");
		expect(result.priority).toBe("B");
	});

	it("優先度がない場合はundefined", () => {
		const result = parseTodoLine("Buy milk");
		expect(result.priority).toBeUndefined();
	});

	it("小文字や範囲外の優先度は無効", () => {
		const result1 = parseTodoLine("(a) Invalid priority");
		expect(result1.priority).toBeUndefined();

		const result2 = parseTodoLine("(1) Invalid priority");
		expect(result2.priority).toBeUndefined();
	});

	it("説明文の途中の(A)は無視", () => {
		const result = parseTodoLine("Call (A) Mom");
		expect(result.priority).toBeUndefined();
	});
});

describe("parse dates", () => {
	it("作成日のみの場合", () => {
		const result = parseTodoLine("2026-01-08 Buy milk");
		expect(result.creationDate).toBe("2026-01-08");
		expect(result.completionDate).toBeUndefined();
	});

	it("完了タスクの完了日と作成日", () => {
		const result = parseTodoLine("x 2026-01-08 2026-01-01 Buy milk");
		expect(result.completionDate).toBe("2026-01-08");
		expect(result.creationDate).toBe("2026-01-01");
	});

	it("優先度と作成日の組み合わせ", () => {
		const result = parseTodoLine("(A) 2026-01-08 Call Mom");
		expect(result.priority).toBe("A");
		expect(result.creationDate).toBe("2026-01-08");
	});

	it("完了+優先度+日付の組み合わせ", () => {
		const result = parseTodoLine("x (B) 2026-01-08 2026-01-01 Task");
		expect(result.completed).toBe(true);
		expect(result.priority).toBe("B");
		expect(result.completionDate).toBe("2026-01-08");
		expect(result.creationDate).toBe("2026-01-01");
	});

	it("日付がない場合はundefined", () => {
		const result = parseTodoLine("Buy milk");
		expect(result.creationDate).toBeUndefined();
		expect(result.completionDate).toBeUndefined();
	});

	it("YYYY-MM-DD形式以外は無効", () => {
		const result = parseTodoLine("01-08-2026 Invalid date");
		expect(result.creationDate).toBeUndefined();
	});
});

describe("parse project context", () => {
	it("+記号で始まるプロジェクトを抽出", () => {
		const result = parseTodoLine("Buy milk +GroceryShopping");
		expect(result.projects).toEqual(["GroceryShopping"]);
	});

	it("@記号で始まるコンテキストを抽出", () => {
		const result = parseTodoLine("Call Mom @phone");
		expect(result.contexts).toEqual(["phone"]);
	});

	it("複数のプロジェクトとコンテキストを抽出", () => {
		const result = parseTodoLine(
			"Email report +ProjectA +ProjectB @work @email",
		);
		expect(result.projects).toEqual(["ProjectA", "ProjectB"]);
		expect(result.contexts).toEqual(["work", "email"]);
	});

	it("説明文の途中のプロジェクト・コンテキストも抽出", () => {
		const result = parseTodoLine("Review +ProjectX code @office");
		expect(result.projects).toEqual(["ProjectX"]);
		expect(result.contexts).toEqual(["office"]);
	});

	it("プロジェクト・コンテキストがない場合は空配列", () => {
		const result = parseTodoLine("Buy milk");
		expect(result.projects).toEqual([]);
		expect(result.contexts).toEqual([]);
	});

	it("スペースが続く場合は無効", () => {
		const result = parseTodoLine("Task + invalid @ invalid");
		expect(result.projects).toEqual([]);
		expect(result.contexts).toEqual([]);
	});
});

describe("parse tags", () => {
	it("key:value形式のタグを抽出", () => {
		const result = parseTodoLine("Buy milk due:2026-01-15");
		expect(result.tags).toEqual({ due: "2026-01-15" });
	});

	it("複数のタグを抽出", () => {
		const result = parseTodoLine(
			"Task due:2026-01-15 t:2026-01-10 rec:+1w",
		);
		expect(result.tags).toEqual({
			due: "2026-01-15",
			t: "2026-01-10",
			rec: "+1w",
		});
	});

	it("pri:タグを抽出", () => {
		const result = parseTodoLine("x Task pri:A");
		expect(result.tags).toEqual({ pri: "A" });
	});

	it("タグがない場合は空オブジェクト", () => {
		const result = parseTodoLine("Buy milk");
		expect(result.tags).toEqual({});
	});

	it("コロンの前後にスペースがある場合は無効", () => {
		const result = parseTodoLine("Task key : value");
		expect(result.tags).toEqual({});
	});

	it("値に空白を含むタグは次の空白まで", () => {
		const result = parseTodoLine("Task note:some value here end");
		expect(result.tags).toEqual({ note: "some" });
	});
});

describe("parse to Todo array", () => {
	it("複数行のテキストをTodo配列にパース", () => {
		const text = `(A) 2026-01-08 Call Mom +Family @phone
Buy milk +GroceryShopping
x (B) 2026-01-08 2026-01-01 Task completed due:2026-01-15`;

		const result = parseTodoTxt(text);

		expect(result).toHaveLength(3);
		expect(result[0]?.priority).toBe("A");
		expect(result[0]?.description).toContain("Call Mom");
		expect(result[1]?.completed).toBe(false);
		expect(result[1]?.description).toContain("Buy milk");
		expect(result[2]?.completed).toBe(true);
		expect(result[2]?.tags.due).toBe("2026-01-15");
	});

	it("空行はスキップ", () => {
		const text = `Task 1

Task 2`;

		const result = parseTodoTxt(text);
		expect(result).toHaveLength(2);
	});

	it("空文字列は空配列を返す", () => {
		const result = parseTodoTxt("");
		expect(result).toEqual([]);
	});

	it("空白のみの行はスキップ", () => {
		const text = `Task 1

Task 2`;

		const result = parseTodoTxt(text);
		expect(result).toHaveLength(2);
	});
});

describe("serialize Todo to todo.txt format", () => {
	describe("基本的な変換", () => {
		it("未完了タスクの最小構成", () => {
			const todo: Todo = {
				completed: false,
				description: "Buy milk",
				projects: [],
				contexts: [],
				tags: {},
				raw: "Buy milk",
			};

			const result = serializeTodo(todo);
			expect(result).toBe("Buy milk");
		});

		it("完了タスクの最小構成", () => {
			const todo: Todo = {
				completed: true,
				completionDate: "2026-01-08",
				description: "Buy milk",
				projects: [],
				contexts: [],
				tags: {},
				raw: "x 2026-01-08 Buy milk",
			};

			const result = serializeTodo(todo);
			expect(result).toBe("x 2026-01-08 Buy milk");
		});

		it("優先度付きタスク", () => {
			const todo: Todo = {
				completed: false,
				priority: "A",
				description: "Call Mom",
				projects: [],
				contexts: [],
				tags: {},
				raw: "(A) Call Mom",
			};

			const result = serializeTodo(todo);
			expect(result).toBe("(A) Call Mom");
		});
	});

	describe("日付の変換", () => {
		it("作成日のみ", () => {
			const todo: Todo = {
				completed: false,
				creationDate: "2026-01-01",
				description: "Buy milk",
				projects: [],
				contexts: [],
				tags: {},
				raw: "2026-01-01 Buy milk",
			};

			const result = serializeTodo(todo);
			expect(result).toBe("2026-01-01 Buy milk");
		});

		it("完了日と作成日（完了タスク）", () => {
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

			const result = serializeTodo(todo);
			expect(result).toBe("x 2026-01-08 2026-01-01 Buy milk");
		});

		it("優先度+作成日", () => {
			const todo: Todo = {
				completed: false,
				priority: "A",
				creationDate: "2026-01-01",
				description: "Call Mom",
				projects: [],
				contexts: [],
				tags: {},
				raw: "(A) 2026-01-01 Call Mom",
			};

			const result = serializeTodo(todo);
			expect(result).toBe("(A) 2026-01-01 Call Mom");
		});

		it("完了+優先度+完了日+作成日", () => {
			const todo: Todo = {
				completed: true,
				priority: "B",
				completionDate: "2026-01-08",
				creationDate: "2026-01-01",
				description: "Review code",
				projects: [],
				contexts: [],
				tags: {},
				raw: "x (B) 2026-01-08 2026-01-01 Review code",
			};

			const result = serializeTodo(todo);
			expect(result).toBe("x (B) 2026-01-08 2026-01-01 Review code");
		});
	});

	describe("複雑な構成の変換", () => {
		it("プロジェクトとコンテキストを含む", () => {
			const todo: Todo = {
				completed: false,
				description: "Buy milk +GroceryShopping @store",
				projects: ["GroceryShopping"],
				contexts: ["store"],
				tags: {},
				raw: "Buy milk +GroceryShopping @store",
			};

			const result = serializeTodo(todo);
			expect(result).toBe("Buy milk +GroceryShopping @store");
		});

		it("タグを含む", () => {
			const todo: Todo = {
				completed: false,
				description: "Buy milk due:2026-01-15",
				projects: [],
				contexts: [],
				tags: { due: "2026-01-15" },
				raw: "Buy milk due:2026-01-15",
			};

			const result = serializeTodo(todo);
			expect(result).toBe("Buy milk due:2026-01-15");
		});

		it("全要素を含む完全な構成", () => {
			const todo: Todo = {
				completed: true,
				priority: "A",
				completionDate: "2026-01-08",
				creationDate: "2026-01-01",
				description: "Review +ProjectX code @office due:2026-01-10",
				projects: ["ProjectX"],
				contexts: ["office"],
				tags: { due: "2026-01-10" },
				raw: "x (A) 2026-01-08 2026-01-01 Review +ProjectX code @office due:2026-01-10",
			};

			const result = serializeTodo(todo);
			expect(result).toBe("x (A) 2026-01-08 2026-01-01 Review +ProjectX code @office due:2026-01-10");
		});
	});
});

describe("save toggled task to file", () => {
	it("指定インデックスのタスクを更新した文字列を返す", () => {
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

		const updatedTodo: Todo = {
			completed: true,
			completionDate: "2026-01-08",
			description: "Task 2",
			projects: [],
			contexts: [],
			tags: {},
			raw: "Task 2",
		};

		const result = updateTodoInList(todos, 1, updatedTodo);

		expect(result).toBe("Task 1\nx 2026-01-08 Task 2\nTask 3");
	});

	it("空のtodos配列の場合は空文字列を返す", () => {
		const todos: Todo[] = [];
		const updatedTodo: Todo = {
			completed: true,
			completionDate: "2026-01-08",
			description: "Task 1",
			projects: [],
			contexts: [],
			tags: {},
			raw: "Task 1",
		};

		const result = updateTodoInList(todos, 0, updatedTodo);

		expect(result).toBe("");
	});

	it("インデックスが範囲外の場合は元の文字列を返す", () => {
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

		const updatedTodo: Todo = {
			completed: true,
			completionDate: "2026-01-08",
			description: "Task 2",
			projects: [],
			contexts: [],
			tags: {},
			raw: "Task 2",
		};

		const result = updateTodoInList(todos, 5, updatedTodo);

		expect(result).toBe("Task 1");
	});

	it("複雑なtodo.txtの特定行を更新", () => {
		const todos: Todo[] = [
			{
				completed: false,
				priority: "A",
				creationDate: "2026-01-01",
				description: "Call Mom +Family @phone",
				projects: ["Family"],
				contexts: ["phone"],
				tags: {},
				raw: "(A) 2026-01-01 Call Mom +Family @phone",
			},
			{
				completed: false,
				description: "Buy milk +GroceryShopping",
				projects: ["GroceryShopping"],
				contexts: [],
				tags: {},
				raw: "Buy milk +GroceryShopping",
			},
		];

		const updatedTodo: Todo = {
			completed: true,
			completionDate: "2026-01-08",
			description: "Buy milk +GroceryShopping",
			projects: ["GroceryShopping"],
			contexts: [],
			tags: {},
			raw: "Buy milk +GroceryShopping",
		};

		const result = updateTodoInList(todos, 1, updatedTodo);

		expect(result).toBe("(A) 2026-01-01 Call Mom +Family @phone\nx 2026-01-08 Buy milk +GroceryShopping");
	});
});
