import { describe, it, expect } from "vitest";
import {
  getPriorityColor,
  shouldShowPriorityBadge,
  getPriorityBadgeStyle,
  normalizePriority,
  getPriorityBadgeAriaLabel,
} from "./priority";

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

describe("Priority Badge Integration", () => {
  it("優先度Aのタスクの場合、バッジを表示し赤色を適用すること", () => {
    const priority = "A";
    const shouldShow = shouldShowPriorityBadge(priority);
    const color = getPriorityColor(priority);

    expect(shouldShow).toBe(true);
    expect(color).toBe("#ff4444");
  });

  it("優先度Bのタスクの場合、バッジを表示しオレンジ色を適用すること", () => {
    const priority = "B";
    const shouldShow = shouldShowPriorityBadge(priority);
    const color = getPriorityColor(priority);

    expect(shouldShow).toBe(true);
    expect(color).toBe("#ff9944");
  });

  it("優先度Cのタスクの場合、バッジを表示し黄色を適用すること", () => {
    const priority = "C";
    const shouldShow = shouldShowPriorityBadge(priority);
    const color = getPriorityColor(priority);

    expect(shouldShow).toBe(true);
    expect(color).toBe("#ffdd44");
  });

  it("優先度D-Zのタスクの場合、バッジを表示しデフォルト色を適用すること", () => {
    const priority = "D";
    const shouldShow = shouldShowPriorityBadge(priority);
    const color = getPriorityColor(priority);

    expect(shouldShow).toBe(true);
    expect(color).toBe("#cccccc");
  });

  it("優先度なしのタスクの場合、バッジを非表示にすること", () => {
    const priority = undefined;
    const shouldShow = shouldShowPriorityBadge(priority);

    expect(shouldShow).toBe(false);
  });

  it("優先度に応じたバッジスタイルオブジェクトを返すこと", () => {
    // 優先度Aの場合
    const styleA = getPriorityBadgeStyle("A");
    expect(styleA).toEqual({
      display: "inline-block",
      backgroundColor: "#ff4444",
      color: "#ffffff",
      padding: "2px 6px",
      borderRadius: "3px",
      fontSize: "0.85em",
      fontWeight: "bold",
      marginRight: "4px",
    });

    // 優先度Bの場合
    const styleB = getPriorityBadgeStyle("B");
    expect(styleB.backgroundColor).toBe("#ff9944");

    // 優先度なしの場合
    const styleNone = getPriorityBadgeStyle(undefined);
    expect(styleNone).toEqual({ display: "none" });
  });
});

describe("Edge Cases & Accessibility", () => {
  describe("normalizePriority", () => {
    it("小文字の優先度を大文字に正規化すること", () => {
      expect(normalizePriority("a")).toBe("A");
      expect(normalizePriority("b")).toBe("B");
      expect(normalizePriority("z")).toBe("Z");
    });

    it("大文字の優先度はそのまま返すこと", () => {
      expect(normalizePriority("A")).toBe("A");
      expect(normalizePriority("M")).toBe("M");
    });

    it("undefinedはundefinedを返すこと", () => {
      expect(normalizePriority(undefined)).toBeUndefined();
    });

    it("A-Z以外の文字列はundefinedを返すこと", () => {
      expect(normalizePriority("1")).toBeUndefined();
      expect(normalizePriority("@")).toBeUndefined();
      expect(normalizePriority("AA")).toBeUndefined();
    });
  });

  describe("getPriorityBadgeAriaLabel", () => {
    it("優先度に応じた適切なARIAラベルを返すこと", () => {
      expect(getPriorityBadgeAriaLabel("A")).toBe("Priority A");
      expect(getPriorityBadgeAriaLabel("B")).toBe("Priority B");
      expect(getPriorityBadgeAriaLabel("Z")).toBe("Priority Z");
    });

    it("優先度なしの場合は空文字列を返すこと", () => {
      expect(getPriorityBadgeAriaLabel(undefined)).toBe("");
    });
  });

  describe("Integration with normalization", () => {
    it("小文字優先度でも正しく色を取得できること", () => {
      const normalized = normalizePriority("a");
      expect(getPriorityColor(normalized)).toBe("#ff4444");
    });

    it("小文字優先度でも正しくバッジ表示判定できること", () => {
      const normalized = normalizePriority("b");
      expect(shouldShowPriorityBadge(normalized)).toBe(true);
    });
  });
});
