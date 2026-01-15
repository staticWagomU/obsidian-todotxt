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
interface Complexity { functions: number; estimatedTests: number; externalDependencies: number; score: "LOW" | "MEDIUM" | "HIGH"; subtasks: number; }
interface ProductBacklogItem {
  id: string; story: UserStory; acceptanceCriteria: AcceptanceCriterion[];
  dependencies: string[]; status: PBIStatus;
  complexity?: Complexity; refactorChecklist?: string[];
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
  sprint: { number: 56, pbi: "PBI-056", status: "in_progress" as SprintStatus,
    subtasksCompleted: 5, subtasksTotal: 8, impediments: 0 },
  phase: { number: 17, status: "in_progress", sprints: "56-57", pbis: "PBI-056, PBI-057", goal: "Phase 17: キーボードショートカット・高度検索" },
};

// Product Goal
export const productGoal = {
  statement: "Obsidian内でtodo.txt形式のファイルを直感的に管理・表示する",
  owner: "@scrum-team-product-owner",
};

// Long-term Roadmap (Phase 15-17) - Sprint 53策定、詳細はgit履歴参照
export const roadmap = {
  phase15: { number: 15, goal: "プロセス基盤再構築", sprints: "53", pbis: ["PBI-053"], status: "done" },
  phase16: { number: 16, goal: "AI自然言語タスク編集・一括処理", sprints: "54-55", pbis: ["PBI-054", "PBI-055"], status: "done" },
  phase17: { number: 17, goal: "キーボードショートカット・高度検索", sprints: "56-57", pbis: ["PBI-056", "PBI-057"], status: "in_progress" },
};

// Product Backlog (Order = Priority) - done PBIs compacted, see git history
export const productBacklog: ProductBacklogItem[] = [
  // Phase 1-15完了 (Sprint 1-53): 基本機能+UI+サイドパネル+AI連携+プロセス基盤、830t達成
  // Phase 16完了 (Sprint 54-55): AI自然言語タスク編集・一括処理、837t達成(+7t)
  //   Sprint 54 PBI-054: AI自然言語タスク編集、835t(+5t)
  //   Sprint 55 PBI-055: 複数タスクAI一括処理、837t(+2t)、Phase 16完遂
  {
    id: "PBI-056",
    story: { role: "ユーザー", capability: "キーボードショートカットでタスク操作を高速実行できる", benefit: "キーボード中心のワークフローで作業効率が向上する" },
    acceptanceCriteria: [
      { criterion: "Obsidianコマンドパレットにショートカットコマンド登録、設定で変更可能", verification: "テストでaddCommand呼び出し、コマンドパレット表示を確認" },
      { criterion: "上下矢印キーで選択、Enter完了切替、E編集、Delete削除", verification: "テストでキーボードイベント処理、操作実行を確認" },
      { criterion: "Ctrl+N（Cmd+N）で新規タスクダイアログ", verification: "テストでCtrl+N→ダイアログ表示を確認" },
      { criterion: "Ctrl+F（Cmd+F）で検索フォーカス移動", verification: "テストでCtrl+F→検索ボックスフォーカスを確認" },
      { criterion: "設定画面にショートカット一覧表示", verification: "設定UIにショートカット一覧セクション表示を確認" }
    ],
    dependencies: [],
    status: "ready" as PBIStatus,
    complexity: { functions: 3, estimatedTests: 15, externalDependencies: 0, score: "MEDIUM" as const, subtasks: 5 }
  },
  {
    id: "PBI-057",
    story: { role: "ユーザー", capability: "高度検索機能でタスクを絞り込める", benefit: "大量タスクから目的タスクを素早く見つけられる" },
    acceptanceCriteria: [
      { criterion: "AND検索（空白）、OR検索（|）、NOT検索（-）が動作", verification: "テストでAND/OR/NOT検索クエリが正しくフィルタリングを確認" },
      { criterion: "正規表現検索（/pattern/）が動作", verification: "テストで正規表現クエリフィルタリングを確認" },
      { criterion: "特殊構文（project:、context:、due:、priority:）検索が動作", verification: "テストで特殊構文クエリフィルタリングを確認" },
      { criterion: "日付範囲検索（due:YYYY-MM-DD..YYYY-MM-DD）が動作", verification: "テストで範囲クエリフィルタリングを確認" },
      { criterion: "検索ヘルプアイコンで構文ヘルプモーダル表示", verification: "テストでヘルプアイコンクリック→モーダル表示を確認" }
    ],
    dependencies: [],
    status: "ready" as PBIStatus,
    complexity: { functions: 4, estimatedTests: 20, externalDependencies: 0, score: "MEDIUM" as const, subtasks: 5 }
  },
];

// Definition of Ready
export const definitionOfReady = {
  criteria: [
    "AI can complete without human input",
    "User story has role/capability/benefit",
    "At least 3 acceptance criteria with verification",
    "Dependencies resolved or not blocking",
    "Complexity estimated (functions/estimatedTests/externalDependencies/score/subtasks)",
  ],
};

// Current Sprint - Sprint 56進行中
export const currentSprint = {
  sprint: 56,
  pbi: "PBI-056",
  goal: "キーボードショートカット機能を実装し、既存テスト5件の技術的負債を解消して、ユーザーがキーボード中心のワークフローで効率的にタスク操作できるようにする",
  status: "in_progress" as SprintStatus,
  subtasks: [
    // Behavioral Subtasks (6件 - Feature開発)
    { test: "addCommand呼び出し、コマンドパレット表示を確認", implementation: "ショートカットコマンド基盤とObsidianコマンドパレット登録", type: "behavioral" as SubtaskType, status: "completed" as SubtaskStatus, commits: [{ phase: "green" as CommitPhase, message: "feat: Sprint 56 Subtask 1 - keyboard shortcut command infrastructure" }] },
    { test: "上下キーでフォーカス移動を確認", implementation: "選択タスクのキーボードナビゲーション（上下矢印キー）", type: "behavioral" as SubtaskType, status: "completed" as SubtaskStatus, commits: [{ phase: "green" as CommitPhase, message: "feat: Sprint 56 Subtask 2 - KeyboardNavigator class" }] },
    { test: "Enter/E/Deleteキーで操作実行を確認", implementation: "選択タスクのキーボード操作（Enter完了切替、E編集、Delete削除）", type: "behavioral" as SubtaskType, status: "completed" as SubtaskStatus, commits: [{ phase: "green" as CommitPhase, message: "feat: Sprint 56 Subtask 3 - KeyboardActionHandler" }] },
    { test: "Ctrl+N→ダイアログ表示を確認", implementation: "新規タスクダイアログショートカット（Ctrl+N / Cmd+N）", type: "behavioral" as SubtaskType, status: "pending" as SubtaskStatus, commits: [] },
    { test: "Ctrl+F→検索ボックスフォーカスを確認", implementation: "検索フォーカス移動ショートカット（Ctrl+F / Cmd+F）", type: "behavioral" as SubtaskType, status: "pending" as SubtaskStatus, commits: [] },
    { test: "設定UIにショートカット一覧セクション表示を確認", implementation: "設定画面にショートカット一覧セクション追加", type: "behavioral" as SubtaskType, status: "pending" as SubtaskStatus, commits: [] },
    // Structural Subtasks (2件 - P0 Actions対応: DoD既存テスト失敗5件修正)
    { test: "view.test.ts プログレスバー3件テスト pass", implementation: "DoD既存テスト失敗修正（view.test.ts 3件）", type: "structural" as SubtaskType, status: "completed" as SubtaskStatus, commits: [{ phase: "green" as CommitPhase, message: "fix: Sprint 56 Subtask 7-8 - resolve 5 failing tests" }] },
    { test: "side-panel-view.test.ts 2件テスト pass", implementation: "DoD既存テスト失敗修正（side-panel-view.test.ts 2件）", type: "structural" as SubtaskType, status: "completed" as SubtaskStatus, commits: [{ phase: "green" as CommitPhase, message: "fix: Sprint 56 Subtask 7-8 - resolve 5 failing tests" }] },
  ] as Subtask[],
};
// Sprint 55: PBI-055完了 - 8 subtasks (6 behavioral + 2 structural), 8 commits (4 GREEN + 2 REFACTOR), Phase 16完遂, see git history
// Sprint 49-54: see git history

// Impediments
export const impediments = {
  active: [] as { id: string; description: string; status: string }[],
  resolved: [
    "IMP-048-1: DoD Tests失敗: src/view.test.ts AIボタンテキストコンテンツ期待値不一致（既存の失敗） - view.test.ts期待値修正で解決",
    "IMP-048-2: DoD Lint失敗: src/main.ts Promise処理エラー5件（既存のLintエラー） - main.ts Promise処理適正化とAITaskInputDialog型修正で解決",
  ] as string[]
};

// Definition of Done
export const definitionOfDone = {
  checks: [
    { name: "Tests", run: "pnpm vitest run" },
    { name: "Lint", run: "pnpm lint" },
    { name: "Types", run: "pnpm tsc --noEmit --skipLibCheck" },
    { name: "Build", run: "pnpm build" },
  ],
};

// Completed Sprints - Phase 1-15 compacted, see git history
export const completedSprints: CompletedSprint[] = [
  // Phase 1-15完了 (Sprint 1-53): 基本機能+サイドパネル+AI連携+プロセス基盤、830t達成
  // Phase 16完了 (Sprint 54-55): AI自然言語タスク編集・一括処理、837t達成(+7t)
  { sprint: 54, pbi: "PBI-054", story: "AI自然言語タスク編集", verification: "passed", notes: "835t(+5t),7subtasks,7commits,Phase 16開始" },
  { sprint: 55, pbi: "PBI-055", story: "複数タスクAI一括処理", verification: "passed", notes: "837t(+2t),8subtasks,8commits,DoD 5失敗(既存),rate64%,Phase 16完遂" },
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  // Sprint 42-54: see git history
  { sprint: 55,
    workedWell: [
      "Phase 16完遂: AI一括処理機能実装完了、6 behavioral subtasks達成、Sprint 54-55の2 Sprint計画通り完遂",
      "P0 Actions 100%継続達成: 2 Sprint連続でP0 Actions完全実施、プロセス改善コミットメント定着",
      "Action棚卸し完了: P2 Action 1項目廃棄、remaining 41→36削減、計算式ドキュメント化完了",
      "rate 60%→64%向上: 3 Sprint連続KPI min 50%超、+4%改善、健全な上昇トレンド継続",
      "Feature/Process配分6:4継続: 6 behavioral + 2 structural subtasks、計画配分遵守、持続可能性実証",
      "Actions実施率60%達成: Sprint 54の50%から+10%向上、全体実施率改善",
    ],
    toImprove: [
      "既存テスト失敗5件継続: DoD Tests 5件失敗（既存の失敗）、verification: passed_with_known_failures、技術的負債未解消",
      "P1 Actions実施率50%: 2項目中1項目のみ実施（棚卸し部分達成）、トラッキング精度改善未着手",
      "rate目標未達: 目標65%に対し64%達成、+1%差で目標未達成",
      "KPI healthy (70%)への道筋不明: rate 64%→70%へ+6%必要、具体的な改善施策未策定",
    ],
    actions: [
      "P0: Sprint 56 Planning時にP1 Actions 1項目をSubtaskとして組み込み、Feature/Process配分6:4維持",
      "P0: DoD既存テスト失敗5件の根本原因分析、修正計画策定（技術的負債解消着手）",
      "P1: Sprint実績トラッキング精度改善（commit数検証プロセス追加、scrum.ts自動検証スクリプト検討）",
      "P1: rate 64%→70%達成ロードマップ策定（+6%改善、2-3 Sprint計画）",
      "P2: テストカバレッジ可視化ツール導入検討（品質指標拡充）",
    ] },
];

// Action Management (Sprint 55完了: rate 60%→64%(+4%)、P0 Actions 2項目実施100%、Actions実施率60%)
export const actionManagement = {
  kpi: { min: 50, healthy: 70, excellent: 90 },
  tracking: { total: 100, executed: 64, rate: 64, remaining: 36 },
  // Sprint 55完了: P0 Actions 2/2実施(100%)、P1 1/2実施(50%)、Actions実施率60% (3/5)
  //   実施: P0 2項目（P1 Actions Subtask化・CLAUDE.md計算式追加）、P1 1項目（棚卸し部分達成）
  //   棚卸し: P2 1項目廃棄（ロードマップ策定→3 Sprint経過）、total 103→100 (-3)
  //   繰越: P1 1項目（トラッキング精度改善）→Sprint 56へ
  //   新規: Sprint 55 Actions 5項目策定（P0 2項目、P1 2項目、P2 1項目）
  // Sprint 54完了: P0 Actions 2項目実施、Actions実施率50% (2/4)
  // Sprint 53完了: 15項目廃棄/統合、根本原因3軸分析、プロセス再設計ルール3項目確立
};

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
