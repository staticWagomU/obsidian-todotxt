/**
 * AI-Agentic Scrum Dashboard
 * Single source of truth. Git tracks history. Order = Priority. 1 Sprint = 1 PBI.
 */

// Types
type PBIStatus = "draft" | "refining" | "ready" | "done";
type SprintStatus = "not_started" | "in_progress" | "done" | "blocked";
type SubtaskStatus = "pending" | "red" | "green" | "refactoring" | "completed";
type SubtaskType = "behavioral" | "structural";
type CommitPhase = "red" | "green" | "refactor";

interface AcceptanceCriterion { criterion: string; verification: string; }
interface UserStory { role: string; capability: string; benefit: string; }
interface ProductBacklogItem {
  id: string; story: UserStory; acceptanceCriteria: AcceptanceCriterion[];
  dependencies: string[]; status: PBIStatus;
}
interface Commit { phase: CommitPhase; message: string; }
interface Subtask {
  test: string; implementation: string; type: SubtaskType;
  status: SubtaskStatus; commits: Commit[];
}
interface CompletedSprint {
  sprint: number; pbi: string; story: string;
  verification: "passed" | "failed"; notes: string;
}
interface Retrospective {
  sprint: number; workedWell: string[]; toImprove: string[]; actions: string[];
}

// Quick Status
export const quickStatus = {
  sprint: { number: 2, pbi: "PBI-002" as string | null, status: "in_progress" as SprintStatus,
    subtasksCompleted: 0, subtasksTotal: 6, impediments: 0 },
};

// Product Goal
export const productGoal = {
  statement: "Obsidian内でtodo.txt形式のファイルを直感的に管理・表示する",
  owner: "@scrum-team-product-owner",
};

// Product Backlog (Order = Priority)
export const productBacklog: ProductBacklogItem[] = [
  // Phase 1: MVP - DONE
  { id: "PBI-001", story: { role: "Obsidianユーザー", capability: ".txt/.todotxtファイルを専用ビューで開く",
      benefit: "todo.txt形式を認識し適切なUIで表示" }, acceptanceCriteria: [
      { criterion: ".txt拡張子を専用ビューで開ける", verification: "pnpm vitest run --grep 'txt extension'" },
      { criterion: ".todotxt拡張子を専用ビューで開ける", verification: "pnpm vitest run --grep 'todotxt extension'" },
      { criterion: "TextFileView継承カスタムビュー登録", verification: "pnpm vitest run --grep 'TextFileView'" },
    ], dependencies: [], status: "done" },
  { id: "PBI-002", story: { role: "Obsidianユーザー", capability: "todo.txtをパースしてタスク一覧表示",
      benefit: "構造化されたリストで確認" }, acceptanceCriteria: [
      { criterion: "完了マーク(x)を行頭から正確にパースできる", verification: "pnpm vitest run --grep 'parse completion'" },
      { criterion: "優先度(A-Z)を行頭または完了マーク後からパースできる", verification: "pnpm vitest run --grep 'parse priority'" },
      { criterion: "完了日・作成日(YYYY-MM-DD)を正確にパースできる", verification: "pnpm vitest run --grep 'parse dates'" },
      { criterion: "説明文から+project/@context抽出できる", verification: "pnpm vitest run --grep 'parse project context'" },
      { criterion: "key:value形式のタグ(due/t/rec/pri)をパースできる", verification: "pnpm vitest run --grep 'parse tags'" },
      { criterion: "パース結果をTodoオブジェクト配列として構造化できる", verification: "pnpm vitest run --grep 'parse to Todo array'" },
    ], dependencies: ["PBI-001"], status: "ready" },
  { id: "PBI-003", story: { role: "Obsidianユーザー", capability: "チェックボックスで完了切替",
      benefit: "ワンクリックで状態更新" }, acceptanceCriteria: [
      { criterion: "完了トグル", verification: "pnpm vitest run --grep 'toggle'" },
      { criterion: "完了日自動付与", verification: "pnpm vitest run --grep 'completion date'" },
      { criterion: "ファイル保存", verification: "pnpm vitest run --grep 'save'" },
    ], dependencies: ["PBI-002"], status: "draft" },
  { id: "PBI-004", story: { role: "Obsidianユーザー", capability: "新規タスク作成",
      benefit: "簡単に追加" }, acceptanceCriteria: [
      { criterion: "作成ダイアログ", verification: "pnpm vitest run --grep 'create dialog'" },
      { criterion: "作成日自動付与", verification: "pnpm vitest run --grep 'create date'" },
      { criterion: "ファイル追加", verification: "pnpm vitest run --grep 'append'" },
    ], dependencies: ["PBI-002"], status: "draft" },
  { id: "PBI-005", story: { role: "Obsidianユーザー", capability: "タスク編集",
      benefit: "内容修正" }, acceptanceCriteria: [
      { criterion: "編集ダイアログ", verification: "pnpm vitest run --grep 'edit dialog'" },
      { criterion: "保存", verification: "pnpm vitest run --grep 'save edited'" },
    ], dependencies: ["PBI-002"], status: "draft" },
  { id: "PBI-006", story: { role: "Obsidianユーザー", capability: "タスク削除",
      benefit: "不要タスク除去" }, acceptanceCriteria: [
      { criterion: "削除確認", verification: "pnpm vitest run --grep 'delete'" },
      { criterion: "ファイル削除", verification: "pnpm vitest run --grep 'remove'" },
    ], dependencies: ["PBI-002"], status: "draft" },
  { id: "PBI-007", story: { role: "Obsidianユーザー", capability: "ソート表示",
      benefit: "優先度順の一覧" }, acceptanceCriteria: [
      { criterion: "未完了優先", verification: "pnpm vitest run --grep 'sort incomplete'" },
      { criterion: "優先度順", verification: "pnpm vitest run --grep 'sort by priority'" },
    ], dependencies: ["PBI-002"], status: "draft" },
  // Phase 2: フィルタリング & UI
  { id: "PBI-008", story: { role: "Obsidianユーザー", capability: "優先度色分けバッジ",
      benefit: "視覚的識別" }, acceptanceCriteria: [
      { criterion: "A=赤,B=橙,C=黄", verification: "pnpm vitest run --grep 'priority style'" },
    ], dependencies: ["PBI-002"], status: "draft" },
  { id: "PBI-009", story: { role: "Obsidianユーザー", capability: "優先度フィルタ",
      benefit: "特定優先度表示" }, acceptanceCriteria: [
      { criterion: "フィルタ適用", verification: "pnpm vitest run --grep 'filter by priority'" },
    ], dependencies: ["PBI-007"], status: "draft" },
  { id: "PBI-010", story: { role: "Obsidianユーザー", capability: "テキスト検索",
      benefit: "キーワード絞込" }, acceptanceCriteria: [
      { criterion: "検索フィルタ", verification: "pnpm vitest run --grep 'filter by search'" },
    ], dependencies: ["PBI-007"], status: "draft" },
  { id: "PBI-011", story: { role: "Obsidianユーザー", capability: "グループ化",
      benefit: "関連タスクまとめ" }, acceptanceCriteria: [
      { criterion: "+project/@contextグループ", verification: "pnpm vitest run --grep 'group by'" },
    ], dependencies: ["PBI-007"], status: "draft" },
  { id: "PBI-012", story: { role: "Obsidianユーザー", capability: "due:表示",
      benefit: "期限確認" }, acceptanceCriteria: [
      { criterion: "期限ハイライト", verification: "pnpm vitest run --grep 'due'" },
    ], dependencies: ["PBI-002"], status: "draft" },
  // Phase 3: 拡張機能
  { id: "PBI-013", story: { role: "Obsidianユーザー", capability: "t:グレーアウト",
      benefit: "未着手タスク区別" }, acceptanceCriteria: [
      { criterion: "しきい値表示", verification: "pnpm vitest run --grep 'threshold'" },
    ], dependencies: ["PBI-002"], status: "draft" },
  { id: "PBI-014", story: { role: "Obsidianユーザー", capability: "[[Note]]リンク",
      benefit: "ノート遷移" }, acceptanceCriteria: [
      { criterion: "内部リンク", verification: "pnpm vitest run --grep 'internal link'" },
    ], dependencies: ["PBI-002"], status: "draft" },
  { id: "PBI-015", story: { role: "Obsidianユーザー", capability: "[text](url)リンク",
      benefit: "Web遷移" }, acceptanceCriteria: [
      { criterion: "外部リンク", verification: "pnpm vitest run --grep 'external link'" },
    ], dependencies: ["PBI-002"], status: "draft" },
  { id: "PBI-016", story: { role: "Obsidianユーザー", capability: "rec:繰り返し",
      benefit: "定期タスク自動生成" }, acceptanceCriteria: [
      { criterion: "繰り返し生成", verification: "pnpm vitest run --grep 'recurrence'" },
    ], dependencies: ["PBI-003"], status: "draft" },
  { id: "PBI-017", story: { role: "Obsidianユーザー", capability: "pri:タグ保存",
      benefit: "優先度復元" }, acceptanceCriteria: [
      { criterion: "pri:変換", verification: "pnpm vitest run --grep 'pri tag'" },
    ], dependencies: ["PBI-003"], status: "draft" },
  { id: "PBI-018", story: { role: "Obsidianユーザー", capability: "設定画面",
      benefit: "カスタマイズ" }, acceptanceCriteria: [
      { criterion: "設定タブ", verification: "pnpm vitest run --grep 'settings'" },
    ], dependencies: [], status: "draft" },
  { id: "PBI-019", story: { role: "Obsidianユーザー", capability: "構造化フォーム",
      benefit: "形式不要の入力" }, acceptanceCriteria: [
      { criterion: "フォーム入力", verification: "pnpm vitest run --grep 'form'" },
    ], dependencies: ["PBI-004", "PBI-005"], status: "draft" },
];

// Definition of Ready
export const definitionOfReady = {
  criteria: [
    "AI can complete without human input",
    "User story has role/capability/benefit",
    "At least 3 acceptance criteria with verification",
    "Dependencies resolved or not blocking",
  ],
};

// Current Sprint
export const currentSprint = {
  number: 2,
  pbiId: "PBI-002" as string | null,
  story: "todo.txt形式の完全なパース機能を実装し、構造化されたTodoオブジェクト配列として表示可能にする",
  status: "in_progress" as SprintStatus,
  subtasks: [
    {
      test: "完了マーク(x)をパース - 行頭のx マークを検出",
      implementation: "src/lib/parser.ts - parseCompletion関数実装",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
    {
      test: "優先度(A-Z)をパース - 行頭または完了マーク後の(A)-(Z)を検出",
      implementation: "src/lib/parser.ts - parsePriority関数実装",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
    {
      test: "完了日・作成日をパース - YYYY-MM-DD形式の日付を抽出",
      implementation: "src/lib/parser.ts - parseDates関数実装",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
    {
      test: "プロジェクト・コンテキストをパース - 説明文から+projectと@contextを抽出",
      implementation: "src/lib/parser.ts - parseProjectsAndContexts関数実装",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
    {
      test: "タグ(key:value)をパース - due:, t:, rec:, pri:などのタグを抽出",
      implementation: "src/lib/parser.ts - parseTags関数実装",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
    {
      test: "Todoオブジェクト配列に構造化 - パース結果を統合してTodo[]を生成",
      implementation: "src/lib/parser.ts - parseTodoTxt関数実装 (統合)",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
  ] as Subtask[],
  notes: "Sprint 1振り返りアクション適用: 1 describe = 1 subtask, 共通モックヘルパー作成, vi.mock/vi.spyOn活用",
};

// Impediments
export const impediments = { active: [] as { id: string; description: string; status: string }[], resolved: [] as string[] };

// Definition of Done
export const definitionOfDone = {
  checks: [
    { name: "Tests", run: "pnpm vitest run" },
    { name: "Lint", run: "pnpm lint" },
    { name: "Types", run: "pnpm tsc --noEmit --skipLibCheck" },
    { name: "Build", run: "pnpm build" },
  ],
};

// Completed Sprints
export const completedSprints: CompletedSprint[] = [
  { sprint: 1, pbi: "PBI-001", story: ".txt/.todotxtファイルを専用ビューで開く",
    verification: "passed", notes: "TDDで3サブタスク完了、全DoD満たす" },
];

// Retrospectives
export const retrospectives: Retrospective[] = [
  { sprint: 1,
    workedWell: ["TDD Red-Green-Refactor", "明確な受け入れ基準", "適切なサブタスク分割", "Obsidianパターン適用"],
    toImprove: ["モック設定の冗長性", "vitest機能活用", "サブタスク粒度基準"],
    actions: ["共通モックヘルパー作成", "vi.mock活用", "1 describe = 1 subtask基準"] },
];

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
