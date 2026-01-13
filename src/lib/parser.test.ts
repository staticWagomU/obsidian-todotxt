import { describe, it, expect } from "vitest";
import { parseTodoLine, parseTodoTxt, serializeTodo, updateTodoInList, appendTaskToFile, updateTaskAtLine, deleteTaskAtLine } from "./parser";
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

describe("append task to file", () => {
	it("空ファイルにタスクを追加", () => {
		const content = "";
		const newTask: Todo = {
			completed: false,
			creationDate: "2026-01-08",
			description: "Buy milk",
			projects: [],
			contexts: [],
			tags: {},
			raw: "",
		};

		const result = appendTaskToFile(content, newTask);

		expect(result).toBe("2026-01-08 Buy milk");
	});

	it("1行既存のファイルにタスクを追加", () => {
		const content = "(A) 2026-01-01 Call Mom";
		const newTask: Todo = {
			completed: false,
			creationDate: "2026-01-08",
			description: "Buy milk",
			projects: [],
			contexts: [],
			tags: {},
			raw: "",
		};

		const result = appendTaskToFile(content, newTask);

		expect(result).toBe("(A) 2026-01-01 Call Mom\n2026-01-08 Buy milk");
	});

	it("複数行既存のファイルにタスクを追加", () => {
		const content = "(A) 2026-01-01 Call Mom\n(B) 2026-01-02 Buy groceries";
		const newTask: Todo = {
			completed: false,
			priority: "C",
			creationDate: "2026-01-08",
			description: "Write report +Work @office",
			projects: ["Work"],
			contexts: ["office"],
			tags: {},
			raw: "",
		};

		const result = appendTaskToFile(content, newTask);

		expect(result).toBe("(A) 2026-01-01 Call Mom\n(B) 2026-01-02 Buy groceries\n(C) 2026-01-08 Write report +Work @office");
	});

	it("末尾改行なしのファイルにタスクを追加", () => {
		const content = "(A) 2026-01-01 Call Mom";
		const newTask: Todo = {
			completed: false,
			creationDate: "2026-01-08",
			description: "Buy milk +GroceryShopping",
			projects: ["GroceryShopping"],
			contexts: [],
			tags: {},
			raw: "",
		};

		const result = appendTaskToFile(content, newTask);

		expect(result).toBe("(A) 2026-01-01 Call Mom\n2026-01-08 Buy milk +GroceryShopping");
	});
});

describe("update task at specific line", () => {
	it("先頭行を更新できる", () => {
		const content = "(A) 2026-01-01 Call Mom\n(B) 2026-01-02 Buy milk\n(C) 2026-01-03 Write report";
		const updatedTodo: Todo = {
			completed: true,
			completionDate: "2026-01-08",
			priority: "A",
			creationDate: "2026-01-01",
			description: "Call Mom",
			projects: [],
			contexts: [],
			tags: {},
			raw: "",
		};

		const result = updateTaskAtLine(content, 0, updatedTodo);

		expect(result).toBe("x (A) 2026-01-08 2026-01-01 Call Mom\n(B) 2026-01-02 Buy milk\n(C) 2026-01-03 Write report");
	});

	it("中間行を更新できる", () => {
		const content = "(A) 2026-01-01 Call Mom\n(B) 2026-01-02 Buy milk\n(C) 2026-01-03 Write report";
		const updatedTodo: Todo = {
			completed: false,
			priority: "A",
			creationDate: "2026-01-02",
			description: "Buy bread +GroceryShopping",
			projects: ["GroceryShopping"],
			contexts: [],
			tags: {},
			raw: "",
		};

		const result = updateTaskAtLine(content, 1, updatedTodo);

		expect(result).toBe("(A) 2026-01-01 Call Mom\n(A) 2026-01-02 Buy bread +GroceryShopping\n(C) 2026-01-03 Write report");
	});

	it("末尾行を更新できる", () => {
		const content = "(A) 2026-01-01 Call Mom\n(B) 2026-01-02 Buy milk\n(C) 2026-01-03 Write report";
		const updatedTodo: Todo = {
			completed: false,
			priority: "C",
			creationDate: "2026-01-03",
			description: "Write report @office",
			projects: [],
			contexts: ["office"],
			tags: {},
			raw: "",
		};

		const result = updateTaskAtLine(content, 2, updatedTodo);

		expect(result).toBe("(A) 2026-01-01 Call Mom\n(B) 2026-01-02 Buy milk\n(C) 2026-01-03 Write report @office");
	});

	it("範囲外のインデックスでエラーハンドリング", () => {
		const content = "(A) 2026-01-01 Call Mom";
		const updatedTodo: Todo = {
			completed: false,
			description: "Buy milk",
			projects: [],
			contexts: [],
			tags: {},
			raw: "",
		};

		// 範囲外のインデックスの場合は元のコンテンツを返す
		const result = updateTaskAtLine(content, 5, updatedTodo);

		expect(result).toBe("(A) 2026-01-01 Call Mom");
	});

	it("空コンテンツを処理できる", () => {
		const content = "";
		const updatedTodo: Todo = {
			completed: false,
			description: "Buy milk",
			projects: [],
			contexts: [],
			tags: {},
			raw: "",
		};

		const result = updateTaskAtLine(content, 0, updatedTodo);

		expect(result).toBe("");
	});
});

describe("delete task at line index", () => {
	it("単一行ファイルのタスクを削除すると空文字列になる", () => {
		const content = "(A) 2026-01-01 Call Mom";

		const result = deleteTaskAtLine(content, 0);

		expect(result).toBe("");
	});

	it("末尾行のタスクを削除できる", () => {
		const content = "(A) 2026-01-01 Call Mom\n(B) 2026-01-02 Buy milk\n(C) 2026-01-03 Write report";

		const result = deleteTaskAtLine(content, 2);

		expect(result).toBe("(A) 2026-01-01 Call Mom\n(B) 2026-01-02 Buy milk");
	});

	it("中間行のタスクを削除できる", () => {
		const content = "(A) 2026-01-01 Call Mom\n(B) 2026-01-02 Buy milk\n(C) 2026-01-03 Write report";

		const result = deleteTaskAtLine(content, 1);

		expect(result).toBe("(A) 2026-01-01 Call Mom\n(C) 2026-01-03 Write report");
	});

	it("先頭行のタスクを削除できる", () => {
		const content = "(A) 2026-01-01 Call Mom\n(B) 2026-01-02 Buy milk\n(C) 2026-01-03 Write report";

		const result = deleteTaskAtLine(content, 0);

		expect(result).toBe("(B) 2026-01-02 Buy milk\n(C) 2026-01-03 Write report");
	});

	it("空ファイルまたは範囲外インデックスの場合は元のコンテンツを返す", () => {
		const emptyContent = "";
		const resultEmpty = deleteTaskAtLine(emptyContent, 0);
		expect(resultEmpty).toBe("");

		const content = "(A) 2026-01-01 Call Mom";
		const resultOutOfBounds = deleteTaskAtLine(content, 5);
		expect(resultOutOfBounds).toBe("(A) 2026-01-01 Call Mom");

		const resultNegative = deleteTaskAtLine(content, -1);
		expect(resultNegative).toBe("(A) 2026-01-01 Call Mom");
	});
});

describe("priority edge cases", () => {
	it("P-01: (A) 大文字A-Zは有効な優先度", () => {
		const result = parseTodoLine("(A) Valid");
		expect(result.priority).toBe("A");
		expect(result.description).toBe("Valid");
	});

	it("P-02: (M) 中間の優先度も有効", () => {
		const result = parseTodoLine("(M) Valid");
		expect(result.priority).toBe("M");
		expect(result.description).toBe("Valid");
	});

	it("P-03: (Z) 最低優先度も有効", () => {
		const result = parseTodoLine("(Z) Valid");
		expect(result.priority).toBe("Z");
		expect(result.description).toBe("Valid");
	});

	it("P-04: (a) 小文字は無効な優先度", () => {
		const result = parseTodoLine("(a) lowercase");
		expect(result.priority).toBeUndefined();
		expect(result.description).toBe("(a) lowercase");
	});

	it("P-05: (1) 数字は無効な優先度", () => {
		const result = parseTodoLine("(1) digit");
		expect(result.priority).toBeUndefined();
		expect(result.description).toBe("(1) digit");
	});

	it("P-06: (AA) 複数文字は無効な優先度", () => {
		const result = parseTodoLine("(AA) multiple");
		expect(result.priority).toBeUndefined();
		expect(result.description).toBe("(AA) multiple");
	});

	it("P-07: () 空は無効な優先度", () => {
		const result = parseTodoLine("() empty");
		expect(result.priority).toBeUndefined();
		expect(result.description).toBe("() empty");
	});

	it("P-08: ( A) スペース内包は無効な優先度", () => {
		const result = parseTodoLine("( A) space inside");
		expect(result.priority).toBeUndefined();
		expect(result.description).toBe("( A) space inside");
	});

	it("P-09: (A)NoSpace 後続スペースなしは無効な優先度", () => {
		const result = parseTodoLine("(A)NoSpace");
		expect(result.priority).toBeUndefined();
		expect(result.description).toBe("(A)NoSpace");
	});

	it("P-10: 途中の(A)は無効な優先度", () => {
		const result = parseTodoLine("Task (A) middle");
		expect(result.priority).toBeUndefined();
		expect(result.description).toBe("Task (A) middle");
	});

	it("P-11: (Á) アクセント付きは無効な優先度", () => {
		const result = parseTodoLine("(Á) accented");
		expect(result.priority).toBeUndefined();
		expect(result.description).toBe("(Á) accented");
	});
});

describe("date edge cases", () => {
	it("D-01: 2024-01-01 年始の日付は有効", () => {
		const result = parseTodoLine("2024-01-01 Year start");
		expect(result.creationDate).toBe("2024-01-01");
		expect(result.description).toBe("Year start");
	});

	it("D-02: 2024-12-31 年末の日付は有効", () => {
		const result = parseTodoLine("2024-12-31 Year end");
		expect(result.creationDate).toBe("2024-12-31");
		expect(result.description).toBe("Year end");
	});

	it("D-03: 2024-02-29 うるう年の日付は有効", () => {
		const result = parseTodoLine("2024-02-29 Leap year");
		expect(result.creationDate).toBe("2024-02-29");
		expect(result.description).toBe("Leap year");
	});

	it("D-04: 2000-01-01 2000年の日付は有効", () => {
		const result = parseTodoLine("2000-01-01 Y2K");
		expect(result.creationDate).toBe("2000-01-01");
		expect(result.description).toBe("Y2K");
	});

	it("D-05: 9999-12-31 遠い未来の日付は有効", () => {
		const result = parseTodoLine("9999-12-31 Far future");
		expect(result.creationDate).toBe("9999-12-31");
		expect(result.description).toBe("Far future");
	});

	it("D-06: 2024/01/15 スラッシュ形式は無効", () => {
		const result = parseTodoLine("2024/01/15 Slash format");
		expect(result.creationDate).toBeUndefined();
		expect(result.description).toBe("2024/01/15 Slash format");
	});

	it("D-07: 2024-1-15 ゼロパディングなしは無効", () => {
		const result = parseTodoLine("2024-1-15 No padding");
		expect(result.creationDate).toBeUndefined();
		expect(result.description).toBe("2024-1-15 No padding");
	});

	it("D-08: 24-01-15 短縮年は無効", () => {
		const result = parseTodoLine("24-01-15 Short year");
		expect(result.creationDate).toBeUndefined();
		expect(result.description).toBe("24-01-15 Short year");
	});

	it("D-09: 2024-13-01 無効な月（フォーマットは通過）", () => {
		const result = parseTodoLine("2024-13-01 Invalid month");
		// Implementation policy: フォーマットチェックのみ、無効日付もパース
		expect(result.creationDate).toBe("2024-13-01");
		expect(result.description).toBe("Invalid month");
	});

	it("D-10: 2024-02-30 無効な日（フォーマットは通過）", () => {
		const result = parseTodoLine("2024-02-30 Invalid day");
		// Implementation policy: フォーマットチェックのみ、無効日付もパース
		expect(result.creationDate).toBe("2024-02-30");
		expect(result.description).toBe("Invalid day");
	});

	it("D-11: 2023-02-29 うるう年でない（フォーマットは通過）", () => {
		const result = parseTodoLine("2023-02-29 Not leap year");
		// Implementation policy: フォーマットチェックのみ、無効日付もパース
		expect(result.creationDate).toBe("2023-02-29");
		expect(result.description).toBe("Not leap year");
	});

	it("D-12: 途中の日付は本文扱い", () => {
		const result = parseTodoLine("Task 2024-01-15 middle");
		expect(result.creationDate).toBeUndefined();
		expect(result.description).toBe("Task 2024-01-15 middle");
	});

	it("D-13: (A) 2024-01-02T10:00 ISO形式T付きは無効", () => {
		const result = parseTodoLine("(A) 2024-01-02T10:00 ISO");
		expect(result.priority).toBe("A");
		expect(result.creationDate).toBeUndefined();
		expect(result.description).toBe("2024-01-02T10:00 ISO");
	});

	it("D-14: x 2024-01-20 完了日のみ", () => {
		const result = parseTodoLine("x 2024-01-20 Only completion");
		expect(result.completed).toBe(true);
		expect(result.completionDate).toBe("2024-01-20");
		expect(result.creationDate).toBeUndefined();
		expect(result.description).toBe("Only completion");
	});
});

describe("project context edge cases", () => {
	// Project edge cases (PR-01 to PR-10)
	it("PR-01: +a 最短のプロジェクト名", () => {
		const result = parseTodoLine("+a Minimal");
		expect(result.projects).toEqual(["a"]);
		expect(result.description).toBe("+a Minimal");
	});

	it("PR-02: +Project_Name-123 複合文字を含むプロジェクト", () => {
		const result = parseTodoLine("+Project_Name-123 Complex");
		expect(result.projects).toEqual(["Project_Name-123"]);
		expect(result.description).toBe("+Project_Name-123 Complex");
	});

	it("PR-03: +日本語 Unicodeプロジェクト名（実装ポリシー: 許可）", () => {
		const result = parseTodoLine("+日本語 Japanese");
		expect(result.projects).toEqual(["日本語"]);
		expect(result.description).toBe("+日本語 Japanese");
	});

	it("PR-04: +UPPERCASE 大文字プロジェクト", () => {
		const result = parseTodoLine("+UPPERCASE Upper");
		expect(result.projects).toEqual(["UPPERCASE"]);
		expect(result.description).toBe("+UPPERCASE Upper");
	});

	it("PR-05: +lowercase 小文字プロジェクト", () => {
		const result = parseTodoLine("+lowercase Lower");
		expect(result.projects).toEqual(["lowercase"]);
		expect(result.description).toBe("+lowercase Lower");
	});

	it("PR-06: + スペース直後は無効", () => {
		const result = parseTodoLine("Task + invalid");
		expect(result.projects).toEqual([]);
		expect(result.description).toBe("Task + invalid");
	});

	it("PR-07: Task+ 末尾+は無効（前にスペースなし）", () => {
		const result = parseTodoLine("Task+ Trailing");
		expect(result.projects).toEqual([]);
		expect(result.description).toBe("Task+ Trailing");
	});

	it("PR-08: Task+inline 前にスペースなしは無効", () => {
		const result = parseTodoLine("Task+inline No space");
		expect(result.projects).toEqual([]);
		expect(result.description).toBe("Task+inline No space");
	});

	it("PR-09: +A+B 連続+は1つのプロジェクトとして認識", () => {
		const result = parseTodoLine("+A+B Chained");
		expect(result.projects).toEqual(["A+B"]);
		expect(result.description).toBe("+A+B Chained");
	});

	it("PR-10: ++double ダブルプラスは1つのプロジェクトとして認識", () => {
		const result = parseTodoLine("++double Double plus");
		expect(result.projects).toEqual(["+double"]);
		expect(result.description).toBe("++double Double plus");
	});

	// Context edge cases (CX-01 to CX-07)
	it("CX-01: @a 最短のコンテキスト名", () => {
		const result = parseTodoLine("@a Minimal");
		expect(result.contexts).toEqual(["a"]);
		expect(result.description).toBe("@a Minimal");
	});

	it("CX-02: @home_office-2024 複合文字を含むコンテキスト", () => {
		const result = parseTodoLine("@home_office-2024 Complex");
		expect(result.contexts).toEqual(["home_office-2024"]);
		expect(result.description).toBe("@home_office-2024 Complex");
	});

	it("CX-03: @会社 Unicodeコンテキスト名（実装ポリシー: 許可）", () => {
		const result = parseTodoLine("@会社 Japanese");
		expect(result.contexts).toEqual(["会社"]);
		expect(result.description).toBe("@会社 Japanese");
	});

	it("CX-04: @ スペース直後は無効", () => {
		const result = parseTodoLine("Task @ invalid");
		expect(result.contexts).toEqual([]);
		expect(result.description).toBe("Task @ invalid");
	});

	it("CX-05: email@example.com メールアドレスは無効（前にスペースなし）", () => {
		const result = parseTodoLine("email@example.com Email");
		expect(result.contexts).toEqual([]);
		expect(result.description).toBe("email@example.com Email");
	});

	it("CX-06: Task@inline 前にスペースなしは無効", () => {
		const result = parseTodoLine("Task@inline No space");
		expect(result.contexts).toEqual([]);
		expect(result.description).toBe("Task@inline No space");
	});

	it("CX-07: @@double ダブルアットは1つのコンテキストとして認識", () => {
		const result = parseTodoLine("@@double Double at");
		expect(result.contexts).toEqual(["@double"]);
		expect(result.description).toBe("@@double Double at");
	});
});
