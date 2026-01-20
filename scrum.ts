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
  sprint: { number: 68, pbi: "PBI-067", status: "done" as SprintStatus,
    subtasksCompleted: 5, subtasksTotal: 5, impediments: 0 },
  phase: { number: 19, status: "in_progress", sprints: "66-69", pbis: "PBI-065, PBI-066, PBI-067, PBI-068", goal: "Phase 19: 生産性向上・Obsidian統合" },
};

// Product Goal
export const productGoal = {
  statement: "Obsidian内でtodo.txt形式のファイルを直感的に管理・表示する",
  owner: "@scrum-team-product-owner",
};

// Long-term Roadmap (Phase 15-19) - Sprint 53策定、詳細はgit履歴参照
export const roadmap = {
  phase15: { number: 15, goal: "プロセス基盤再構築", sprints: "53", pbis: ["PBI-053"], status: "done" },
  phase16: { number: 16, goal: "AI自然言語タスク編集・一括処理", sprints: "54-55", pbis: ["PBI-054", "PBI-055"], status: "done" },
  phase17: { number: 17, goal: "キーボードショートカット・高度検索", sprints: "56-57", pbis: ["PBI-056", "PBI-057"], status: "done" },
  phase18: { number: 18, goal: "UX強化・パフォーマンス最適化", sprints: "58-65", pbis: ["PBI-064", "PBI-058", "PBI-059", "PBI-060", "PBI-061", "PBI-062", "PBI-063"], status: "done" },
  phase19: { number: 19, goal: "生産性向上・Obsidian統合", sprints: "66-69", pbis: ["PBI-065", "PBI-066", "PBI-067", "PBI-068"], status: "in_progress" },
};

// Product Backlog (Order = Priority) - done PBIs compacted, see git history
export const productBacklog: ProductBacklogItem[] = [
  // Phase 1-15完了 (Sprint 1-53): 基本機能+UI+サイドパネル+AI連携+プロセス基盤、830t達成
  // Phase 16完了 (Sprint 54-55): AI自然言語タスク編集・一括処理、837t達成(+7t)
  // Phase 17完了 (Sprint 56-57): キーボードショートカット・高度検索、929t達成(+92t)
  //   Sprint 56 PBI-056: キーボードショートカット、879t(+42t)、Phase 17開始
  //   Sprint 57 PBI-057: 高度検索機能、929t(+50t)、Phase 17完遂

  // Phase 18: UX強化・パフォーマンス最適化
  // PBI-064: インライン入力欄でタスク追加 - Sprint 58-59完了、931t(+2t)、see git history
  // PBI-058: インライン編集機能 - Sprint 60完了、974t(+43t)、see git history
  // PBI-059: Undo/Redo機能 - Sprint 61完了、1008t(+34t)、see git history
  // PBI-060: フィルター保存機能 - Sprint 62完了、1076t(+68t)、史上最大テスト増加量、see git history
  // PBI-061: コンテキストメニュー機能 - Sprint 63完了、1140t(+64t)、Phase 18で2番目テスト増加、see git history
  // PBI-063: パフォーマンス最適化 - Sprint 64完了、1220t(+80t)、see git history
  // PBI-062: キーボードショートカットカスタマイズ - Sprint 65完了、1287t(+67t)、Phase 18完遂、see git history

  // Phase 19: 生産性向上・Obsidian統合
  // PBI-065: フォーカスビュー機能 - Sprint 66完了、1325t(+38t)、see git history
  // PBI-066: テンプレート機能 - Sprint 67完了、1356t(+31t)、see git history
  // PBI-067: AIタスク分解機能 - Sprint 68完了、1399t(+43t)、see git history
  {
    id: "PBI-068",
    story: {
      role: "Obsidianデイリーノートユーザー",
      capability: "今日のタスクをデイリーノートに挿入、デイリーノートからタスクをインポート",
      benefit: "日次レビューとタスク管理が統合され、ワークフローが効率化される"
    },
    acceptanceCriteria: [
      { criterion: "今日のタスクをデイリーノートに挿入できる", verification: "manual" },
      { criterion: "デイリーノートのチェックボックスからタスクをインポートできる", verification: "manual" },
      { criterion: "挿入位置（見出し後/先頭/末尾）を設定で選択できる", verification: "vitest" },
      { criterion: "Daily Notesプラグインが無効時は適切なエラーメッセージを表示", verification: "vitest" },
      { criterion: "タスクの完了状態が双方向同期される（オプション）", verification: "manual" },
    ],
    dependencies: ["obsidian-daily-notes-interface"],
    status: "draft" as PBIStatus,
    complexity: { functions: 6, estimatedTests: 20, externalDependencies: 1, score: "MEDIUM" as const, subtasks: 7 },
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

// Current Sprint - Sprint 68完了、Sprint 69待機
export const currentSprint = {
  sprint: 68,
  pbi: "PBI-067",
  goal: "AIによるタスク分解機能を実装し、大きなタスクを実行可能なサブタスクに分解できるようにする",
  status: "done" as SprintStatus,
  subtasks: [] as (Subtask & { ac: string[] })[],
  // Sprint 68: 5 subtasks完了、10 commits (5 RED + 5 GREEN)、DoD全pass、AC全達成(5/5)、1399t(+43t)
};
// Sprint 66-67: see git history

// Impediments
export const impediments = {
  active: [] as { id: string; description: string; status: string }[],
  resolved: [
    "IMP-058-1: AC未達成: view.tsでonInlineAddコールバックがrenderTaskListに渡されていない - Sprint 59でview.ts修正により解決",
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

// Completed Sprints - Phase 1-17 compacted, see git history
export const completedSprints: CompletedSprint[] = [
  // Phase 1-17完了 (Sprint 1-57): 基本機能+サイドパネル+AI連携+プロセス基盤+キーボードショートカット+高度検索、929t達成
  // Phase 18完了 (Sprint 58-65): UX強化・パフォーマンス最適化、1287t達成(+358t)
  { sprint: 65, pbi: "PBI-062", story: "キーボードショートカットカスタマイズ", verification: "passed", notes: "1287t(+67t),DoD全pass,Phase 18完遂" },
  { sprint: 66, pbi: "PBI-065", story: "フォーカスビュー機能", verification: "passed", notes: "1325t(+38t),DoD全pass,AC全達成,Phase 19開始" },
  { sprint: 67, pbi: "PBI-066", story: "テンプレート機能", verification: "passed", notes: "1356t(+31t),DoD全pass,AC全達成(5/5)" },
  { sprint: 68, pbi: "PBI-067", story: "AIタスク分解機能", verification: "passed", notes: "1399t(+43t),DoD全pass,AC全達成(5/5),13Sprint連続pass" },
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  // Sprint 42-67: see git history
  { sprint: 68,
    workedWell: [
      "13 Sprint連続DoD全pass達成: Sprint 56-68の長期継続、史上最長記録を更新継続",
      "テスト増加量回復: +43t（1356t→1399t）前Sprint +31tから改善",
      "AC全達成（5/5項目）: vitest/manual検証組み合わせで完全達成",
      "TDD徹底: 5 subtasks × 2 commits（RED/GREEN）= 10 commits、高品質実装完了",
      "P0 Action完全実施: PBI-067 complexity再評価、subtasks 6→5調整成功",
    ],
    toImprove: [
      "P1 Action未実施: P2 Actions廃棄判断が2 Sprint継続、優先度管理改善必要",
      "Phase 19残り1 PBI: PBI-068のみ残り、complexity MEDIUM、Sprint 69で完遂必要",
    ],
    actions: [
      "P0: Sprint 69 PlanningでPBI-068 subtasks定義、complexity再評価（Sprint 69 Planning時）",
      "P1: P2 Actions廃棄判断（rendering.ts統合等、Sprint 69 Planning前）",
      "P2: Phase 20 Goal策定（Sprint 69完了後、Phase 19振り返りベース）",
    ] },
];

// Action Management (Sprint 68完了: rate 77%、healthy KPI継続)
export const actionManagement = {
  kpi: { min: 50, healthy: 70, excellent: 90 },
  tracking: { total: 106, executed: 82, rate: 77, remaining: 24 },
  // Sprint 68: P0 Action 1項目実施（complexity再評価）、Actions 3項目追加、rate維持
  // Sprint 59-67: see git history
};

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
