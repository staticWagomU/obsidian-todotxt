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
  sprint: { number: 0, pbi: null as string | null, status: "not_started" as SprintStatus,
    subtasksCompleted: 0, subtasksTotal: 0, impediments: 0 },
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
      { criterion: "完了マーク(x)を行頭から正確にパースできる", verification: "pnpm vitest run -t 'parse completion'" },
      { criterion: "優先度(A-Z)を行頭または完了マーク後からパースできる", verification: "pnpm vitest run -t 'parse priority'" },
      { criterion: "完了日・作成日(YYYY-MM-DD)を正確にパースできる", verification: "pnpm vitest run -t 'parse dates'" },
      { criterion: "説明文から+project/@context抽出できる", verification: "pnpm vitest run -t 'parse project context'" },
      { criterion: "key:value形式のタグ(due/t/rec/pri)をパースできる", verification: "pnpm vitest run -t 'parse tags'" },
      { criterion: "パース結果をTodoオブジェクト配列として構造化できる", verification: "pnpm vitest run -t 'parse to Todo array'" },
    ], dependencies: ["PBI-001"], status: "done" },
  { id: "PBI-003", story: { role: "Obsidianユーザー", capability: "チェックボックスで完了切替",
      benefit: "ワンクリックで状態更新" }, acceptanceCriteria: [
      { criterion: "完了状態を未完了↔完了にトグルできる", verification: "pnpm vitest run -t 'toggle task completion status'" },
      { criterion: "完了時に今日の日付(YYYY-MM-DD)を自動付与する", verification: "pnpm vitest run -t 'add completion date when marking complete'" },
      { criterion: "未完了に戻す時に完了日を削除する", verification: "pnpm vitest run -t 'remove completion date when marking incomplete'" },
      { criterion: "トグル後のタスクをファイルに保存できる", verification: "pnpm vitest run -t 'save toggled task to file'" },
      { criterion: "View層でトグル後の表示を更新できる (統合テスト)", verification: "pnpm vitest run -t 'update view after toggle'" },
    ], dependencies: ["PBI-002"], status: "done" },
  { id: "PBI-004", story: { role: "Obsidianユーザー", capability: "新規タスク作成",
      benefit: "簡単に追加" }, acceptanceCriteria: [
      { criterion: "説明文のみで新規タスクを作成できる", verification: "pnpm vitest run -t 'create task with description only'" },
      { criterion: "作成時に今日の日付(YYYY-MM-DD)を自動付与する", verification: "pnpm vitest run -t 'auto-add creation date'" },
      { criterion: "優先度・プロジェクト・コンテキストを指定して作成できる", verification: "pnpm vitest run -t 'create task with optional fields'" },
      { criterion: "作成したタスクをファイル末尾に追加できる", verification: "pnpm vitest run -t 'append task to file'" },
      { criterion: "View層でタスク追加後の表示を更新できる (統合テスト)", verification: "pnpm vitest run -t 'update view after task creation'" },
    ], dependencies: ["PBI-002"], status: "ready" },
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
  number: 0, pbiId: null as string | null, story: "",
  status: "not_started" as SprintStatus, subtasks: [] as Subtask[], notes: "",
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
  { sprint: 2, pbi: "PBI-002", story: "todo.txtをパースしてタスク一覧表示",
    verification: "passed", notes: "TDDで6サブタスク完了(12コミット)、全DoD満たす" },
  { sprint: 3, pbi: "PBI-003", story: "チェックボックスで完了切替",
    verification: "passed", notes: "TDDで5サブタスク完了(9コミット: 5 Red + 5 Green + 1 Refactor)、全DoD満たす。受け入れ基準5項目すべて検証済: toggleCompletion(6テスト), serializeTodo(統合), updateTodoInList(4テスト), View統合(4テスト)。Tests: 57 passed, Lint: 0 errors, Types: passed, Build: success" },
];

// Retrospectives
export const retrospectives: Retrospective[] = [
  { sprint: 1,
    workedWell: ["TDD Red-Green-Refactor", "明確な受け入れ基準", "適切なサブタスク分割", "Obsidianパターン適用"],
    toImprove: ["モック設定の冗長性", "vitest機能活用", "サブタスク粒度基準"],
    actions: ["共通モックヘルパー作成", "vi.mock活用", "1 describe = 1 subtask基準"] },
  { sprint: 2,
    workedWell: [
      "TDD Red-Green-Refactorサイクルの徹底 (12コミット: 6 Red + 6 Green + Refactor)",
      "1 describe = 1 subtask構造の完璧な適用 (6サブタスク = 6 describe)",
      "包括的なテストカバレッジ (30テストケースでエッジケース網羅)",
      "型安全性の向上 (Refactorフェーズで型ガード追加)",
    ],
    toImprove: [
      "describeのネスト構造がない (フラットな構造で大規模時に整理困難)",
      "テストケース数の偏り (parse completion: 3 vs parse tags: 6)",
      "統合テストの不足 (個別関数は完璧だがView統合テストなし)",
    ],
    actions: [
      "describe階層化ルール: 複雑な機能は`describe > describe > it`の3層構造を許可",
      "統合テスト追加: View層でのparser統合テストをサブタスクに含める",
      "テストケース設計基準: 各describeに最低3ケース、最大7ケース目安",
    ] },
  { sprint: 3,
    workedWell: [
      "Sprint 2アクションの完全適用: describe階層化(toggleCompletionは2層、serializeTodoは3層)、統合テスト専用サブタスク、テストケース基準遵守",
      "高いテストカバレッジ: 24新規テスト追加で総計57テスト、serializeTodoで11ケースの包括的検証",
      "View統合テストの実装: parser連携を4テストケースで検証、実際の動作を確認",
      "エッジケース発見と修正: 実装中にdescription重複、完了タスク日付パース問題を発見・修正",
    ],
    toImprove: [
      "実装中のバグ修正: parserバグをGreenフェーズで修正、理想的にはRefactorフェーズで対応すべき",
      "サブタスク粒度の不均衡: serializeTodo(11テスト) vs updateTodoInList(4テスト)の差が大きい",
      "テスト構造の一貫性: toggleCompletionは2層、serializeTodoは3層と統一されていない",
    ],
    actions: [
      "バグ修正フェーズ明確化: 既存コードのバグはGreenフェーズで対応可、Refactorは構造改善に集中",
      "サブタスク分割基準見直し: 複雑度に応じて5-10テスト目安で分割、大きすぎる場合は複数サブタスクに",
      "describe階層ガイドライン: 関連テストが3個以下ならフラット、4個以上なら2層、10個以上なら3層",
    ] },
];

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
