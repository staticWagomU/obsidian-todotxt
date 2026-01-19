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
  sprint: { number: 64, pbi: "PBI-063", status: "in_progress" as SprintStatus,
    subtasksCompleted: 2, subtasksTotal: 8, impediments: 0 },
  phase: { number: 18, status: "in_progress", sprints: "58-64", pbis: "PBI-062, PBI-063", goal: "Phase 18: UX強化・パフォーマンス最適化" },
};

// Product Goal
export const productGoal = {
  statement: "Obsidian内でtodo.txt形式のファイルを直感的に管理・表示する",
  owner: "@scrum-team-product-owner",
};

// Long-term Roadmap (Phase 15-18) - Sprint 53策定、詳細はgit履歴参照
export const roadmap = {
  phase15: { number: 15, goal: "プロセス基盤再構築", sprints: "53", pbis: ["PBI-053"], status: "done" },
  phase16: { number: 16, goal: "AI自然言語タスク編集・一括処理", sprints: "54-55", pbis: ["PBI-054", "PBI-055"], status: "done" },
  phase17: { number: 17, goal: "キーボードショートカット・高度検索", sprints: "56-57", pbis: ["PBI-056", "PBI-057"], status: "done" },
  phase18: { number: 18, goal: "UX強化・パフォーマンス最適化", sprints: "58-64", pbis: ["PBI-064", "PBI-058", "PBI-059", "PBI-060", "PBI-061", "PBI-062", "PBI-063"], status: "in_progress" },
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
  {
    id: "PBI-062",
    story: {
      role: "パワーユーザー",
      capability: "キーボードショートカットを自分好みにカスタマイズ",
      benefit: "慣れ親しんだキー操作で効率的にタスク管理できる",
    },
    acceptanceCriteria: [
      { criterion: "設定画面でショートカットキーを変更できる", verification: "手動テスト: 設定画面でのキー変更操作確認" },
      { criterion: "キーの競合を検出して警告を表示する", verification: "pnpm vitest run: キー競合検出テスト" },
      { criterion: "デフォルトに戻すボタンで初期設定に復元できる", verification: "pnpm vitest run: デフォルト復元テスト" },
      { criterion: "カスタマイズした設定がObsidian設定に永続化される", verification: "pnpm vitest run: 設定永続化テスト" },
    ],
    dependencies: ["PBI-056"],
    status: "draft" as PBIStatus,
  },
  {
    id: "PBI-063",
    story: {
      role: "大量タスクを持つユーザー",
      capability: "1000件以上のタスクでも滑らかにスクロール・操作",
      benefit: "大規模なtodo.txtファイルでもストレスなく使用できる",
    },
    acceptanceCriteria: [
      { criterion: "仮想スクロールにより表示範囲のみDOMをレンダリングする", verification: "pnpm vitest run: VirtualScrollerテスト（DOMノード数検証）" },
      { criterion: "1000件のタスクでも初期表示が500ms以内に完了する", verification: "pnpm vitest run: 1000件初期表示パフォーマンステスト" },
      { criterion: "スクロール時のFPSが50fps以上を維持する", verification: "手動テスト + pnpm vitest run: スクロールハンドラ実行時間テスト" },
      { criterion: "フィルタリング・ソート処理がUIをブロックしない", verification: "pnpm vitest run: 非同期フィルタリングテスト" },
      { criterion: "メモリ使用量が100件と1000件で2倍以内の増加に抑える", verification: "pnpm vitest run: DOMノード数比較テスト" },
    ],
    dependencies: [],
    status: "ready" as PBIStatus,
    complexity: { functions: 12, estimatedTests: 45, externalDependencies: 0, score: "HIGH", subtasks: 8 },
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

// Current Sprint - Sprint 64: PBI-063 パフォーマンス最適化（仮想スクロール）
export const currentSprint = {
  sprint: 64,
  pbi: "PBI-063",
  goal: "大量タスク（1000件以上）でもストレスなく操作できるパフォーマンス最適化を実装する",
  status: "in_progress" as SprintStatus,
  // P0 Action適用: 各Subtask完了コミット + scrum.ts更新を1コミットにまとめる
  subtasks: [
    { test: "VirtualScroller基本クラステスト（visibleRange計算）", implementation: "VirtualScrollerクラス実装", type: "behavioral" as SubtaskType, status: "completed" as SubtaskStatus, commits: [{ phase: "red" as CommitPhase, message: "test: add VirtualScroller basic class tests" }, { phase: "green" as CommitPhase, message: "feat: implement VirtualScroller class with visibleRange calculation" }], ac: ["AC1"] },
    { test: "表示範囲計算テスト（スクロール位置→表示インデックス）", implementation: "calculateVisibleRange関数実装", type: "behavioral" as SubtaskType, status: "completed" as SubtaskStatus, commits: [{ phase: "red" as CommitPhase, message: "test: add calculateVisibleRange edge case tests" }, { phase: "green" as CommitPhase, message: "feat: implement calculateVisibleRange function with edge case handling" }], ac: ["AC1"] },
    { test: "オーバースキャン（バッファ）ロジックテスト", implementation: "overscan設定とバッファDOM管理", type: "behavioral" as SubtaskType, status: "pending" as SubtaskStatus, commits: [], ac: ["AC1", "AC5"] },
    { test: "非同期フィルタリングテスト", implementation: "filterTodosAsync関数実装", type: "behavioral" as SubtaskType, status: "pending" as SubtaskStatus, commits: [], ac: ["AC4"] },
    { test: "パフォーマンス計測ユーティリティテスト", implementation: "PerformanceMetrics計測関数群", type: "behavioral" as SubtaskType, status: "pending" as SubtaskStatus, commits: [], ac: ["AC2", "AC3"] },
    { test: "1000件初期表示パフォーマンステスト（AC2検証）", implementation: "統合パフォーマンステスト", type: "behavioral" as SubtaskType, status: "pending" as SubtaskStatus, commits: [], ac: ["AC2", "AC5"] },
    { test: "rendering.ts仮想スクロール統合リファクタリング", implementation: "renderTaskListを仮想スクロール対応", type: "structural" as SubtaskType, status: "pending" as SubtaskStatus, commits: [], ac: ["AC1", "AC2", "AC3", "AC4", "AC5"] },
    { test: "E2E統合テスト（AC1-5網羅）", implementation: "view.tsとの統合、全AC検証", type: "behavioral" as SubtaskType, status: "pending" as SubtaskStatus, commits: [], ac: ["AC1", "AC2", "AC3", "AC4", "AC5"] },
  ] as (Subtask & { ac: string[] })[],
};
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
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  // Sprint 42-60: see git history
  { sprint: 61,
    workedWell: [
      "MILESTONE達成: 1000テスト突破（974t→1008t、+34t）、プロジェクト史上初",
      "DoD全pass継続: 6 Sprint連続、AC全達成（AC1-3,AC5 vitest、AC4手動）",
      "汎用的設計成功: UndoRedoHistory<T>クラス、TodosView以外でも再利用可能",
      "E2E統合明示化継続: Subtask 7でE2E統合テスト、Sprint 60教訓適用",
    ],
    toImprove: [
      "さらなるプロセス改善余地の検討",
    ],
    actions: [
      "P1: AC検証チェックリスト策定（Sprint 59からの継続、2 Sprint実績により優先度維持）",
      "P2: DoDへのAC検証追加検討（継続）",
    ] },
  { sprint: 62,
    workedWell: [
      "テスト大幅増加: +68t（1008t→1076t）、プロジェクト史上最大の増加量達成",
      "E2E統合成功: Subtask 7でE2E統合テスト明示化、AC全達成（AC1-2手動、AC3-5vitest）",
      "DoD全pass継続: 7 Sprint連続、安定稼働継続",
      "複雑な機能実装成功: FilterPreset CRUD + settings永続化 + ファイル別デフォルトフィルター",
    ],
    toImprove: [
      "さらなるプロセス改善余地の検討",
    ],
    actions: [
      "P1: AC検証チェックリスト策定（Sprint 59からの継続、3 Sprint実績により優先度維持）",
      "P2: DoDへのAC検証追加検討（継続）",
    ] },
  { sprint: 63,
    workedWell: [
      "DoD全pass 8 Sprint連続達成: テスト品質維持継続（1076t→1140t、+64t）",
      "+64テスト増加: Phase 18で2番目の大規模増加（1位はSprint 62の+68t）",
      "AC全達成: AC1-5すべて達成、AC5（モバイル対応ロングプレス）も実装完了",
      "E2E統合明示化継続: Subtask 7でE2E統合テスト実践（Sprint 60教訓適用、4 Sprint連続）",
      "TDD実践成功: 7 Subtask、7コミット、Red-Green-Refactorサイクル遵守",
    ],
    toImprove: [
      "scrum.ts更新遅延: Subtask 5-7完了後もscrum.tsのstatus更新が遅れた",
      "進捗状況把握の不十分さ: Sprint Review時にSubtask 5の実装状況把握が不十分だった",
    ],
    actions: [
      "P0: Sprint実施中のscrum.ts即時更新ルール確立（Subtask完了コミット + scrum.ts更新を1コミットにまとめる）",
      "P1: AC検証チェックリスト策定（Sprint 59からの継続、4 Sprint実績により優先度維持）",
      "P1: 進捗可視化ツール検討（scrum.ts status更新自動化スクリプト、手動更新忘れ防止）",
      "P2: DoDへのAC検証追加検討（継続）",
    ] },
];

// Action Management (Sprint 63完了: rate 76%、P1 Action部分実施、P0 Action 1項目追加)
export const actionManagement = {
  kpi: { min: 50, healthy: 70, excellent: 90 },
  tracking: { total: 101, executed: 77, rate: 76, remaining: 24 },
  // Sprint 63: P1 Action 1項目実施（E2E統合明示化継続）、P0/P1/P2 Action計3項目追加、rate 78%→76%(-2%)、healthy KPI 6 Sprint連続
  // Sprint 62: P1 Action 1項目実施（E2E統合明示化継続実践）、rate 77%→78%(+1%)、healthy KPI 5 Sprint連続
  // Sprint 61: P1 Action 1項目実施（E2E統合明示化継続実践）、rate 76%→77%(+1%)、healthy KPI 4 Sprint連続
  // Sprint 60: P1 Action 1項目実施（E2E Subtask明示化実践）、rate 73%→76%(+3%)、healthy KPI 3 Sprint連続
  // Sprint 59: P0 Action 1項目完遂（IMP-058-1解決）、rate 72%→73%(+1%)、healthy KPI 2 Sprint連続
};

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
