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
  sprint: { number: 47, pbi: "PBI-047", status: "in_progress" as SprintStatus,
    subtasksCompleted: 4, subtasksTotal: 7, impediments: 0 },
  phase: { number: 12, status: "in_progress", sprints: "Sprint 46-47", pbis: "PBI-046,PBI-047", goal: "サイドパネルとAI連携でtodo.txt管理を強化" },
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
  // Phase 12 (Sprint 46): サイドパネル実装完了、770t達成(+8t)
  //   Sprint 46 PBI-046: サイドパネル実装、770t(+8t)、done
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
    status: "ready" as PBIStatus,
    complexity: {
      functions: 14,
      estimatedTests: 28,
      externalDependencies: 1,
      score: "MEDIUM",
      subtasks: 7,
    },
    refactorChecklist: [
      "OpenRouterServiceのエラーハンドリングをHTTPステータスコード別に整理",
      "プロンプトテンプレートをコンテキスト・優先度・期限の各セクションに分割",
      "ダイアログコンポーネントの共通UI部分をBaseDialogクラスに抽出",
    ],
    // Design: docs/design/PBI-047-design.md (based on todonoeai specification)
    // External Dependency: OpenRouter API (https://openrouter.ai/api/v1/chat/completions)
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
  sprint: 47,
  pbi: "PBI-047",
  goal: "自然言語からtodo.txt形式への変換機能を実装し、直感的なタスク追加を可能にする",
  status: "in_progress" as SprintStatus,
  subtasks: [
    {
      test: "withRetry関数が指定回数リトライし、exponential backoffを適用するかテスト",
      implementation: "retry.tsにwithRetry, isRetryableError関数を実装（ネットワークエラー、429、5xxが対象）",
      type: "behavioral" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [
        { phase: "red" as CommitPhase, message: "test(ai): add retry logic tests for withRetry and isRetryableError" },
        { phase: "green" as CommitPhase, message: "feat(ai): implement retry logic with exponential backoff" },
      ],
    },
    {
      test: "buildSystemPrompt関数が現在日付とカスタムコンテキストを使用してプロンプトを生成するかテスト",
      implementation: "prompt.tsにbuildSystemPrompt関数を実装（プロジェクト/コンテキスト/優先度/期限のルール埋め込み）",
      type: "behavioral" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [
        { phase: "red" as CommitPhase, message: "test(ai): add prompt generation tests for buildSystemPrompt" },
        { phase: "green" as CommitPhase, message: "feat(ai): implement prompt generation with buildSystemPrompt" },
      ],
    },
    {
      test: "OpenRouterService.convertToTodotxt()がAPI呼び出しとレスポンスパースを行うかテスト、エラーハンドリング含む",
      implementation: "openrouter.tsにOpenRouterServiceクラスとconvertToTodotxt実装（API client + retry統合）",
      type: "behavioral" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [
        { phase: "red" as CommitPhase, message: "test(ai): add OpenRouter API client tests for convertToTodotxt" },
        { phase: "green" as CommitPhase, message: "feat(ai): implement OpenRouter API client with retry support" },
      ],
    },
    {
      test: "settings.tsにOpenRouter設定（apiKey, model, retryConfig, customContexts）が追加され、UIで編集可能かテスト",
      implementation: "settings.tsを拡張してOpenRouter関連設定を追加、設定UI実装",
      type: "behavioral" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [
        { phase: "red" as CommitPhase, message: "test(settings): add OpenRouter settings tests" },
        { phase: "green" as CommitPhase, message: "feat(settings): add OpenRouter configuration with UI" },
      ],
    },
    {
      test: "AITaskInputDialogが開き、自然言語入力と生成ボタンが機能するかテスト",
      implementation: "ui/dialogs/AITaskInputDialog.tsを実装（Modal継承、OpenRouterService呼び出し）",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
    {
      test: "AITaskPreviewDialogがプレビュー表示、編集、再生成、追加機能を提供するかテスト",
      implementation: "ui/dialogs/AITaskPreviewDialog.tsを実装（todo.txt編集可能、ファイル追記処理）",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
    {
      test: "サイドパネルとメインビューのAIボタンがAITaskInputDialogを開くかテスト",
      implementation: "TodoSidePanelView/TodosViewのAIボタンをAITaskInputDialogに接続 + REFACTOR実施（エラーハンドリング整理、プロンプト分割、BaseDialog抽出）",
      type: "structural" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
  ] as Subtask[],
};
// Sprint 46: PBI-046完了 - 3 subtasks, 6 commits (3 RED, 3 GREEN), see git history
// Sprint 45: PBI-045完了 - 3 subtasks, 6 commits (3 RED, 3 GREEN), see git history

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
  // Phase 12 (Sprint 46-): サイドパネル・AI連携、770t達成(+8t)
  { sprint: 46, pbi: "PBI-046", story: "サイドパネルでtodo.txt一覧表示と簡易操作", verification: "passed", notes: "770t(+8t),Subtask3完了(RED-GREEN6commit),TodoSidePanelView実装,複数ファイルタスク表示,AIボタンプレースホルダー追加,Phase 12開始" },
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  // Sprint 42: Phase 9完遂、REFACTOR率50%達成、CSS 214→513行 - see git history
  // Sprint 43: 740t(+114t)、70エッジケーステスト追加、Phase 10開始 - see git history
  // Sprint 44: 738t(-2t統合化)、Phase 10完遂、Actions 5項目未消化 - see git history
  // Sprint 45: 762t(+24t)、アーカイブ機能実装、REFACTOR 3連続未実施 - see git history
  { sprint: 46,
    workedWell: [
      "完璧なTDD継続: RED-GREEN 6 commits、4 Sprint連続でテストファースト徹底",
      "新View実装成功: ItemView使用のTodoSidePanelView実装、複数ファイル対応実現",
      "DoD完全クリア: Tests/Lint/Types/Build全てpass、品質基準維持",
      "Phase 12開始: サイドパネル・AI連携の基盤構築、PBI-047への橋渡し完了",
      "効率的なテスト追加: 762t→770t(+8t, 1.05%増)、機能に対する適切なテストカバレッジ",
    ],
    toImprove: [
      "REFACTOR phase未実施深刻化: 4 Sprint連続未実施（Sprint 43-46）、技術的負債蓄積リスク増大",
      "Sprint 45 Actions全滅: 4項目全て未実施（0/4 = 0%実施率）、Action機能不全状態",
      "Action累積危機的: execution rate 47%維持も実質的改善なし、累積Actions 39項目に増加",
      "REFACTOR判断プロセス欠如: GREEN完了後のREFACTOR要否判断が完全にスキップされている",
    ],
    actions: [
      "REFACTOR強制実行: Sprint 47で必ずREFACTOR phase実施、Subtask 1つをREFACTOR専用に割当",
      "Action実施KPI厳格化: Sprint 47で最低2 Actions実施必須（50%以上実施率）、未達成時はSprint失敗扱い",
      "GREEN後REFACTOR判断義務化: 各Subtask GREEN完了時、REFACTOR要否4項目チェック（重複/複雑度/命名/構造）必須記録",
      "技術的負債可視化: Sprint 47 Planning時、累積未実施Actions 39項目から緊急対処項目2つ選定・Subtask化",
      "retrospective action追跡: Sprint 47で過去4 Sprintの未実施Actions実施状況を明示的にレビュー",
    ] },
];

// Action Management (Sprint 46完了、rate 44% critical below KPI min)
export const actionManagement = {
  kpi: { min: 50, healthy: 70, excellent: 90 },
  tracking: { total: 78, executed: 34, rate: 44, remaining: 44 },
  // Sprint 46: +5 actions, 0 executed from Sprint 45 backlog (累積未実施21項目: Sprint 43残3+Sprint 44残3+Sprint 45残4+Sprint 46新5+過去6)
  // 危機的状況: 4 Sprint連続でAction実施率0%、KPI min 50%を大きく下回る44%に悪化
};

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
