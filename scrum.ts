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
  sprint: { number: 65, pbi: "PBI-062", status: "done" as SprintStatus,
    subtasksCompleted: 7, subtasksTotal: 7, impediments: 0 },
  phase: { number: 18, status: "done", sprints: "58-65", pbis: "PBI-058, PBI-059, PBI-060, PBI-061, PBI-062, PBI-063, PBI-064", goal: "Phase 18: UX強化・パフォーマンス最適化" },
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
  phase19: { number: 19, goal: "生産性向上・Obsidian統合", sprints: "66-69", pbis: ["PBI-065", "PBI-066", "PBI-067", "PBI-068"], status: "not_started" },
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
  {
    id: "PBI-065",
    story: {
      role: "タスク管理ユーザー",
      capability: "今日やるべきタスク（due:today以前、t:today以前）を専用ビューで一覧表示し、AIが今日取り組むべきタスクを提案",
      benefit: "今日集中すべきタスクが明確になり、AIの提案で優先順位付けが効率化される"
    },
    acceptanceCriteria: [
      { criterion: "due:が今日以前のタスクがフォーカスビューに表示される", verification: "vitest" },
      { criterion: "t:が今日以前のタスクがフォーカスビューに表示される", verification: "vitest" },
      { criterion: "完了済みタスクはフォーカスビューに表示されない", verification: "vitest" },
      { criterion: "優先度順にソートされている", verification: "vitest" },
      { criterion: "コマンドパレットからフォーカスビューを開ける", verification: "manual" },
      { criterion: "AIが今日取り組むべきタスクの優先順位を提案する", verification: "manual" },
      { criterion: "AI提案の理由が表示される", verification: "manual" },
    ],
    dependencies: [],
    status: "draft" as PBIStatus,
    complexity: { functions: 5, estimatedTests: 18, externalDependencies: 1, score: "MEDIUM" as const, subtasks: 6 },
  },
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
    status: "draft" as PBIStatus,
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

// Current Sprint - None (Phase 18完遂、次Phase準備中)
export const currentSprint = {
  sprint: 65,
  pbi: "PBI-062",
  goal: "パワーユーザーが自分好みのキーボードショートカットを設定画面でカスタマイズし、永続化できるようにする",
  status: "done" as SprintStatus,
  subtasks: [] as (Subtask & { ac: string[] })[],
};
// Sprint 65: PBI-062完了 - 7 subtasks (6 behavioral + 1 structural), 7 commits, DoD全pass, AC全達成, 1287t(+67t), Phase 18完遂, see git history
// Sprint 63: PBI-061完了 - 7 subtasks (6 behavioral + 1 structural), 7 commits, DoD全pass, AC全達成, 1140t(+64t), Phase 18で2番目テスト増加, see git history
// Sprint 62: PBI-060完了 - 7 subtasks (6 behavioral + 1 structural), 7 commits, DoD全pass, AC全達成, 1076t(+68t), 史上最大テスト増加, see git history
// Sprint 61: PBI-059完了 - 7 subtasks (6 behavioral + 1 structural), 6 commits, DoD全pass, AC全達成, 1008t(+34t), MILESTONE: 1000t達成, see git history
// Sprint 60: PBI-058完了 - 7 subtasks (5 behavioral + 2 structural), 7 commits, DoD全pass, AC全達成, 974t(+43t), see git history
// Sprint 59: PBI-064完了(IMP-058-1解決) - 1 subtask (1 behavioral), 1 commit, DoD全pass, AC全達成, 931t(維持), rate 72%→73%, see git history
// Sprint 58-56: see git history

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

// Completed Sprints - Phase 1-15 compacted, see git history
export const completedSprints: CompletedSprint[] = [
  // Phase 1-15完了 (Sprint 1-53): 基本機能+サイドパネル+AI連携+プロセス基盤、830t達成
  // Phase 16完了 (Sprint 54-55): AI自然言語タスク編集・一括処理、837t達成(+7t)
  // Phase 17完了 (Sprint 56-57): キーボードショートカット・高度検索、929t達成(+92t)
  { sprint: 54, pbi: "PBI-054", story: "AI自然言語タスク編集", verification: "passed", notes: "835t(+5t),7subtasks,7commits,Phase 16開始" },
  { sprint: 55, pbi: "PBI-055", story: "複数タスクAI一括処理", verification: "passed", notes: "837t(+2t),8subtasks,8commits,DoD 5失敗(既存),rate64%,Phase 16完遂" },
  { sprint: 56, pbi: "PBI-056", story: "キーボードショートカット機能", verification: "passed", notes: "879t(+42t),8subtasks,6commits,DoD全pass,Phase 17開始" },
  { sprint: 57, pbi: "PBI-057", story: "高度検索機能", verification: "passed", notes: "929t(+50t),7subtasks,10commits,DoD全pass,AC全達成,Phase 17完遂" },
  { sprint: 58, pbi: "PBI-064", story: "インライン入力欄でタスク追加", verification: "failed", notes: "931t(+2t),8subtasks,13commits,DoD全pass,AC未達成(view.ts統合欠落),rate68%→72%" },
  { sprint: 59, pbi: "PBI-064", story: "インライン入力欄でタスク追加(IMP-058-1解決)", verification: "passed", notes: "931t(維持),1subtask,1commit,DoD全pass,AC全達成,IMP-058-1解決,rate72%→73%" },
  { sprint: 60, pbi: "PBI-058", story: "インライン編集機能", verification: "passed", notes: "974t(+43t),7subtasks,7commits,DoD全pass,AC全達成(AC1-2手動,AC3-5vitest),E2E統合成功" },
  { sprint: 61, pbi: "PBI-059", story: "Undo/Redo機能", verification: "passed", notes: "1008t(+34t),7subtasks,6commits,DoD全pass,AC全達成(AC1-3,AC5vitest,AC4手動),MILESTONE:1000t達成" },
  { sprint: 62, pbi: "PBI-060", story: "フィルター保存機能", verification: "passed", notes: "1076t(+68t),7subtasks,7commits,DoD全pass,AC全達成(AC1-2手動,AC3-5vitest),史上最大テスト増加" },
  { sprint: 63, pbi: "PBI-061", story: "コンテキストメニュー機能", verification: "passed", notes: "1140t(+64t),7subtasks,7commits,DoD全pass,AC全達成(AC1手動,AC2-5vitest),Phase 18で2番目テスト増加" },
  { sprint: 64, pbi: "PBI-063", story: "パフォーマンス最適化", verification: "passed", notes: "1220t(+80t),8subtasks,7commits,DoD全pass,AC全達成(AC3手動,AC1-2,4-5vitest),P0 Action実施,rate76%→77%" },
  { sprint: 65, pbi: "PBI-062", story: "キーボードショートカットカスタマイズ", verification: "passed", notes: "1287t(+67t),7subtasks,7commits,DoD全pass,AC全達成(AC1手動,AC2-4vitest),Phase 18完遂" },
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  // Sprint 42-64: see git history
  { sprint: 65,
    workedWell: [
      "Phase 18完遂達成: Sprint 58-65の8 Sprints、7 PBIs、+356テスト（931t→1287t）で完遂",
      "DoD全pass継続: 10 Sprint連続達成（Sprint 56-65）、テスト品質維持の長期継続",
      "AC全達成: AC1-4すべて達成、AC1手動テスト、AC2-4 vitest検証の組み合わせ成功",
      "+67テスト増加: 1220t→1287t、E2E統合テスト6 Sprint連続、TDD遵守",
      "ShortcutManager設計成功: 再利用可能なクラス設計、競合検出・永続化・デフォルト復元の包括的実装",
    ],
    toImprove: [
      "Phase 19 Planning準備: 次PhaseのGoal策定とPBI候補洗い出しが必要",
      "長期未実施Action棚卸し: P1 Actions（AC検証チェックリスト、rendering.ts統合）が複数Sprint継続中",
    ],
    actions: [
      "P1: Phase 19 Goal策定とPBI候補3-5個洗い出し（Product Goalとの整合性確認）",
      "P1: AC検証チェックリスト策定（Sprint 59からの継続、6 Sprint実績、SMART基準適用で3-5項目作成）",
      "P2: rendering.tsへの仮想スクロール完全統合検討（次Phase PBIとして検討）",
      "P2: DoDへのAC検証追加検討（継続）",
    ] },
];

// Action Management (Sprint 65完了: rate 74%、P0 Action設定なし、P1/P2 Action計4項目追加)
export const actionManagement = {
  kpi: { min: 50, healthy: 70, excellent: 90 },
  tracking: { total: 105, executed: 78, rate: 74, remaining: 27 },
  // Sprint 65: P0 Action設定なし（Phase 18完遂）、P1/P2 Action計4項目追加、rate 77%→74%(-3%)、healthy KPI 8 Sprint連続
  // Sprint 64: P0 Action 1項目実施（scrum.ts即時更新ルール実践）、P1/P2 Action計2項目追加、rate 76%→77%(+1%)、healthy KPI 7 Sprint連続
  // Sprint 63: P1 Action 1項目実施（E2E統合明示化継続）、P0/P1/P2 Action計3項目追加、rate 78%→76%(-2%)、healthy KPI 6 Sprint連続
  // Sprint 62: P1 Action 1項目実施（E2E統合明示化継続実践）、rate 77%→78%(+1%)、healthy KPI 5 Sprint連続
  // Sprint 61: P1 Action 1項目実施（E2E統合明示化継続実践）、rate 76%→77%(+1%)、healthy KPI 4 Sprint連続
  // Sprint 60: P1 Action 1項目実施（E2E Subtask明示化実践）、rate 73%→76%(+3%)、healthy KPI 3 Sprint連続
  // Sprint 59: P0 Action 1項目完遂（IMP-058-1解決）、rate 72%→73%(+1%)、healthy KPI 2 Sprint連続
};

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
