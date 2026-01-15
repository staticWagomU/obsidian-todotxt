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
  sprint: { number: 56, pbi: "PBI-056", status: "done" as SprintStatus,
    subtasksCompleted: 8, subtasksTotal: 8, impediments: 0 },
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
  // Phase 17進行中 (Sprint 56-57): キーボードショートカット・高度検索
  //   Sprint 56 PBI-056: キーボードショートカット、879t(+42t)、Phase 17開始
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

// Current Sprint - Sprint 56完了、次Sprint待機
export const currentSprint = {
  sprint: 0,
  pbi: "",
  goal: "",
  status: "not_started" as SprintStatus,
  subtasks: [] as Subtask[],
};
// Sprint 56: PBI-056完了 - 8 subtasks (6 behavioral + 2 structural), 6 commits, DoD全pass, Phase 17開始, see git history
// Sprint 49-55: see git history

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
  { sprint: 56, pbi: "PBI-056", story: "キーボードショートカット機能", verification: "passed", notes: "879t(+42t),8subtasks,6commits,DoD全pass,Phase 17開始" },
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  // Sprint 42-55: see git history
  { sprint: 56,
    workedWell: [
      "テスト大幅増加: 837t→879t(+42件)、過去最大増加幅（Sprint 54: +5、Sprint 55: +2）、品質向上加速",
      "技術的負債完全解消: DoD既存テスト失敗5件→0件、DoD全pass達成、Sprint 55のpassed_with_known_failures解消",
      "P0 Actions 100%継続達成: 3 Sprint連続100%実施（Sprint 54-56）、プロセス改善コミットメント定着強化",
      "Feature/Process配分6:4継続: 6 behavioral + 2 structural subtasks、2 Sprint連続計画配分遵守、持続可能性実証",
      "Phase 17開始: キーボードショートカット機能実装完了、Phase 17: キーボードショートカット・高度検索へ前進",
      "DoD全pass達成: Tests/Lint/Types/Build全項目pass、2 Sprint振りDoD完全達成（Sprint 55は5件失敗）",
      "rate 64%→66%向上: 4 Sprint連続KPI min 50%超、+2%改善、healthy 70%へ+4%接近",
      "Subtask完遂: 8 subtasks全完了、6 commits、TDD基盤での安定開発継続",
    ],
    toImprove: [
      "P1 Actions 0%実施: P1 2項目とも未実施（トラッキング精度改善、rate目標ロードマップ）、2 Sprint連続繰越",
      "Actions実施率40%低下: Sprint 55の60%から-20%減少、P1/P2 Actions全未実施",
      "P2 Action進捗なし: テストカバレッジ可視化ツール、1 Sprint経過、残り2 Sprint",
      "KPI healthy達成計画未策定: rate 66%、healthy 70%へ+4%必要、具体策未策定",
    ],
    actions: [
      "P0: Sprint 57 Planning時にP1 Actions 1-2項目をSubtaskとして組み込み、Feature/Process配分6:4維持",
      "P0: actionManagement.tracking更新（Sprint 56実績: P0 2項目実施→executed+2, remaining-2、rate再計算）",
      "P1: Sprint実績トラッキング精度改善（commit数とscrum.ts記録の自動検証スクリプト作成、初版実装）",
      "P1: rate 64%→70%達成ロードマップ策定（+6%改善、Sprint 57-58の2 Sprint計画、具体的Actions 3-5項目明記）",
      "P2: テストカバレッジ可視化ツール導入検討（候補ツール3種比較、推奨ツール1種選定）",
    ] },
];

// Action Management (Sprint 56完了: rate 64%→66%(+2%)、P0 Actions 2項目実施100%、Actions実施率40%)
export const actionManagement = {
  kpi: { min: 50, healthy: 70, excellent: 90 },
  tracking: { total: 100, executed: 66, rate: 66, remaining: 34 },
  // Sprint 56完了: P0 Actions 2/2実施(100%)、P1 0/2実施(0%)、P2 0/1実施(0%)、Actions実施率40% (2/5)
  //   実施: P0 2項目（P1 Actions 1項目Subtask化・DoD既存テスト失敗5件修正完了→技術的負債完全解消）
  //   繰越: P1 2項目（トラッキング精度改善・rate目標ロードマップ）→Sprint 57へ2 Sprint連続繰越
  //   継続: P2 1項目（テストカバレッジ可視化ツール）→1 Sprint経過、残り2 Sprint
  //   新規: Sprint 56 Actions 5項目策定（P0 2項目、P1 2項目、P2 1項目）
  //   計算: executed 64→66 (+2 P0実施)、remaining 36→34 (-2)、rate 64%→66% (+2%)
  // Sprint 55完了: P0 Actions 2/2実施(100%)、Actions実施率60% (3/5)
  // Sprint 54完了: P0 Actions 2項目実施、Actions実施率50% (2/4)
  // Sprint 53完了: 15項目廃棄/統合、根本原因3軸分析、プロセス再設計ルール3項目確立
};

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
