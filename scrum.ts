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
  sprint: { number: 34, pbi: "PBI-031", status: "not_started" as SprintStatus,
    subtasksCompleted: 0, subtasksTotal: 0, impediments: 0 },
};

// Product Goal
export const productGoal = {
  statement: "Obsidian内でtodo.txt形式のファイルを直感的に管理・表示する",
  owner: "@scrum-team-product-owner",
};

// Product Backlog (Order = Priority) - done PBIs compacted, see git history
export const productBacklog: ProductBacklogItem[] = [
  // Phase 1-7: Sprint 1-32 完了（32 PBIs done）
  // PBI-001〜034 done: 専用ビュー/パース/CRUD/ソート/フィルタ/グループ/日付表示/リンク/rec:/pri:/設定/フォーム/UI統合/ドキュメント/Action返済/view.tsリファクタ/コントロールバー
  // Phase 7: UI機能実装継続（Sprint 33〜）
  // Sprint 33 Planning優先順位: PBI-033 > PBI-031
  // 理由: PBI-033はSprint 32ロジック実装済（UI化のみ）、externalDependencies 0、estimatedTests少
  // PBI-033 done in Sprint 33: コントロールバーUI化、aria-label追加、FilterState型エクスポート、542t達成
  {
    id: "PBI-031",
    story: { role: "user", capability: "内部/外部リンクのクリック可能表示", benefit: "関連リソースへ素早くアクセス" },
    acceptanceCriteria: [
      { criterion: "内部リンク", verification: "[[Note]]がクリック可能、クリックでノート開く" },
      { criterion: "外部リンク", verification: "http/https URLがクリック可能" },
      { criterion: "rec:表示", verification: "rec:タグに繰り返しアイコン表示" },
    ],
    dependencies: ["PBI-028"],
    status: "ready",
    complexity: { functions: 3, estimatedTests: 12, externalDependencies: 1, score: "MEDIUM", subtasks: 3 },
    refactorChecklist: [
      "REFACTOR率目標30%（Sprint 32 Action 4: 20-50%レンジ）",
      "Link解析ロジックとRenderingの分離",
      "Obsidian API呼び出しの抽象化（app.workspace.openLinkText）",
      "モック戦略: 単体テストvi.mock、統合テストLinkHandlerインターフェース抽象化",
      "Subtask構成: 内部リンク(4t) + 外部リンク(4t) + rec:表示(4t) = 12t",
    ],
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

// Current Sprint
export const currentSprint = {
  sprint: 34,
  pbi: "PBI-031",
  goal: "",
  status: "not_started" as SprintStatus,
  subtasks: [] as Subtask[],
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

// Completed Sprints - Phase 1-6 (Sprint 1-31) compacted, see git history for details
export const completedSprints: CompletedSprint[] = [
  // Phase 1-5 (Sprint 1-24): 基本機能+ドキュメント完了、438t達成
  // Phase 6 (Sprint 25-31): UI実装+Action返済+view.tsリファクタ完了
  { sprint: 25, pbi: "PBI-025", story: "基本UI描画", verification: "passed", notes: "443t" },
  { sprint: 26, pbi: "PBI-026", story: "タスク追加UI", verification: "passed", notes: "449t" },
  { sprint: 27, pbi: "PBI-027", story: "データ保持修正", verification: "passed", notes: "471t" },
  { sprint: 28, pbi: "PBI-028", story: "タスクUI操作", verification: "passed", notes: "490t" },
  { sprint: 29, pbi: "PBI-029", story: "due:/t:視覚表示", verification: "passed", notes: "502t" },
  { sprint: 30, pbi: "PBI-032", story: "Action返済Sprint", verification: "passed", notes: "504t,Action実行率50%" },
  { sprint: 31, pbi: "PBI-034", story: "view.ts層分離", verification: "passed", notes: "504t,view.ts258→126行(51%削減),handlers.ts87行+rendering.ts129行作成,REFACTOR率100%" },
  // Phase 7 (Sprint 32~): UI機能実装継続
  { sprint: 32, pbi: "PBI-030", story: "コントロールバー", verification: "passed", notes: "533t(+29t),TDD完全適用(9commit:RED4+GREEN4+REFACTOR3),REFACTOR率50%,controlbar.test.ts29t追加,FilterState型導入,CRUD後状態維持実装" },
  { sprint: 33, pbi: "PBI-033", story: "コントロールバーUI", verification: "passed", notes: "542t(+9t),aria-label追加でアクセシビリティ向上,FilterState型&DEFAULT_FILTER_STATE定数エクスポート,TDD適用(4commit:RED3+REFACTOR2),REFACTOR率50%(2/4),controlbar.test.ts38t(+9)" },
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  { sprint: 33,
    workedWell: [
      "Sprint 32 Actions全達成: subtask粒度3件適用、PBI優先順位明文化、REFACTOR率50%達成（目標30%超過）",
      "アクセシビリティ向上: aria-label追加で全コントロールバー要素がスクリーンリーダー対応",
      "型安全性向上継続: FilterState型とDEFAULT_FILTER_STATE定数エクスポートで再利用性向上",
      "TDD適用継続: 4コミット（RED 3 + REFACTOR 2）でサイクル維持",
    ],
    toImprove: [
      "GREEN phaseなし: 既存実装で満たされたためGREENコミット0件、TDDサイクル不完全",
      "テスト増加+9は目標+10未達: 僅差だが計画精度向上余地あり",
    ],
    actions: [
      "Sprint 34でPBI-031完了: 最後のready PBI、Phase 7完了目標",
      "Obsidian API統合テスト: externalDependencies 1のためモック戦略検討",
    ] },
];

// Action Management (Sprint 33でSprint 32 Actions 4件達成)
export const actionManagement = {
  kpi: { min: 50, healthy: 70, excellent: 90 },
  tracking: { total: 18, executed: 16, rate: 89, remaining: 2 }, // Sprint 33: Sprint32の4件Action達成
};

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
