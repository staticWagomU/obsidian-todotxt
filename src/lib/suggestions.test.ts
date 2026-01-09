/**
 * Suggestions tests
 * Tests for extracting projects/contexts from existing tasks for autocomplete
 */

import { describe, expect, test } from "vitest";
import { extractProjects, extractContexts } from "./suggestions";
import type { Todo } from "./todo";

describe("extractProjects", () => {
	test("複数のタスクから+projectを抽出し、重複を除去", () => {
		const todos: Todo[] = [
			{
				completed: false,
				description: "Task 1 +project1 +project2",
				projects: ["project1", "project2"],
				contexts: [],
				tags: {},
				raw: "",
			},
			{
				completed: false,
				description: "Task 2 +project1 +project3",
				projects: ["project1", "project3"],
				contexts: [],
				tags: {},
				raw: "",
			},
			{
				completed: false,
				description: "Task 3",
				projects: [],
				contexts: [],
				tags: {},
				raw: "",
			},
		];

		const projects = extractProjects(todos);
		expect(projects).toEqual(["project1", "project2", "project3"]);
	});

	test("プロジェクトが存在しない場合、空配列を返す", () => {
		const todos: Todo[] = [
			{
				completed: false,
				description: "Task without project",
				projects: [],
				contexts: [],
				tags: {},
				raw: "",
			},
		];

		const projects = extractProjects(todos);
		expect(projects).toEqual([]);
	});

	test("空のタスクリストの場合、空配列を返す", () => {
		const projects = extractProjects([]);
		expect(projects).toEqual([]);
	});

	test("抽出したプロジェクトがアルファベット順にソートされる", () => {
		const todos: Todo[] = [
			{
				completed: false,
				description: "Task +zebra +apple +banana",
				projects: ["zebra", "apple", "banana"],
				contexts: [],
				tags: {},
				raw: "",
			},
		];

		const projects = extractProjects(todos);
		expect(projects).toEqual(["apple", "banana", "zebra"]);
	});
});

describe("extractContexts", () => {
	test("複数のタスクから@contextを抽出し、重複を除去", () => {
		const todos: Todo[] = [
			{
				completed: false,
				description: "Task 1 @home @work",
				projects: [],
				contexts: ["home", "work"],
				tags: {},
				raw: "",
			},
			{
				completed: false,
				description: "Task 2 @home @email",
				projects: [],
				contexts: ["home", "email"],
				tags: {},
				raw: "",
			},
		];

		const contexts = extractContexts(todos);
		expect(contexts).toEqual(["email", "home", "work"]);
	});

	test("コンテキストが存在しない場合、空配列を返す", () => {
		const todos: Todo[] = [
			{
				completed: false,
				description: "Task without context",
				projects: [],
				contexts: [],
				tags: {},
				raw: "",
			},
		];

		const contexts = extractContexts(todos);
		expect(contexts).toEqual([]);
	});

	test("空のタスクリストの場合、空配列を返す", () => {
		const contexts = extractContexts([]);
		expect(contexts).toEqual([]);
	});

	test("抽出したコンテキストがアルファベット順にソートされる", () => {
		const todos: Todo[] = [
			{
				completed: false,
				description: "Task @zebra @apple @banana",
				projects: [],
				contexts: ["zebra", "apple", "banana"],
				tags: {},
				raw: "",
			},
		];

		const contexts = extractContexts(todos);
		expect(contexts).toEqual(["apple", "banana", "zebra"]);
	});
});
