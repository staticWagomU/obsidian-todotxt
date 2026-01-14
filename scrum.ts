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
  sprint: { number: 48, pbi: "TBD", status: "not_started" as SprintStatus,
    subtasksCompleted: 0, subtasksTotal: 0, impediments: 0 },
  phase: { number: 13, status: "not_started", sprints: "", pbis: "", goal: "TBD - Product Backlog空、新PBI作成待ち" },
};

// Product Goal
export const productGoal = {
  statement: "Obsidian内でtodo.txt形式のファイルを直感的に管理・表示する",
  owner: "@scrum-team-product-owner",
};

// Product Backlog (Order = Priority) - done PBIs compacted, see git history
export const productBacklog: ProductBacklogItem[] = [
  // Phase 1-7完了: Sprint 1-34（34 PBIs done）
  // Phase 8完了 (Sprint 35-39): フォームUI強化、626t達成(+72t)
  // Phase 9完了 (Sprint 40-42): UIデザイン刷新（Apple-likeモダンデザイン）、626t維持
  // Phase 10完了 (Sprint 43-44): パーサー堅牢化・設定強化、738t達成(+112t)
  //   Sprint 43 PBI-043: パーサー堅牢化（エッジケース対応）、740t(+114t)、done
  //   Sprint 44 PBI-044: 設定ベースのファイルパス管理、738t(-2t統合化)、done
  // Phase 11完了 (Sprint 45): アーカイブ機能実装、762t達成(+24t)
  //   Sprint 45 PBI-045: 完了タスクアーカイブ機能、762t(+24t)、done
  // Phase 12完了 (Sprint 46-47): サイドパネル・AI連携完了、801t達成(+31t)
  //   Sprint 46 PBI-046: サイドパネル実装、770t(+8t)、done
  //   Sprint 47 PBI-047: AI自然言語タスク追加、801t(+31t)、done
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

// Current Sprint (No active sprint - Phase 12 complete, Product Backlog empty)
export const currentSprint = {
  sprint: 0,
  pbi: "",
  goal: "",
  status: "not_started" as SprintStatus,
  subtasks: [] as Subtask[],
};
// Sprint 47: PBI-047完了 - 7 subtasks, 11 commits (4 RED, 5 GREEN, 2 REFACTOR), see git history
// Sprint 46: PBI-046完了 - 3 subtasks, 6 commits (3 RED, 3 GREEN), see git history

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

// Completed Sprints - Phase 1-9 compacted, see git history for details
export const completedSprints: CompletedSprint[] = [
  // Phase 1-7 (Sprint 1-34): 基本機能+ドキュメント+UI実装完了、554t達成
  // Phase 8 (Sprint 35-39): フォームUI強化完了、626t達成(+72t)
  // Phase 9 (Sprint 40-42): UIデザイン刷新完了（Apple-likeモダンデザイン）、626t維持
  // Phase 10 (Sprint 43-44): パーサー堅牢化・設定強化完了、738t達成(+112t)
  { sprint: 43, pbi: "PBI-043", story: "パーサー堅牢化（エッジケース対応）", verification: "passed", notes: "740t(+114t),70エッジケーステスト追加,プロジェクト/コンテキスト前スペース必須化,タグ最初コロン分割対応,Phase 10開始" },
  { sprint: 44, pbi: "PBI-044", story: "設定ベースのファイルパス管理", verification: "passed", notes: "738t(-2t統合化),Subtask3完了(RED-GREEN6commit),todotxtFilePaths設定追加,file-matcher実装,設定UIテキストエリア追加,Phase 10完遂" },
  // Phase 11 (Sprint 45): アーカイブ機能実装完了、762t達成(+24t)
  { sprint: 45, pbi: "PBI-045", story: "完了タスクアーカイブ機能", verification: "passed", notes: "762t(+24t),Subtask3完了(RED-GREEN6commit),アーカイブボタンUI追加,done.txt自動生成,確認モーダル実装,Phase 11完遂" },
  // Phase 12 (Sprint 46-47): サイドパネル・AI連携完了、801t達成(+39t)
  { sprint: 46, pbi: "PBI-046", story: "サイドパネルでtodo.txt一覧表示と簡易操作", verification: "passed", notes: "770t(+8t),Subtask3完了(RED-GREEN6commit),TodoSidePanelView実装,複数ファイルタスク表示,AIボタンプレースホルダー追加,Phase 12開始" },
  { sprint: 47, pbi: "PBI-047", story: "AI自然言語タスク追加（OpenRouter連携）", verification: "passed", notes: "801t(+31t),Subtask7完了(GREEN5+REFACTOR2=7commit),retry/prompt/OpenRouterService/AIダイアログ実装,REFACTOR強制実施(5Sprint連続回避),Phase 12完遂" },
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  // Sprint 42: Phase 9完遂、REFACTOR率50%達成、CSS 214→513行 - see git history
  // Sprint 43: 740t(+114t)、70エッジケーステスト追加、Phase 10開始 - see git history
  // Sprint 44: 738t(-2t統合化)、Phase 10完遂、Actions 5項目未消化 - see git history
  // Sprint 45: 762t(+24t)、アーカイブ機能実装、REFACTOR 3連続未実施 - see git history
  // Sprint 46: 770t(+8t)、サイドパネル実装、REFACTOR 4連続未実施、Action実施率0% - see git history
  { sprint: 47,
    workedWell: [
      "REFACTOR復活成功: 4 Sprint連続未実施の負債を解消、2 refactor commits実施（エラーハンドリング整理+型ガード追加）",
      "完璧なTDD維持: 7 Subtasks全てテストファースト徹底、4 RED + 5 GREEN + 2 REFACTOR = 11 commits",
      "AI機能完全実装: OpenRouter API統合成功、retry/prompt/dialog全て実装、8 AC全達成",
      "Phase 12完遂: 2 PBI（PBI-046,047）完了、サイドパネル+AI連携の目標達成",
      "テスト大幅増加: 770t→801t(+31t, 4.0%増)、AI機能に対する包括的テストカバレッジ確保",
      "DoD完全クリア: Tests/Lint/Types/Build全てpass、品質基準維持",
    ],
    toImprove: [
      "Sprint 46 Actions実施率0%: 5項目中0項目実施、REFACTOR以外のAction項目が未着手",
      "Action累積継続: total 78項目中executed 34項目（44%）、依然としてKPI min 50%未達",
      "REFACTOR判断の形骸化: Subtask 7でREFACTOR実施したが、判断プロセスの明示的記録なし",
      "技術的負債可視化未実施: Sprint 47 Planning時の累積Actions選定・Subtask化が行われず",
    ],
    actions: [
      "Action実施最優先化: Sprint 48で最低3 Actions実施必須（60%以上の実施率目標）、Planning時に明示的選定",
      "REFACTOR判断の可視化: 各GREEN完了時、4項目チェック（重複/複雑度/命名/構造）結果をscrum.tsに記録",
      "累積Action整理: Sprint 48 Planning前に過去5 Sprintの未実施Actions棚卸し、廃棄/統合/実施判断実施",
      "Action execution tracking強化: 各Sprint終了時、前Sprint Actions実施状況を数値で明示（例: 5項目中2項目実施=40%）",
      "GREEN-REFACTOR習慣定着: REFACTOR phase実施は成功、次Sprint以降も継続維持、各Phaseで最低1 REFACTOR commit目標",
    ] },
];

// Action Management (Sprint 47完了、rate 42% critical - REFACTOR復活も他Actions未着手)
export const actionManagement = {
  kpi: { min: 50, healthy: 70, excellent: 90 },
  tracking: { total: 83, executed: 35, rate: 42, remaining: 48 },
  // Sprint 47: +5 actions, 1 executed from Sprint 46 backlog (REFACTOR強制実行のみ達成、他4項目未実施)
  // Sprint 46 Actions実施状況: 5項目中1項目実施=20%（REFACTOR成功、KPI厳格化/判断義務化/負債可視化/action追跡は未実施）
  // 累積未実施増加: Sprint 43残3+Sprint 44残3+Sprint 45残4+Sprint 46残4+Sprint 47新5+過去6=25項目
  // 危機的状況継続: rate 44%→42%に悪化、KPI min 50%を大きく下回る
};

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
