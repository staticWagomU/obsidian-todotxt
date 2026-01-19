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
  sprint: { number: 67, pbi: "PBI-066", status: "in_progress" as SprintStatus,
    subtasksCompleted: 0, subtasksTotal: 6, impediments: 0 },
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
  {
    id: "PBI-066",
    story: {
      role: "定型作業が多いユーザー",
      capability: "事前登録したタスクテンプレートをワンクリックでtodo.txtに追加",
      benefit: "繰り返し入力の手間が省け、入力ミスも防げる"
    },
    acceptanceCriteria: [
      { criterion: "設定画面でテンプレートを登録できる", verification: "manual" },
      { criterion: "コマンドパレットからテンプレートを選択して追加できる", verification: "manual" },
      { criterion: "{{today}}プレースホルダーが今日の日付に展開される", verification: "vitest" },
      { criterion: "{{tomorrow}}プレースホルダーが明日の日付に展開される", verification: "vitest" },
      { criterion: "複数行のテンプレートが一度に追加される", verification: "vitest" },
    ],
    dependencies: [],
    status: "ready" as PBIStatus,
    complexity: { functions: 4, estimatedTests: 12, externalDependencies: 0, score: "LOW" as const, subtasks: 5 },
  },
  {
    id: "PBI-067",
    story: {
      role: "大きなタスクを抱えるユーザー",
      capability: "既存タスクをAIで実行可能なサブタスクに分解",
      benefit: "タスクの具体化が容易になり、着手しやすくなる"
    },
    acceptanceCriteria: [
      { criterion: "コンテキストメニューから「AIで分解」を選択できる", verification: "manual" },
      { criterion: "AIが3-7個のサブタスクを生成する", verification: "vitest" },
      { criterion: "サブタスクが親タスクのプロジェクト/コンテキストを継承する", verification: "vitest" },
      { criterion: "プレビュー画面で編集してから追加できる", verification: "manual" },
      { criterion: "カスタム指示を入力してAIの分解方針を調整できる", verification: "manual" },
    ],
    dependencies: [],
    status: "draft" as PBIStatus,
    complexity: { functions: 5, estimatedTests: 18, externalDependencies: 1, score: "MEDIUM" as const, subtasks: 6 },
  },
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

// Current Sprint - Sprint 67: テンプレート機能
export const currentSprint = {
  sprint: 67,
  pbi: "PBI-066",
  goal: "テンプレート機能によりタスク追加の効率化を実現する",
  status: "in_progress" as SprintStatus,
  subtasks: [
    { test: "{{today}}が今日の日付に展開される", implementation: "expandPlaceholders関数", type: "behavioral" as SubtaskType, status: "pending" as SubtaskStatus, commits: [], ac: ["AC3", "AC4"] },
    { test: "複数行テンプレートが複数タスクに分割される", implementation: "parseTemplate関数", type: "behavioral" as SubtaskType, status: "pending" as SubtaskStatus, commits: [], ac: ["AC5"] },
    { test: "テンプレート設定インターフェース", implementation: "TaskTemplate型とデフォルト値", type: "structural" as SubtaskType, status: "pending" as SubtaskStatus, commits: [], ac: ["AC1"] },
    { test: "設定画面でテンプレート登録", implementation: "TodotxtSettingTabにテンプレート設定UI追加", type: "behavioral" as SubtaskType, status: "pending" as SubtaskStatus, commits: [], ac: ["AC1"] },
    { test: "コマンドパレットからテンプレート選択", implementation: "addTemplateTaskコマンド実装", type: "behavioral" as SubtaskType, status: "pending" as SubtaskStatus, commits: [], ac: ["AC2"] },
    { test: "AC検証チェックリスト実践検証", implementation: "AC3,4,5のvitest検証でチェックリスト試行", type: "behavioral" as SubtaskType, status: "pending" as SubtaskStatus, commits: [], ac: ["P1-Action"] },
  ] as (Subtask & { ac: string[] })[],
};
// Sprint 66: PBI-065完了 - 7 subtasks, 5 commits, DoD全pass, AC全達成, 1325t(+38t), Phase 19開始, see git history
// Sprint 58-65: see git history

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
  { sprint: 64, pbi: "PBI-063", story: "パフォーマンス最適化", verification: "passed", notes: "1220t(+80t),DoD全pass,AC全達成" },
  { sprint: 65, pbi: "PBI-062", story: "キーボードショートカットカスタマイズ", verification: "passed", notes: "1287t(+67t),DoD全pass,Phase 18完遂" },
  { sprint: 66, pbi: "PBI-065", story: "フォーカスビュー機能", verification: "passed", notes: "1325t(+38t),DoD全pass,AC全達成,Phase 19開始" },
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  // Sprint 42-65: see git history
  { sprint: 66,
    workedWell: [
      "11 Sprint連続DoD全pass達成: Sprint 56-66の長期継続、テスト品質維持の安定性",
      "AC全達成（7/7項目）: AC1-5 vitest検証、AC6-7手動検証の組み合わせ成功",
      "+38テスト増加: 1287t→1325t、フォーカスビュー機能実装でTDD遵守",
      "Phase 19開始成功: PBI-065完了で新Phase開始、生産性向上・Obsidian統合テーマへの移行",
      "P1 Actions 2項目完遂: AC検証チェックリスト策定（CLAUDE.md追記）、Phase 19 Goal確認完了",
    ],
    toImprove: [
      "P2 Actions長期継続: rendering.ts統合、DoDへのAC検証追加が複数Sprint継続中（優先度見直し必要）",
      "テスト増加量減少傾向: +38t（過去4 Sprintsと比較して減少: S62 +68t, S63 +64t, S64 +80t, S65 +67t）",
      "AC検証チェックリスト実践検証未実施: Sprint 66で策定したチェックリストの実践検証がまだ不足",
    ],
    actions: [
      "P1: AC検証チェックリスト実践検証（Sprint 67で2-3 AC項目で試行）",
      "P2: rendering.ts仮想スクロール統合検討（Phase 20 PBI候補として評価）",
      "P2: DoDへのAC検証追加検討（Sprint 67-68で評価、DoD項目追加可否判断）",
      "P2: テスト増加量維持戦略策定（Phase 19目標: 平均+50t/Sprint、Sprint 67-69で3回測定）",
    ] },
];

// Action Management (Sprint 66完了: rate 76%、healthy KPI 9 Sprint連続)
export const actionManagement = {
  kpi: { min: 50, healthy: 70, excellent: 90 },
  tracking: { total: 105, executed: 80, rate: 76, remaining: 25 },
  // Sprint 66: P1 Action 2項目実施、rate 74%→76%(+2%)
  // Sprint 59-65: see git history
};

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
