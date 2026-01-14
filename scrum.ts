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
  sprint: { number: 54, pbi: "PBI-054", status: "in_progress" as SprintStatus,
    subtasksCompleted: 2, subtasksTotal: 7, impediments: 0 },
  phase: { number: 16, status: "in_progress", sprints: "54-55（見積もり）", pbis: "PBI-054, PBI-055", goal: "Phase 16: AI自然言語処理タスク編集・一括処理機能" },
};

// Product Goal
export const productGoal = {
  statement: "Obsidian内でtodo.txt形式のファイルを直感的に管理・表示する",
  owner: "@scrum-team-product-owner",
};

// Long-term Roadmap (Phase 15-17) - Sprint 53策定、詳細はgit履歴参照
export const roadmap = {
  phase15: { number: 15, goal: "プロセス基盤再構築", sprints: "53", pbis: ["PBI-053"], status: "done" },
  phase16: { number: 16, goal: "AI自然言語タスク編集・一括処理", sprints: "54-55", pbis: ["PBI-054", "PBI-055"], status: "not_started" },
  phase17: { number: 17, goal: "キーボードショートカット・高度検索", sprints: "56-57", pbis: ["PBI-056", "PBI-057"], status: "not_started" },
};

// Product Backlog (Order = Priority) - done PBIs compacted, see git history
export const productBacklog: ProductBacklogItem[] = [
  // Phase 1-14完了 (Sprint 1-52): 基本機能+UI実装+サイドパネル+AI連携、830t達成
  // Phase 15完了 (Sprint 53): プロセス基盤再構築、Action実施率58%達成、ロードマップ策定
  // Phase 16開始: AI自然言語タスク編集・一括処理
  {
    id: "PBI-054",
    story: { role: "ユーザー", capability: "既存タスクを選択し、AI自然言語入力で内容を更新できる", benefit: "タスク編集時にAIの支援を受け、編集効率が向上する" },
    acceptanceCriteria: [
      { criterion: "タスクアイテムに「AI編集」ボタンが表示され、クリックでAI編集ダイアログが開く", verification: "テストでAI編集ボタンレンダリング、クリックでダイアログ表示を確認" },
      { criterion: "AI編集ダイアログに既存タスク内容がプレフィル表示、自然言語入力フィールドを提供", verification: "テストで既存Todo表示、入力フィールドレンダリングを確認" },
      { criterion: "自然言語入力をOpenRouter APIで解析し、更新プレビューを表示", verification: "テストでAI編集→OpenRouter応答→プレビュー表示を確認" },
      { criterion: "プレビュー確認後、保存でファイル更新、リストに反映", verification: "テストでプレビュー→保存→ファイル更新→リスト再描画を確認" },
      { criterion: "メインビュー・サイドパネル両方で利用可能", verification: "テストで両ビューでAI編集ダイアログ動作を確認" }
    ],
    dependencies: [],
    status: "ready" as PBIStatus,
    complexity: { functions: 4, estimatedTests: 20, externalDependencies: 1, score: "MEDIUM" as const, subtasks: 5 }
  },
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
  sprint: 54,
  pbi: "PBI-054",
  goal: "既存タスクをAI自然言語入力で編集可能にし、メインビュー・サイドパネル両方でシームレスに利用できる機能を提供、併せてAction Management Process実践検証を完遂する",
  status: "in_progress" as SprintStatus,
  subtasks: [
    // Feature開発 Subtasks (60%)
    {
      test: "AI編集ボタンがTodoItemにレンダリング、クリックでAIEditDialogが表示される",
      implementation: "TodoItemコンポーネントにAI編集ボタン追加、AIEditDialog基本構造実装、ダイアログ表示ロジック実装",
      type: "behavioral" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [
        { phase: "red" as CommitPhase, message: "test: AI編集ボタンレンダリングとコールバック動作のテスト追加" },
        { phase: "green" as CommitPhase, message: "feat: AI編集ボタンをタスクアイテムに追加" },
        { phase: "green" as CommitPhase, message: "feat: AI編集ダイアログ基盤とメイン/サイドパネル統合完了" }
      ]
    },
    {
      test: "AIEditDialogに既存Todo内容がプレフィル表示、自然言語入力フィールドがレンダリングされる",
      implementation: "AIEditDialogにTodoプレフィル表示ロジック、自然言語入力textarea実装、UI構成完成",
      type: "behavioral" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [
        { phase: "green" as CommitPhase, message: "feat: AI編集ダイアログUI完成 - 自然言語入力フィールド追加" }
      ]
    },
    {
      test: "自然言語入力→OpenRouter API呼び出し→解析結果プレビュー表示が動作する",
      implementation: "OpenRouter API統合、プロンプト設計、レスポンス解析、プレビューエリア実装",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: []
    },
    {
      test: "プレビュー確認後保存→ファイル更新→TodosList再描画、メインビュー・サイドパネル両方で動作する",
      implementation: "保存処理実装、ファイル書き込みロジック、リスト再描画トリガー、サイドパネル統合",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: []
    },
    // プロセス改善 Subtasks (40%)
    {
      test: "Sprint 54でプロセス再設計ルール3項目（Planning時Subtask化・Retrospective時数値化・3 Sprint自動廃棄）遵守率100%を確認",
      implementation: "Planning時P0 Action 2項目をSubtask化（本Subtask + Subtask 6）、Feature/Process時間配分60%/40%実践（4 feature + 3 process subtasks）、Retrospective時P0 Action検証フォーマット準備完了",
      type: "structural" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [
        { phase: "refactor" as CommitPhase, message: "refactor(scrum): Action Management Process実践検証完了 - Planning時Subtask化・配分6:4達成" }
      ]
    },
    {
      test: "CLAUDE.mdにSMART基準良い例・悪い例3-5セット追加完了を確認",
      implementation: "過去Sprint ActionsからSMART基準適合/不適合事例抽出、良い例・悪い例を3-5セット作成、CLAUDE.md Action Management Processセクションに追記",
      type: "structural" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: []
    },
    {
      test: "DoD全項目（Tests/Lint/Types/Build）がpassし、Phase 16開始が宣言される",
      implementation: "DoD実行、Phase 16ステータス更新、Sprint完了確認",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: []
    }
  ] as Subtask[],
};
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
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  // Sprint 42-52: see git history
  { sprint: 53,
    workedWell: [
      "Phase 15完遂: rate 43%→58%(+15%)、KPI min 50%達成、4 Sprint連続未達から脱却",
      "Actions大規模整理成功: 15項目廃棄/統合、remaining 58→43、負債26%削減",
      "KPI未達根本原因分析完遂: 3軸分析（Feature時間圧迫・粒度不適切・判断基準不明確）",
      "プロセス再設計ルール3項目確立: Planning時Subtask化・Retrospective時数値化・3 Sprint自動廃棄",
      "長期ロードマップ策定: Phase 15-17（Sprint 53-57）戦略確定",
      "Sprint 52 Actions 100%達成: 5項目全て完全実施",
    ],
    toImprove: [
      "Action Management Process実践未検証: CLAUDE.md追記の3ルールがSprint 54で機能するか未確認",
      "Action粒度ガイドライン抽象的: SMART基準記載したが具体例不在",
      "残43項目Action棚卸し未実施: 整理後の優先度・粒度・実施計画不在",
    ],
    actions: [
      "P0: Sprint 54でAction Management Process実践検証（ルール遵守率100%目標）",
      "P0: Action粒度ガイドライン具体例追加（SMART基準良い例・悪い例3-5セット）",
      "P1: 残43項目Action棚卸しレビュー（Sprint 54-55、rate 65%目標）",
      "P1: Phase 16 PBI詳細化（PBI-054/055のBacklog Refinement）",
    ] },
];

// Action Management (Sprint 53完了: rate 43%→58%、KPI min 50%達成、詳細はgit履歴参照)
export const actionManagement = {
  kpi: { min: 50, healthy: 70, excellent: 90 },
  tracking: { total: 103, executed: 60, rate: 58, remaining: 43 },
  // Sprint 53: 15項目廃棄/統合、根本原因3軸分析完了、プロセス再設計ルール3項目確立（CLAUDE.md追記）
};

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
