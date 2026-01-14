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
  sprint: { number: 46, pbi: "PBI-046", status: "not_started" as SprintStatus,
    subtasksCompleted: 0, subtasksTotal: 0, impediments: 0 },
  phase: { number: 11, status: "done", sprints: "Sprint 45", pbis: "PBI-045", goal: "完了タスクのアーカイブ機能を実装し、todo.txtファイルのスリム化を実現する" },
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
  {
    id: "PBI-046",
    story: {
      role: "Obsidianユーザー",
      capability: "サイドパネルでtodo.txtタスクの一覧表示と簡易操作ができる",
      benefit: "メインエディタを開かずにタスクを俯瞰・追加できる",
    },
    acceptanceCriteria: [
      { criterion: "サイドパネル（Obsidian Leaf）にタスク一覧が表示される", verification: "pnpm build && 手動確認: サイドパネルにタスク一覧が表示される" },
      { criterion: "タスク追加ボタンがあり、クリックで新規タスクを追加できる", verification: "pnpm build && 手動確認: 追加ボタンでタスクが追加される" },
      { criterion: "サイドパネルのタスクをクリックすると該当todo.txtが開く", verification: "pnpm build && 手動確認: タスククリックでファイルが開く" },
      { criterion: "AI用タスク追加ボタンがサイドパネルに表示される", verification: "pnpm build && 手動確認: AIボタンがサイドパネルに存在する" },
      { criterion: "AI用タスク追加ボタンがtodo.txtメインビューにも表示される", verification: "pnpm build && 手動確認: AIボタンがメインビューに存在する" },
    ],
    dependencies: [],
    status: "draft" as PBIStatus,
  },
  {
    id: "PBI-047",
    story: {
      role: "todo.txtユーザー",
      capability: "自然言語でタスクを説明するとtodo.txt形式に変換して追加できる",
      benefit: "形式を覚えなくても自然な文章でタスクを追加できる",
    },
    acceptanceCriteria: [
      { criterion: "AI追加ボタンクリックで自然言語入力ダイアログが開く", verification: "pnpm build && 手動確認: ダイアログが開く" },
      { criterion: "入力された自然言語がtodo.txt形式に変換される（プロジェクト/コンテキスト/優先度/期限を自動抽出）", verification: "pnpm vitest run -- -t 'natural language to todotxt'" },
      { criterion: "変換結果をプレビュー表示し、編集・確認できる", verification: "pnpm build && 手動確認: プレビューが編集可能" },
      { criterion: "確認後にタスクがtodo.txtに追加される", verification: "pnpm build && 手動確認: タスクが追加される" },
      { criterion: "複数タスクを一括で変換・追加できる（改行/箇条書き区切り）", verification: "pnpm vitest run -- -t 'multiple tasks'" },
      { criterion: "OpenRouterのAPIキー・モデル設定が可能", verification: "pnpm build && 手動確認: 設定画面にOpenRouter設定がある" },
      { criterion: "カスタムコンテキストマッピングが設定可能", verification: "pnpm vitest run -- -t 'custom context'" },
      { criterion: "APIエラー時に設定に従い自動リトライする", verification: "pnpm vitest run -- -t 'retry'" },
    ],
    dependencies: ["PBI-046"],
    status: "draft" as PBIStatus,
    // Design: docs/design/PBI-047-design.md (based on todonoeai specification)
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
  sprint: 45,
  pbi: "PBI-045",
  goal: "完了タスクのアーカイブ機能を実装し、todo.txtファイルのスリム化を実現する",
  status: "done" as SprintStatus,
  subtasks: [
    {
      test: "archiveCompletedTasks関数、getArchiveFilePath関数、appendToArchiveFile関数のテストを実装（完了タスク抽出、done.txtパス生成、ファイル追記処理の検証）",
      implementation: "完了タスク抽出ロジック、done.txtパス生成、ファイル追記処理を実装",
      type: "behavioral" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [
        { phase: "red", message: "test(archive): add RED phase tests for archive core functionality" },
        { phase: "green", message: "feat(archive): implement archive core functionality" },
      ],
    },
    {
      test: "getArchiveHandler関数、アーカイブボタンのレンダリング、無効化状態のテストを実装（完了タスク0件時の無効化検証）",
      implementation: "アーカイブボタンUI、ハンドラー統合、完了タスク0件時の無効化処理を実装",
      type: "behavioral" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [
        { phase: "red", message: "test(handlers): add RED phase tests for archive handler" },
        { phase: "green", message: "feat(handlers): implement archive handler" },
      ],
    },
    {
      test: "確認モーダル表示、ハンドラーexposure、完了タスク削除のテストを実装（アーカイブ後の元ファイル更新検証）",
      implementation: "確認モーダル、Viewからのハンドラーアクセス、アーカイブ後の元ファイル更新を実装",
      type: "behavioral" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [
        { phase: "red", message: "test(archive): add RED phase tests for view integration and confirmation modal" },
        { phase: "green", message: "feat(archive): implement view integration and confirmation modal" },
      ],
    },
  ] as Subtask[],
};
// Sprint 44: PBI-044完了 - 3 subtasks, 6 commits (3 RED, 3 GREEN), see git history

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
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  // Sprint 42: Phase 9完遂、REFACTOR率50%達成、CSS 214→513行 - see git history
  // Sprint 43: 740t(+114t)、70エッジケーステスト追加、Phase 10開始 - see git history
  { sprint: 44,
    workedWell: [
      "TDD厳守: 完璧なRED-GREENサイクル（3 RED→3 GREEN commits）",
      "統合テスト最適化: 740t→738t(-2t)、重複テスト統合で保守性向上",
      "複雑度見積精度: LOW complexity適切、3 subtasks見積正確",
      "Phase 10完遂: 2 Sprint計画通り完了（Sprint 43-44）",
      "追加GREEN commit活用: Subtask 3で統合テスト追加、柔軟な対応",
    ],
    toImprove: [
      "REFACTOR phase不実施（Sprint 43と同様の課題が継続）",
      "Sprint 43 Actions全件未実施（5項目未消化、累積10項目）",
      "Phase 11方向性未決定（PBI-045～047がdraft状態）",
      "Test数変動の詳細説明不足（-2t統合化の具体的内容記録なし）",
    ],
    actions: [
      "REFACTOR実施ルール策定（GREEN完了後必ずREFACTOR検討プロセス追加）",
      "Phase 11方向性決定（PBI-045 Backlog Refinement実施、技術的負債 vs 新機能判断）",
      "累積Action項目優先順位付け（Sprint 43/44の10項目から最重要3項目選定）",
      "Test数変動記録テンプレート導入（増減理由・影響範囲を明示）",
      "LOW complexity PBI連続実施検討（Phase 11で小粒度PBI複数Sprint可能性評価）",
    ] },
];

// Action Management (Sprint 44完了、rate 46% below KPI min)
export const actionManagement = {
  kpi: { min: 50, healthy: 70, excellent: 90 },
  tracking: { total: 69, executed: 32, rate: 46, remaining: 37 },
  // Sprint 44: +5 actions, 0 executed from backlog (累積未実施15項目: Sprint 42/43/44各5項目)
};

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
