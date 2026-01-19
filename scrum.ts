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
  sprint: { number: 60, pbi: "PBI-058", status: "in_progress" as SprintStatus,
    subtasksCompleted: 0, subtasksTotal: 7, impediments: 0 },
  phase: { number: 18, status: "in_progress", sprints: "58-64", pbis: "PBI-058", goal: "Phase 18: UX強化・パフォーマンス最適化" },
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
  {
    id: "PBI-058",
    story: {
      role: "todo.txtユーザー",
      capability: "タスクをダブルクリックまたはEnterキーで直接編集",
      benefit: "モーダルダイアログを開くことなく、素早くタスク内容を修正できる",
    },
    acceptanceCriteria: [
      { criterion: "タスクのダブルクリックで編集モードに移行する", verification: "手動テスト: タスクをダブルクリックして編集モードになることを確認" },
      { criterion: "フォーカス中のタスクでEnterキーを押すと編集モードに移行する", verification: "手動テスト: キーボード操作で編集モード移行を確認" },
      { criterion: "編集中にEscキーで変更を破棄してキャンセルできる", verification: "pnpm vitest run: Escキーでのキャンセル処理テスト" },
      { criterion: "編集中にEnter/Cmd+Enterで変更を保存できる", verification: "pnpm vitest run: 保存処理テスト" },
      { criterion: "編集中に外部クリックで自動保存される", verification: "pnpm vitest run: blur時の自動保存テスト" },
    ],
    dependencies: [],
    status: "ready" as PBIStatus,
    complexity: {
      functions: 8,
      estimatedTests: 18,
      externalDependencies: 0,
      score: "MEDIUM" as const,
      subtasks: 6,
    },
  },
  {
    id: "PBI-059",
    story: {
      role: "todo.txtユーザー",
      capability: "直近の操作を取り消し（Undo）・やり直し（Redo）",
      benefit: "誤操作からすぐに復帰でき、安心してタスク管理できる",
    },
    acceptanceCriteria: [
      { criterion: "Cmd/Ctrl+Zで直近の操作を取り消せる", verification: "pnpm vitest run: Undoショートカットテスト" },
      { criterion: "Cmd/Ctrl+Shift+Zで取り消した操作をやり直せる", verification: "pnpm vitest run: Redoショートカットテスト" },
      { criterion: "タスク追加・編集・削除・完了状態変更が取り消し対象となる", verification: "pnpm vitest run: 各操作タイプのUndo/Redoテスト" },
      { criterion: "取り消し後にトースト通知で「元に戻しました」と表示される", verification: "手動テスト: 通知表示確認" },
      { criterion: "履歴は最大20件まで保持される", verification: "pnpm vitest run: 履歴上限テスト" },
    ],
    dependencies: [],
    status: "draft" as PBIStatus,
  },
  {
    id: "PBI-060",
    story: {
      role: "todo.txtユーザー",
      capability: "フィルター状態を保存し、名前を付けて呼び出す",
      benefit: "よく使うフィルター組み合わせに素早くアクセスでき、作業効率が向上する",
    },
    acceptanceCriteria: [
      { criterion: "現在のフィルター状態を名前を付けて保存できる", verification: "手動テスト: フィルター保存操作確認" },
      { criterion: "保存済みフィルターをドロップダウンから選択して適用できる", verification: "手動テスト: フィルター選択・適用確認" },
      { criterion: "保存済みフィルターを編集・削除できる", verification: "pnpm vitest run: フィルター編集・削除テスト" },
      { criterion: "フィルター設定はObsidianの設定に永続化される", verification: "pnpm vitest run: 設定永続化テスト" },
      { criterion: "ファイルごとにデフォルトフィルターを設定できる", verification: "pnpm vitest run: ファイル別デフォルトフィルターテスト" },
    ],
    dependencies: [],
    status: "draft" as PBIStatus,
  },
  {
    id: "PBI-061",
    story: {
      role: "todo.txtユーザー",
      capability: "タスクを右クリックしてコンテキストメニューからアクションを実行",
      benefit: "マウス操作で素早くタスクの編集・削除・優先度変更などができる",
    },
    acceptanceCriteria: [
      { criterion: "タスク右クリックでコンテキストメニューが表示される", verification: "手動テスト: 右クリックメニュー表示確認" },
      { criterion: "メニューから編集・削除・複製を実行できる", verification: "pnpm vitest run: 基本アクションテスト" },
      { criterion: "優先度変更のサブメニューでA-Zまたは優先度なしを選択できる", verification: "pnpm vitest run: 優先度変更テスト" },
      { criterion: "プロジェクト・コンテキストの追加/削除ができる", verification: "pnpm vitest run: タグ変更テスト" },
      { criterion: "モバイルではロングプレスでメニューが表示される", verification: "手動テスト: モバイルでのロングプレス確認" },
    ],
    dependencies: [],
    status: "draft" as PBIStatus,
  },
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
      { criterion: "仮想スクロールにより表示範囲のみDOMをレンダリングする", verification: "pnpm vitest run: 仮想スクロール実装テスト" },
      { criterion: "1000件のタスクでも初期表示が500ms以内に完了する", verification: "パフォーマンステスト: 1000件タスク読み込み計測" },
      { criterion: "スクロール時のFPSが50fps以上を維持する", verification: "パフォーマンステスト: スクロールFPS計測" },
      { criterion: "フィルタリング・ソート処理がUIをブロックしない", verification: "pnpm vitest run: 非同期処理テスト" },
      { criterion: "メモリ使用量が100件と1000件で2倍以内の増加に抑える", verification: "パフォーマンステスト: メモリ使用量比較" },
    ],
    dependencies: [],
    status: "draft" as PBIStatus,
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

// Current Sprint - Sprint 60
export const currentSprint = {
  sprint: 60,
  pbi: "PBI-058",
  goal: "タスクをダブルクリックまたはEnterキーで直接編集できるようにし、モーダルレスの高速編集体験を実現する",
  status: "in_progress" as SprintStatus,
  subtasks: [
    // Subtask 1: インライン編集状態管理クラス (behavioral)
    {
      test: "InlineEditStateクラス: 編集中状態の開始・終了、編集対象インデックス管理、元の値保持",
      implementation: "src/lib/inline-edit.ts: InlineEditState class with start/stop/getValue methods",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
    // Subtask 2: Escキーでキャンセル処理 (behavioral) - AC3
    {
      test: "InlineEditState.cancel(): 編集中にEscキーで変更を破棄、元の値を復元",
      implementation: "src/lib/inline-edit.ts: cancel() method restores original value",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
    // Subtask 3: Enter/Cmd+Enterで保存処理 (behavioral) - AC4
    {
      test: "InlineEditState.save(): Enter/Cmd+Enterで編集内容を保存、コールバック呼び出し",
      implementation: "src/lib/inline-edit.ts: save() method commits changes via callback",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
    // Subtask 4: blur時の自動保存 (behavioral) - AC5
    {
      test: "InlineEditState.handleBlur(): 外部クリック時に自動保存、編集モード終了",
      implementation: "src/lib/inline-edit.ts: handleBlur() auto-saves on focus loss",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
    // Subtask 5: インライン編集UIレンダリング (structural)
    {
      test: "renderInlineEditInput(): 編集モード時にinput要素をレンダリング、通常モードとの切り替え",
      implementation: "src/lib/rendering.ts: renderInlineEditInput function for edit mode UI",
      type: "structural" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
    // Subtask 6: ダブルクリック・Enterキーでの編集モード開始 (structural) - AC1, AC2
    {
      test: "renderTaskItem: ダブルクリックイベントとキーボードEnterで編集モードに移行",
      implementation: "src/lib/rendering.ts: add dblclick handler and keyboard Enter trigger",
      type: "structural" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
    // Subtask 7: E2E統合テスト・view.ts統合 (behavioral) - Sprint 58教訓
    {
      test: "E2E: view.tsでインライン編集機能統合、AC1-5全項目の動作確認",
      implementation: "src/view.ts integration, manual test verification for AC1-2",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
  ] as Subtask[],
};
// Sprint 59: PBI-064完了(IMP-058-1解決) - 1 subtask (1 behavioral), 1 commit, DoD全pass, AC全達成, 931t(維持), rate 72%→73%, see git history
// Sprint 58: PBI-064 FAILED - 8 subtasks (6 behavioral + 2 structural), 13 commits, DoD全pass, AC未達成(view.ts統合欠落), 931t(+2), rate 68%→72%, healthy KPI初達成, see git history
// Sprint 57: PBI-057完了 - 7 subtasks (5 behavioral + 2 structural), 10 commits, DoD全pass, 929t(+50), Phase 17完遂, see git history
// Sprint 56: PBI-056完了 - 8 subtasks (6 behavioral + 2 structural), 6 commits, DoD全pass, Phase 17開始, see git history
// Sprint 49-55: see git history

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
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  // Sprint 42-57: see git history
  { sprint: 58,
    workedWell: [
      "healthy KPI 70%初達成: rate 68%→72%(+4%)、5 Sprint連続P0 100%",
      "DoD全pass継続: 3 Sprint連続、Tests 931t(+2t)、TDD 13 commits",
      "3 Sprint滞留Action解消: トラッキング精度改善・P2棚卸し完遂",
    ],
    toImprove: [
      "AC検証タイミング遅延: IMP-058-1発覚遅れ、view.ts統合欠落",
      "E2E視点不足: 個別テストのみでAC達成判断、手動テスト計画欠如",
    ],
    actions: [
      "P0: Sprint 59でIMP-058-1解決（view.ts統合）",
      "P1: AC検証チェックリスト策定、E2E Subtask明示化",
      "P2: DoDへのAC検証追加検討",
    ] },
  { sprint: 59,
    workedWell: [
      "迅速なImpediment解決: IMP-058-1を1 Sprint完全解決、AC全達成",
      "DoD全pass継続: 4 Sprint連続、Tests 931t維持、healthy KPI継続",
      "P0 Action完遂: Sprint 58からの継続Action 100%実施",
    ],
    toImprove: [
      "Quick Fix Sprintオーバーヘッド: 本来1 Sprintで完了すべきPBIが2 Sprintに",
      "E2E視点改善継続: Sprint 58教訓の次Sprint適用が課題",
    ],
    actions: [
      "P1: AC検証チェックリスト策定、E2E Subtask明示化（継続）",
      "P2: DoDへのAC検証追加検討（継続）",
    ] },
];

// Action Management (Sprint 59完了: rate 73%、P0 Action IMP-058-1解決)
export const actionManagement = {
  kpi: { min: 50, healthy: 70, excellent: 90 },
  tracking: { total: 98, executed: 73, rate: 73, remaining: 25 },
  // Sprint 59: P0 Action 1項目完遂（IMP-058-1解決）、rate 72%→73%(+1%)、healthy KPI 2 Sprint連続
  // Sprint 58: P0 Action 2項目 + P2棚卸し13項目廃棄、rate 68%→72%(+4%)、healthy KPI初達成
};

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
