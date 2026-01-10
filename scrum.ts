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
  sprint: { number: 30, pbi: "PBI-032", status: "done" as SprintStatus,
    subtasksCompleted: 5, subtasksTotal: 5, impediments: 0 },
};

// Product Goal
export const productGoal = {
  statement: "Obsidian内でtodo.txt形式のファイルを直感的に管理・表示する",
  owner: "@scrum-team-product-owner",
};

// Product Backlog (Order = Priority) - done PBIs compacted, see git history
export const productBacklog: ProductBacklogItem[] = [
  // Phase 1-6: COMPLETE (Sprint 1-30) - 30 PBIs done, see completedSprints
  // PBI-001〜032 done: 専用ビュー/パース/CRUD/ソート/フィルタ/グループ/日付表示/リンク/rec:/pri:/設定/フォーム/UI統合/ドキュメント/Action返済
  // Phase 6: 継続UI機能実装
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
  {
    id: "PBI-034",
    story: { role: "dev", capability: "view.tsをhandlers/rendering層に分離", benefit: "300行超回避と保守性向上" },
    acceptanceCriteria: [
      { criterion: "handlers分離", verification: "getToggleHandler等4メソッドをsrc/lib/handlers.ts化、view.tsから参照" },
      { criterion: "rendering分離", verification: "renderTaskList()をsrc/lib/rendering.ts化、view.tsは200行以下に削減" },
      { criterion: "既存テスト全通過", verification: "リファクタリング後も504tests全pass維持、振る舞い変更なし確認" },
    ],
    dependencies: [],
    status: "ready",
    complexity: { functions: 2, estimatedTests: 0, externalDependencies: 0, score: "LOW", subtasks: 3 },
    refactorChecklist: [
      "src/lib/handlers.ts作成 - 4 handler functions移動 (getToggleHandler/getAddHandler/getEditHandler/getDeleteHandler)",
      "src/lib/rendering.ts作成 - renderTaskList()移動 (150行の大規模メソッド分離)",
      "view.ts import更新、244行→150行以下目標 (40%削減)",
      "既存テスト全通過確認 (504 tests = Sprint 30現在、統合テスト2件追加済)",
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

// Current Sprint (Sprint 30 completed, no active sprint)
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

// Completed Sprints - Phase 1-6 (Sprint 1-30) compacted, see git history for details
export const completedSprints: CompletedSprint[] = [
  // Phase 1-5 (Sprint 1-24): 基本機能+ドキュメント完了、438t達成
  // Phase 6 (Sprint 25-30): UI実装+Action返済
  { sprint: 25, pbi: "PBI-025", story: "基本UI描画", verification: "passed", notes: "443t" },
  { sprint: 26, pbi: "PBI-026", story: "タスク追加UI", verification: "passed", notes: "449t" },
  { sprint: 27, pbi: "PBI-027", story: "データ保持修正", verification: "passed", notes: "471t" },
  { sprint: 28, pbi: "PBI-028", story: "タスクUI操作", verification: "passed", notes: "490t" },
  { sprint: 29, pbi: "PBI-029", story: "due:/t:視覚表示", verification: "passed", notes: "502t" },
  { sprint: 30, pbi: "PBI-032", story: "Action返済Sprint", verification: "passed", notes: "504t,Action実行率50%" },
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  { sprint: 30,
    workedWell: [
      "Action返済Sprint成功: 累積10件中5件実行、統合テスト2ケース追加、Action管理プロセス確立、PBI-034作成",
      "統合テスト文化立ち上げ: view.test.ts統合テスト追加、UI操作→データ保持フロー検証基盤確立",
      "Action管理プロセス体系化: KPI設定（50%/70%/90%）・evaluationProcess・変換ガイドライン完備",
    ],
    toImprove: [
      "Action実行率50%は最低基準、健全目標70%未達、残5件累積Action持ち越し",
      "REFACTOR率16.7%、目標20%に3.3pt不足、TDD+構造改善両立パターン未完成",
      "統合テスト最小MVP止まり、包括的戦略・共通基盤未構築",
    ],
    actions: [
      "Action実行率70%目標: 残5件消化継続、Sprint 32までに累積負債完全解消",
      "REFACTOR率20%以上継続: 全Sprintで最低1 refactoring subtask必須化",
      "統合テスト追加ルール: 各UI機能PBIで+1-2ケース必須化",
      "Phase 6 PBI優先順位調整: Sprint 31 Planningで030/031/033/034実施順序決定",
    ] },
];

// Action Management (Sprint 30確立)
export const actionManagement = {
  kpi: { min: 50, healthy: 70, excellent: 90 }, // Action実行率目標（%）
  tracking: { total: 10, executed: 5, rate: 50 }, // Sprint 30完了時点
  evaluationProcess: "Sprint Planning時にAction評価→High優先度1+Sprint工数→PBI化",
};

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
