/**
 * Project/Context selection utilities tests
 * Tests for rendering project and context options for multi-select
 */

import { describe, expect, test } from "vitest";
import { renderProjectOptions, renderContextOptions } from "./project-context-utils";

describe("renderProjectOptions", () => {
	test("プロジェクト名の配列から選択肢オブジェクト配列を生成", () => {
		const projects = ["project1", "project2", "project3"];
		const options = renderProjectOptions(projects);

		expect(options).toEqual([
			{ value: "project1", label: "+project1" },
			{ value: "project2", label: "+project2" },
			{ value: "project3", label: "+project3" },
		]);
	});

	test("空配列の場合、空配列を返す", () => {
		const options = renderProjectOptions([]);
		expect(options).toEqual([]);
	});

	test("ソート済み配列を入力した場合、同じ順序を保持", () => {
		const projects = ["apple", "banana", "zebra"];
		const options = renderProjectOptions(projects);

		expect(options).toEqual([
			{ value: "apple", label: "+apple" },
			{ value: "banana", label: "+banana" },
			{ value: "zebra", label: "+zebra" },
		]);
	});
});

describe("renderContextOptions", () => {
	test("コンテキスト名の配列から選択肢オブジェクト配列を生成", () => {
		const contexts = ["home", "work", "email"];
		const options = renderContextOptions(contexts);

		expect(options).toEqual([
			{ value: "home", label: "@home" },
			{ value: "work", label: "@work" },
			{ value: "email", label: "@email" },
		]);
	});

	test("空配列の場合、空配列を返す", () => {
		const options = renderContextOptions([]);
		expect(options).toEqual([]);
	});

	test("ソート済み配列を入力した場合、同じ順序を保持", () => {
		const contexts = ["apple", "banana", "zebra"];
		const options = renderContextOptions(contexts);

		expect(options).toEqual([
			{ value: "apple", label: "@apple" },
			{ value: "banana", label: "@banana" },
			{ value: "zebra", label: "@zebra" },
		]);
	});
});
