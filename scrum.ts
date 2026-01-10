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
  sprint: { number: 32, pbi: "N/A", status: "not_started" as SprintStatus,
    subtasksCompleted: 0, subtasksTotal: 0, impediments: 0 },
};

// Product Goal
export const productGoal = {
  statement: "Obsidian内でtodo.txt形式のファイルを直感的に管理・表示する",
  owner: "@scrum-team-product-owner",
};

// Product Backlog (Order = Priority) - done PBIs compacted, see git history
export const productBacklog: ProductBacklogItem[] = [
  // Phase 1-6: Sprint 1-31 完了（31 PBIs done）
  // PBI-001〜034 done: 専用ビュー/パース/CRUD/ソート/フィルタ/グループ/日付表示/リンク/rec:/pri:/設定/フォーム/UI統合/ドキュメント/Action返済/view.tsリファクタ
  // Phase 7: UI機能実装継続（Sprint 32〜）
  // 優先順位理由: 030=033依存元/031=独立機能/033=030依存
  {
    id: "PBI-030",
    story: { role: "user", capability: "コントロールバーによるフィルタ・ソート・グループ", benefit: "タスク整理と絞込" },
    acceptanceCriteria: [
      { criterion: "優先度フィルタ", verification: "ドロップダウンで優先度フィルタ動作" },
      { criterion: "テキスト検索", verification: "検索ボックスでリアルタイム絞込" },
      { criterion: "グループ化", verification: "プロジェクト/コンテキスト/優先度でグループ表示" },
      { criterion: "ソート", verification: "未完了→完了、優先度順、テキスト順でソート" },
    ],
    dependencies: ["PBI-028"],
    status: "ready",
    complexity: { functions: 4, estimatedTests: 15, externalDependencies: 0, score: "MEDIUM", subtasks: 5 },
  },
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
    complexity: { functions: 3, estimatedTests: 12, externalDependencies: 1, score: "MEDIUM", subtasks: 5 },
  },
  {
    id: "PBI-033",
    story: { role: "user", capability: "コントロールバーUI", benefit: "フィルタ・ソート・グループ操作" },
    acceptanceCriteria: [
      { criterion: "フィルタUI", verification: "優先度/完了状態ドロップダウン表示、選択で絞込動作" },
      { criterion: "検索UI", verification: "テキスト入力ボックス表示、入力でリアルタイム検索" },
      { criterion: "ソート/グループUI", verification: "ソート順・グループ化切替ボタン表示、クリックで表示変更" },
    ],
    dependencies: ["PBI-030"],
    status: "refining",
    complexity: { functions: 3, estimatedTests: 10, externalDependencies: 0, score: "MEDIUM", subtasks: 5 },
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

// Current Sprint (Sprint 31完了、次Sprint未開始)
export const currentSprint = {
  sprint: 0,
  pbi: "",
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
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  { sprint: 31,
    workedWell: [
      "目標大幅超過達成: view.ts削減51%（258→126行）、目標150行以下を大幅クリア、handlers.ts 87行+rendering.ts 129行分離完了",
      "REFACTOR率100%達成: 目標20%の5倍、全4 subtaskをrefactor commitで完了、Phase 6で最高率記録",
      "Clean Architecture実現: handlers層（イベント処理）・rendering層（UI描画）の責務分離、保守性大幅向上",
      "テスト維持率100%: 504 tests全pass維持、リファクタリングで振る舞い変更なし完全保証",
      "Phase 6完全達成: 31 PBIs完了、基盤構築6フェーズ構成完了、Phase 7 UI機能実装準備完了",
    ],
    toImprove: [
      "structural型subtask偏重: 全4 subtaskがstructural型、behavioral型0件で新機能なし",
      "単一commit集約: 4 subtaskを1コミットで完了、TDD Red-Green-Refactorサイクル不適用",
      "Action消化0件: Sprint 30の残5件Action未消化、累積負債持ち越し継続",
      "PBI-034優先度判断: 機能実装（030/031/033）より優先したことの機会コスト検証必要",
    ],
    actions: [
      "Phase 7 UI機能実装フォーカス: Sprint 32からPBI-030/031/033順で機能実装優先、REFACTOR率20%維持",
      "TDD Red-Green-Refactorサイクル適用: behavioral型PBIでcommit分割（Red→Green→Refactor）徹底",
      "Action管理プロセス再起動: Sprint 30の残5件Action評価、Sprint 32 Planningで優先度付け",
      "統合テスト拡充継続: PBI-030/031で+2ケース目標、UI操作→データ保持フロー検証強化",
    ] },
];

// Action Management (Sprint 30確立、Sprint 31でAction2達成)
export const actionManagement = {
  kpi: { min: 50, healthy: 70, excellent: 90 },
  tracking: { total: 10, executed: 8, rate: 80, remaining: 2 }, // Sprint 31: REFACTOR率100%+Phase6優先順位で+2
};

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
