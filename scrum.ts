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
  sprint: { number: 55, pbi: "PBI-055", status: "in_progress" as SprintStatus,
    subtasksCompleted: 2, subtasksTotal: 8, impediments: 0 },
  phase: { number: 16, status: "in_progress", sprints: "54-55", pbis: "PBI-054, PBI-055", goal: "Phase 16: AI自然言語処理タスク編集・一括処理機能" },
};

// Product Goal
export const productGoal = {
  statement: "Obsidian内でtodo.txt形式のファイルを直感的に管理・表示する",
  owner: "@scrum-team-product-owner",
};

// Long-term Roadmap (Phase 15-17) - Sprint 53策定、詳細はgit履歴参照
export const roadmap = {
  phase15: { number: 15, goal: "プロセス基盤再構築", sprints: "53", pbis: ["PBI-053"], status: "done" },
  phase16: { number: 16, goal: "AI自然言語タスク編集・一括処理", sprints: "54-55", pbis: ["PBI-054", "PBI-055"], status: "in_progress" },
  phase17: { number: 17, goal: "キーボードショートカット・高度検索", sprints: "56-57", pbis: ["PBI-056", "PBI-057"], status: "not_started" },
};

// Product Backlog (Order = Priority) - done PBIs compacted, see git history
export const productBacklog: ProductBacklogItem[] = [
  // Phase 1-15完了 (Sprint 1-53): 基本機能+UI+サイドパネル+AI連携+プロセス基盤、830t達成
  // Phase 16進行中 (Sprint 54-55): AI自然言語タスク編集・一括処理
  //   Sprint 54 PBI-054: AI自然言語タスク編集、835t(+5t)、done
  {
    id: "PBI-055",
    story: { role: "ユーザー", capability: "複数タスクを一括選択し、AI自然言語でバッチ処理できる", benefit: "類似タスクの一括更新で生産性が向上する" },
    acceptanceCriteria: [
      { criterion: "「一括選択」ボタンでタスクアイテムにチェックボックス表示", verification: "テストで一括選択モード切替、チェックボックス表示を確認" },
      { criterion: "複数タスク選択→「AI一括処理」ボタンでダイアログ表示", verification: "テストで複数選択→ダイアログ表示を確認" },
      { criterion: "自然言語入力→OpenRouter解析→複数Todo更新プレビュー表示", verification: "テストでバッチ処理→プレビュー一覧表示を確認" },
      { criterion: "一括保存でファイル更新、リストに反映", verification: "テストで一括保存→全タスク更新→リスト再描画を確認" },
      { criterion: "一括処理後、選択状態クリア、通常モードに戻る", verification: "テストで保存後チェックボックス非表示、選択リセットを確認" }
    ],
    dependencies: ["PBI-054"],
    status: "ready" as PBIStatus,
    complexity: { functions: 5, estimatedTests: 25, externalDependencies: 1, score: "HIGH" as const, subtasks: 6 }
  },
  {
    id: "PBI-056",
    story: { role: "ユーザー", capability: "キーボードショートカットでタスク操作を高速実行できる", benefit: "キーボード中心のワークフローで作業効率が向上する" },
    acceptanceCriteria: [
      { criterion: "Obsidianコマンドパレットにショートカットコマンド登録、設定で変更可能", verification: "テストでaddCommand呼び出し、コマンドパレット表示を確認" },
      { criterion: "上下矢印キーで選択、Enter完了切替、E編集、Delete削除", verification: "テストでキーボードイベント処理、操作実行を確認" },
      { criterion: "Ctrl+N（Cmd+N）で新規タスクダイアログ", verification: "テストでCtrl+N→ダイアログ表示を確認" },
      { criterion: "Ctrl+F（Cmd+F）で検索フォーカス移動", verification: "テストでCtrl+F→検索ボックスフォーカスを確認" },
      { criterion: "設定画面にショートカット一覧表示", verification: "設定UIにショートカット一覧セクション表示を確認" }
    ],
    dependencies: [],
    status: "ready" as PBIStatus,
    complexity: { functions: 3, estimatedTests: 15, externalDependencies: 0, score: "MEDIUM" as const, subtasks: 5 }
  },
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

// Current Sprint
export const currentSprint = {
  sprint: 55,
  pbi: "PBI-055",
  goal: "複数タスクAI一括処理機能実装により、Phase 16（AI自然言語タスク編集・一括処理）を完遂する",
  status: "in_progress" as SprintStatus,
  subtasks: [
    {
      test: "「一括選択」ボタンクリック→チェックボックス表示、モード切替状態管理テスト",
      implementation: "SelectionModeButton、selectionMode state、TodoItemにcheckbox表示",
      type: "behavioral" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [{ phase: "green" as CommitPhase, message: "feat: Sprint 55 Subtask 1 - batch selection mode with toggle button and checkboxes" }]
    },
    {
      test: "チェックボックスクリック→selectedTodoIds配列更新、全選択/全解除テスト",
      implementation: "selectedTodoIds state、handleSelectTodo、handleSelectAll関数",
      type: "behavioral" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [{ phase: "green" as CommitPhase, message: "feat: Sprint 55 Subtask 2 - select all/deselect all buttons with checkbox click handling" }]
    },
    {
      test: "複数選択状態で「AI一括処理」ボタンクリック→ダイアログ表示テスト",
      implementation: "BulkAIProcessDialog、selectedTodoIds渡し、ダイアログopen/close制御",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: []
    },
    {
      test: "自然言語入力→OpenRouter呼び出し→複数Todo更新プレビュー生成テスト",
      implementation: "bulkProcessWithAI関数、OpenRouter batch request、プレビューデータ生成",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: []
    },
    {
      test: "プレビュー確認→一括保存→ファイル更新→リスト再描画テスト",
      implementation: "handleBulkSave関数、複数Todo更新、file write、リスト更新",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: []
    },
    {
      test: "一括保存後→チェックボックス非表示、selectedTodoIds空配列、通常モード復帰テスト",
      implementation: "resetSelectionMode関数、state初期化",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: []
    },
    {
      test: "N/A (プロセス改善)",
      implementation: "retrospectives配列から未実施Actions抽出、優先度再評価、廃棄/統合/継続判定、actionManagement.tracking更新（total削減、rate 60%→65%）",
      type: "structural" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: []
    },
    {
      test: "N/A (ドキュメント整備)",
      implementation: "CLAUDE.mdにAction Management Process計算式セクション追加（executed加算ルール、remaining減算ルール、廃棄Actions扱い3項目明記）",
      type: "structural" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: []
    }
  ] as Subtask[],
};
// Sprint 54: PBI-054完了 - 7 subtasks (4 behavioral + 3 structural), 7 commits (1 RED + 3 GREEN + 3 REFACTOR), Phase 16開始, see git history
// Sprint 53: PBI-053完了 - 5 subtasks (1 behavioral + 4 structural), 5 commits (1 GREEN + 4 REFACTOR), Phase 15完遂, see git history
// Sprint 52: PBI-052完了 - 5 subtasks (5 behavioral), 5 commits (5 GREEN), see git history
// Sprint 51: PBI-048完了 - 5 subtasks (4 behavioral + 1 structural), 6 commits (2 GREEN-only, 1 GREEN+REFACTOR, 1 lint fix), Phase 13完遂, see git history
// Sprint 50: PBI-049完了 - 2 subtasks (2 behavioral), 5 commits (2 RED, 2 GREEN, 1 bugfix), see git history
// Sprint 49: PBI-050完了 - 3 subtasks (1 behavioral + 2 structural), 5 commits (1 RED, 4 GREEN), see git history

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

// Completed Sprints - Phase 1-12 compacted, see git history
export const completedSprints: CompletedSprint[] = [
  // Phase 1-12完了 (Sprint 1-47): 基本機能+サイドパネル+AI連携、801t達成
  // Phase 13完了 (Sprint 48-51): サイドパネルフル機能化・バグ修正、821t達成(+20t)
  { sprint: 51, pbi: "PBI-048", story: "サイドパネルフル機能化", verification: "passed", notes: "821t(+8t),5subtasks,6commits,Phase 13完遂" },
  // Phase 14完了 (Sprint 52): サイドパネルUI刷新、830t達成(+9t)
  { sprint: 52, pbi: "PBI-052", story: "サイドパネルUI刷新", verification: "passed", notes: "830t(+9t),5subtasks,5commits,Phase 14完遂" },
  // Phase 15完了 (Sprint 53): プロセス基盤再構築、Action実施率58%達成
  { sprint: 53, pbi: "PBI-053", story: "プロセス改善集中Sprint", verification: "passed", notes: "830t維持,5subtasks(1behavioral+4structural),5commits,rate43%→58%,KPI達成,Phase 15完遂" },
  // Phase 16開始 (Sprint 54-55): AI自然言語タスク編集・一括処理
  { sprint: 54, pbi: "PBI-054", story: "AI自然言語タスク編集", verification: "passed", notes: "835t(+5t),7subtasks(4behavioral+3structural),7commits(1RED+3GREEN+3REFACTOR),Action実践検証100%,Phase 16開始" },
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  // Sprint 42-53: see git history
  { sprint: 54,
    workedWell: [
      "Action Management Process実践検証100%達成: Sprint 53策定3ルール全実践、ルール遵守率100%達成",
      "SMART基準ガイドライン大幅強化: CLAUDE.mdに具体例8セット追加（良例3+悪例5）、実践可能レベルに具体化",
      "P0 Actions 100%達成: 前Sprint P0 2項目を確実実施、プロセス改善高コミットメント実証",
      "Feature/Process配分6:4達成: 新設計ルール初Sprint適用成功、持続可能な改善サイクル確立",
      "AI編集機能完全実装: メインビュー・サイドパネル両対応、7 subtasks完遂、+5t増加、Phase 16開始",
      "rate 58%→60%向上: 2 Sprint連続KPI min 50%達成、着実な改善継続",
    ],
    toImprove: [
      "P1 Actions実施率0%: 全体実施率50%（2/4）、P0は100%だがP1全未着手",
      "Action棚卸し2 Sprint連続未実施: Sprint 53からの継続課題「残41項目Action棚卸し」未着手、負債蓄積リスク",
      "実施率計算式未確立: executed/total計算に廃棄Actions扱い不明確、要定義",
      "Commit数報告差異: ユーザー報告8 commits vs scrum.ts記載7 commits、実績トラッキング精度要改善",
    ],
    actions: [
      "P0: Sprint 55 Planning時にP1 Actions 2項目をSubtaskとして組み込み、Feature/Process配分6:4維持",
      "P0: actionManagement.tracking計算式をCLAUDE.mdに明文化（executed加算・remaining減算ルール3項目）",
      "P1: 残41項目Action棚卸し実施、優先度再評価とrate 65%達成",
      "P1: Sprint実績トラッキング精度改善（commit数検証プロセス追加）",
      "P2: Action Management KPI healthy (70%)達成に向けたロードマップ策定",
    ] },
];

// Action Management (Sprint 54完了: rate 58%→60%(+2%)、2 Sprint連続KPI min 50%達成、詳細はgit履歴参照)
export const actionManagement = {
  kpi: { min: 50, healthy: 70, excellent: 90 },
  tracking: { total: 103, executed: 62, rate: 60, remaining: 41 },
  // Sprint 54: P0 Actions 2項目実施（Process実践検証・SMART具体例8セット追加）、P1 2項目継続（棚卸し・トラッキング精度）
  // Sprint 53: 15項目廃棄/統合、根本原因3軸分析完了、プロセス再設計ルール3項目確立（CLAUDE.md追記）
};

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
