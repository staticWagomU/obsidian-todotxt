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
  sprint: { number: 57, pbi: "PBI-057", status: "done" as SprintStatus,
    subtasksCompleted: 7, subtasksTotal: 7, impediments: 0 },
  phase: { number: 17, status: "done", sprints: "56-57", pbis: "PBI-056, PBI-057", goal: "Phase 17: キーボードショートカット・高度検索" },
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
  phase18: { number: 18, goal: "UX強化・パフォーマンス最適化", sprints: "58-64", pbis: ["PBI-064", "PBI-058", "PBI-059", "PBI-060", "PBI-061", "PBI-062", "PBI-063"], status: "planned" },
};

// Product Backlog (Order = Priority) - done PBIs compacted, see git history
export const productBacklog: ProductBacklogItem[] = [
  // Phase 1-15完了 (Sprint 1-53): 基本機能+UI+サイドパネル+AI連携+プロセス基盤、830t達成
  // Phase 16完了 (Sprint 54-55): AI自然言語タスク編集・一括処理、837t達成(+7t)
  // Phase 17完了 (Sprint 56-57): キーボードショートカット・高度検索、929t達成(+92t)
  //   Sprint 56 PBI-056: キーボードショートカット、879t(+42t)、Phase 17開始
  //   Sprint 57 PBI-057: 高度検索機能、929t(+50t)、Phase 17完遂

  // Phase 18: UX強化・パフォーマンス最適化
  {
    id: "PBI-064",
    story: {
      role: "todo.txtユーザー",
      capability: "タスクリスト上部のインライン入力欄にデスクリプションを入力してEnterで即追加",
      benefit: "モーダルを開く手間なく、思いついたタスクを素早く記録できる",
    },
    acceptanceCriteria: [
      { criterion: "コントロールバー下にインライン入力欄が常時表示される", verification: "手動テスト: 画面表示確認" },
      { criterion: "入力欄にテキストを入力してEnterキーで即座にタスクが追加される", verification: "pnpm vitest run: Enterキーでの追加処理テスト" },
      { criterion: "追加されたタスクに今日の日付が作成日として自動設定される", verification: "pnpm vitest run: 作成日自動設定テスト" },
      { criterion: "追加後は入力欄がクリアされ、連続入力が可能", verification: "pnpm vitest run: 入力欄クリアテスト" },
      { criterion: "空文字での追加は無視される", verification: "pnpm vitest run: バリデーションテスト" },
    ],
    dependencies: [],
    status: "ready" as PBIStatus,
    complexity: {
      functions: 4,
      estimatedTests: 10,
      externalDependencies: 1,
      score: "LOW" as const,
      subtasks: 5,
    },
    // Subtask計画 (TDD形式):
    // 1. [behavioral] インライン入力欄UI表示テスト → renderInlineTaskInput実装
    // 2. [behavioral] Enterキーでのタスク追加テスト → Enterキーハンドラ実装
    // 3. [behavioral] 作成日自動設定テスト → 既存getAddHandler流用確認
    // 4. [behavioral] 入力欄クリアテスト → クリア処理実装
    // 5. [behavioral] 空文字バリデーションテスト → バリデーション実装
    // Sprint 58 P0 Action統合: トラッキング精度改善をSubtask 6として組み込み可能
  },
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
    status: "draft" as PBIStatus,
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

// Current Sprint - Sprint 57完了済み（次Sprint未開始）
export const currentSprint = {
  sprint: null,
  pbi: null,
  goal: "",
  status: "not_started" as SprintStatus,
  subtasks: [] as Subtask[],
};
// Sprint 57: PBI-057完了 - 7 subtasks (5 behavioral + 2 structural), 10 commits, DoD全pass, 929t(+50), Phase 17完遂, see git history
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
  // Phase 17完了 (Sprint 56-57): キーボードショートカット・高度検索、929t達成(+92t)
  { sprint: 54, pbi: "PBI-054", story: "AI自然言語タスク編集", verification: "passed", notes: "835t(+5t),7subtasks,7commits,Phase 16開始" },
  { sprint: 55, pbi: "PBI-055", story: "複数タスクAI一括処理", verification: "passed", notes: "837t(+2t),8subtasks,8commits,DoD 5失敗(既存),rate64%,Phase 16完遂" },
  { sprint: 56, pbi: "PBI-056", story: "キーボードショートカット機能", verification: "passed", notes: "879t(+42t),8subtasks,6commits,DoD全pass,Phase 17開始" },
  { sprint: 57, pbi: "PBI-057", story: "高度検索機能", verification: "passed", notes: "929t(+50t),7subtasks,10commits,DoD全pass,AC全達成,Phase 17完遂" },
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  // Sprint 42-56: see git history
  { sprint: 57,
    workedWell: [
      "Phase 17完遂: Sprint 56-57でPhase 17完了、テスト837t→929t(+92件)、キーボードショートカット・高度検索機能実装完遂",
      "テスト大幅増加継続: 879t→929t(+50件)、2 Sprint連続大幅増加（Sprint 56: +42、Sprint 57: +50）、合計+92件品質基盤強化",
      "P0 Actions 100%達成: 2項目完全実施（tracking更新・rate目標ロードマップ策定）、4 Sprint連続100%達成（Sprint 54-57）",
      "rate 66%→68%向上: 5 Sprint連続KPI min 50%超、+2%改善、healthy 70%へ+2%接近",
      "Feature/Process配分6:4維持: 5 behavioral + 2 structural subtasks、3 Sprint連続計画配分遵守、持続可能性確立",
      "DoD全pass継続達成: Tests/Lint/Types/Build全項目pass、2 Sprint連続DoD完全達成（Sprint 56-57）",
      "高度検索機能完全実装: AC全達成、10 commits、TDD基盤での安定開発継続",
      "rate目標ロードマップ策定完了: Sprint 57-58の2 Sprint計画、healthy 70%達成への具体的道筋明確化",
    ],
    toImprove: [
      "P1 Actions 0%実施: P1 1項目未実施（トラッキング精度改善）、3 Sprint連続繰越、P2→P1昇格したが実施なし",
      "Actions実施率40%継続: Sprint 56の40%から横這い、2 Sprint連続40%、P1/P2 Actions全未実施",
      "P2 Action進捗なし: テストカバレッジ可視化ツール、2 Sprint経過、残り1 Sprint、期限間近",
      "P1 Action滞留: トラッキング精度改善、3 Sprint繰越（Sprint 55-57）、実施障壁の分析不足",
    ],
    actions: [
      "P0: Sprint 58 Planning時にP1 Action 1項目（トラッキング精度改善）を必ずSubtaskとして組み込み、3 Sprint滞留解消",
      "P0: actionManagement.tracking更新（Sprint 57実績: P0 2項目実施→executed+2, remaining-2、rate 68%達成確認）",
      "P1: P2 Actions棚卸し実施（テストカバレッジ可視化ツール含む、期限超過Actions 5-10項目抽出・廃棄判定）",
      "P1: トラッキング精度改善Subtask化時の障壁分析（3 Sprint滞留原因3軸分析: 技術的難易度・工数見積もり・優先度設定）",
      "P2: Phase 18 Goal策定（Phase 17完遂後の次フェーズ方向性、PBI候補3-5項目リストアップ）",
    ] },
];

// Action Management (Sprint 58準備: rate 68%維持、healthy 70%へ+2%目標、P0 Actions 5 Sprint連続100%目標)
export const actionManagement = {
  kpi: { min: 50, healthy: 70, excellent: 90 },
  tracking: { total: 100, executed: 68, rate: 68, remaining: 32 },
  // Sprint 58 Backlog Refinement完了 (2026-01-19):
  //   PBI-064 Refinement完了: draft→ready、complexity追加、DoR全項目達成
  //   P0 Actions Sprint 58計画:
  //     1. トラッキング精度改善Subtask化（3 Sprint滞留解消、Sprint 58 Subtask 6として組込予定）
  //     2. actionManagement.tracking更新（本Refinementで確認完了）
  //   期待効果: rate 70%達成（+2 executed → executed=70, remaining=30）
  //
  // Sprint 57完了: P0 Actions 2/2実施(100%)、P1 0/1実施(0%)、P2 0/1実施(0%)、Actions実施率40% (2/5)
  //   実施: P0 2項目（tracking更新・rate目標ロードマップ策定完了）
  //   繰越: P1 1項目（トラッキング精度改善）→Sprint 58へ3 Sprint連続繰越、P0昇格済
  //   継続: P2 1項目（テストカバレッジ可視化ツール）→2 Sprint経過、残り1 Sprint、期限間近
  //   計算: executed 66→68 (+2 P0実施)、remaining 34→32 (-2)、rate 66%→68% (+2%)
  // Sprint 56完了: P0 Actions 2/2実施(100%)、Actions実施率40% (2/5)、rate 64%→66%
  // Sprint 55完了: P0 Actions 2/2実施(100%)、Actions実施率60% (3/5)、rate 62%→64%
  // Sprint 54完了: P0 Actions 2/2実施(100%)、Actions実施率50% (2/4)、rate 60%→62%
  // Sprint 53完了: 15項目廃棄/統合、根本原因3軸分析、プロセス再設計ルール3項目確立
  //
  // ===== rate 68%→70% ロードマップ (Sprint 58) =====
  // 目標: +2% 改善 (healthy KPI 70%達成)
  // 現状: remaining 32項目中、+2 executed必要
  //
  // Sprint 58 Actions (2項目提案):
  //   1. P0: トラッキング精度改善Subtask化（3 Sprint滞留解消、Feature/Process配分6:4維持）
  //   2. P0: P2超過Actions棚卸し（廃棄判定5-10項目、remaining削減効果、rate向上）
  // Sprint 58期待効果: +2 executed → rate 70%達成
  //
  // 具体的Actions 2項目:
  //   1. Sprint 58 P0: トラッキング精度改善（commit数とscrum.ts記録の自動検証スクリプト初版）
  //   2. Sprint 58 P0: P2超過Actions廃棄（5-10項目、remaining削減、rate向上基盤）
  // ===================================================
};

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
