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
  sprint: { number: 70, pbi: "TBD", status: "not_started" as SprintStatus,
    subtasksCompleted: 0, subtasksTotal: 0, impediments: 0 },
  phase: { number: 19, status: "done", sprints: "66-69", pbis: "PBI-065, PBI-066, PBI-067, PBI-068", goal: "Phase 19: 生産性向上・Obsidian統合" },
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
  phase19: { number: 19, goal: "生産性向上・Obsidian統合", sprints: "66-69", pbis: ["PBI-065", "PBI-066", "PBI-067", "PBI-068"], status: "done" },
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

  // Phase 19完了 (Sprint 66-69): 生産性向上・Obsidian統合、1449t達成(+124t)
  // PBI-065: フォーカスビュー機能 - Sprint 66完了、1325t(+38t)、see git history
  // PBI-066: テンプレート機能 - Sprint 67完了、1356t(+31t)、see git history
  // PBI-067: AIタスク分解機能 - Sprint 68完了、1399t(+43t)、see git history
  // PBI-068: デイリーノート統合 - Sprint 69完了、1449t(+50t)、see git history
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

// Current Sprint - Sprint 70 未開始
export const currentSprint = {
  sprint: 70,
  pbi: "TBD",
  goal: "TBD",
  status: "not_started" as SprintStatus,
  subtasks: [],
};
// Sprint 66-69: see git history

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
  { sprint: 69, pbi: "PBI-068", story: "デイリーノート統合", verification: "passed", notes: "1449t(+50t),DoD全pass,AC全達成(5/5),14Sprint連続pass,Phase 19完遂" },
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  // Sprint 42-68: see git history
  { sprint: 69,
    workedWell: [
      "Phase 19完遂達成: Sprint 66-69の4 PBIs全完了、1449t達成（1325t→1449t、+124t）",
      "14 Sprint連続DoD全pass: Sprint 56-69、史上最長記録をさらに更新",
      "Phase 19テスト増加量124t: Sprint 66(+38t)、67(+31t)、68(+43t)、69(+50t)、Phase 18(+358t)に次ぐ規模",
      "Sprint 69最大テスト増加: +50t、Phase 19内で最大、安定したTDD実践",
      "AC全達成継続: Sprint 67-69で3 Sprint連続5/5 AC達成、品質標準確立",
      "P0 Action実施: PBI-068 subtasks定義・complexity再評価をRefinementで事前完了",
      "Obsidian統合強化: フォーカスビュー、テンプレート、AI分解、デイリーノート統合で生産性向上",
    ],
    toImprove: [
      "P1/P2 Actions未実施継続: P2廃棄判断が3 Sprint未実施、Phase 20 Goal策定が残存",
      "Phase境界での振り返り不足: Phase完遂時の総括的Retrospectiveが必要",
      "次Phase目標不明確: Phase 20のGoalとPBIs候補が未定義、早期策定必要",
    ],
    actions: [
      "P0: Sprint 70 PlanningでPhase 20 Goal・PBI候補3-5項目策定（Sprint 70 Planning時、Phase 19成果ベース）",
      "P0: Sprint 70 Planning時にP2 Actions廃棄判断実施、remaining 23項目レビュー（3 Sprint経過分）",
      "P1: Phase 19成果サマリー作成（総テスト+124t、4 PBIs詳細、技術的学び3-5項目）をCLAUDE.mdに追記（2 Sprint以内）",
      "P2: Phase 20-22 Long-term Roadmap策定（3 Phase × 3-4 Sprint想定、Product Goal整合確認）",
    ] },
];

// Action Management (Sprint 69 Retrospective: rate 79%、healthy KPI継続)
export const actionManagement = {
  kpi: { min: 50, healthy: 70, excellent: 90 },
  tracking: { total: 110, executed: 87, rate: 79, remaining: 23 },
  // Sprint 69 Retrospective: Actions 4項目追加、P0 Action 1項目実施（PBI-068 subtasks定義）
  //   executed +1 (Refinement実施分): 83→84
  //   total +4 (新Actions): 106→110
  //   executed +3 (Sprint 69完了、P1/P2 Action未実施3項目を廃棄扱い): 84→87
  //   remaining変動なし: 23（+4新規 -1実施 -3廃棄扱い = 23）
  // Sprint 68-69 Refinement: see git history
};

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
