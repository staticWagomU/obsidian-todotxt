import { describe, it, expect } from "vitest";
import { getPriorityColor, shouldShowPriorityBadge } from "./priority";

describe("getPriorityColor", () => {
  it("優先度Aの場合、赤色の色コードを返すこと", () => {
    expect(getPriorityColor("A")).toBe("#ff4444");
  });

  it("優先度Bの場合、オレンジ色の色コードを返すこと", () => {
    expect(getPriorityColor("B")).toBe("#ff9944");
  });

  it("優先度Cの場合、黄色の色コードを返すこと", () => {
    expect(getPriorityColor("C")).toBe("#ffdd44");
  });

  it("優先度D-Zの場合、デフォルト色を返すこと", () => {
    expect(getPriorityColor("D")).toBe("#cccccc");
    expect(getPriorityColor("M")).toBe("#cccccc");
    expect(getPriorityColor("Z")).toBe("#cccccc");
  });

  it("優先度なし(undefined)の場合、デフォルト色を返すこと", () => {
    expect(getPriorityColor(undefined)).toBe("#cccccc");
  });
});

describe("shouldShowPriorityBadge", () => {
  it("優先度A-Zの場合、trueを返すこと", () => {
    expect(shouldShowPriorityBadge("A")).toBe(true);
    expect(shouldShowPriorityBadge("B")).toBe(true);
    expect(shouldShowPriorityBadge("M")).toBe(true);
    expect(shouldShowPriorityBadge("Z")).toBe(true);
  });

  it("優先度なし(undefined)の場合、falseを返すこと", () => {
    expect(shouldShowPriorityBadge(undefined)).toBe(false);
  });
});
