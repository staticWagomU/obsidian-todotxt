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
  sprint: { number: 51, pbi: "PBI-048", status: "in_progress" as SprintStatus,
    subtasksCompleted: 1, subtasksTotal: 5, impediments: 0 },
  phase: { number: 13, status: "in_progress", sprints: "48-51", pbis: "PBI-051(done),PBI-050(done),PBI-049(done),PBI-048(in_progress)", goal: "サイドパネルフル機能化・バグ修正 - メインビュー同等機能をコンパクトUIで提供" },
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
  // Phase 13進行中 (Sprint 48-51): サイドパネルフル機能化・バグ修正
  //   Sprint 48 PBI-051: サイドパネルボタン修正とリスト更新実装、801t維持、done

  // Phase 13: サイドパネルフル機能化・バグ修正
  //   Sprint 49 PBI-050: メインビューAI機能統合、807t(+2t)、done
  //   Sprint 50 PBI-049: 検索フォーカス維持、813t(+6t)、done
  {
    id: "PBI-048",
    story: {
      role: "Obsidianユーザー",
      capability: "サイドパネルからメインビューと同等の機能（タスク追加・編集・削除・完了切替・フィルタリング・ソート・グループ化）をコンパクトなUIで操作できる",
      benefit: "メインビューを開かずにサイドバーから素早くタスク管理ができ、作業効率が向上する",
    },
    acceptanceCriteria: [
      { criterion: "サイドパネルから設定で登録した全todotxtファイルにタスクを追加できる", verification: "pnpm vitest run src/side-panel-view.test.ts -- --grep 'add task'" },
      { criterion: "サイドパネルからタスクの編集ができる（EditTaskModal連携）", verification: "pnpm vitest run src/side-panel-view.test.ts -- --grep 'edit task'" },
      { criterion: "サイドパネルからタスクの削除ができる（確認ダイアログ付き）", verification: "pnpm vitest run src/side-panel-view.test.ts -- --grep 'delete task'" },
      { criterion: "検索ボックスでタスクをリアルタイムフィルタリングできる", verification: "pnpm vitest run src/side-panel-view.test.ts -- --grep 'search'" },
      { criterion: "ソート順が設定値（defaultSortOrder）を引き継ぐ", verification: "pnpm vitest run src/side-panel-view.test.ts -- --grep 'sort.*settings'" },
      { criterion: "グループ化が設定値（defaultGrouping）を引き継ぐ", verification: "pnpm vitest run src/side-panel-view.test.ts -- --grep 'group.*settings'" },
      { criterion: "UIがメインビューよりコンパクト（パディング・フォントサイズ縮小）", verification: "grep -q 'todotxt-sidepanel-compact' styles.css" },
      { criterion: "複数ファイル選択時に追加先ファイルを選択できる", verification: "pnpm vitest run src/side-panel-view.test.ts -- --grep 'file selection'" },
    ],
    dependencies: [],
    status: "ready" as PBIStatus,
    complexity: { functions: 8, estimatedTests: 12, externalDependencies: 0, score: "MEDIUM", subtasks: 5 },
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

// Current Sprint (Sprint 51実行中)
export const currentSprint = {
  sprint: 51,
  pbi: "PBI-048",
  goal: "サイドパネルからメインビュー同等のタスク操作機能を提供し、Phase 13を完遂する",
  status: "in_progress" as SprintStatus,
  subtasks: [
    {
      test: "サイドパネルから設定登録された全todotxtファイルにタスクを追加でき、複数ファイル選択時にファイル選択ダイアログが表示される",
      implementation: "AddTaskModal（またはダイアログ）実装、ファイル選択UI追加、複数ファイル時のファイル選択ロジック実装",
      type: "behavioral" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [
        { phase: "red" as CommitPhase, message: "test(side-panel): add file selection test for multiple files" },
        { phase: "green" as CommitPhase, message: "feat(side-panel): implement file selection for multiple files - Subtask 1完了" },
      ],
    },
    {
      test: "サイドパネルからタスクを選択して編集ボタンをクリックするとEditTaskModalが開き、編集内容が反映される",
      implementation: "EditTaskModalの呼び出し処理実装、タスク選択状態管理、編集後のリスト更新処理",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
    {
      test: "サイドパネルからタスク削除ボタンをクリックすると確認ダイアログが表示され、確認後に削除される",
      implementation: "削除確認ダイアログ実装、削除処理とファイル保存、リスト更新処理",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
    {
      test: "サイドパネルのタスクリストが設定値（defaultSortOrder、defaultGrouping）を引き継ぎ、ソート・グループ化される",
      implementation: "設定値の読み込み処理、TodoSidePanelViewでのソート・グループ化ロジック実装",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
    {
      test: "サイドパネルのUIがメインビューよりコンパクト（パディング・フォントサイズ縮小）になっている",
      implementation: "styles.cssにtodotxt-sidepanel-compactクラス追加、パディング・フォントサイズ調整",
      type: "structural" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
  ] as Subtask[],
};
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
  // Phase 13 (Sprint 48-51): サイドパネルフル機能化・バグ修正開始
  { sprint: 48, pbi: "PBI-051", story: "サイドパネルボタン修正とリスト更新実装", verification: "passed", notes: "805t(+4t),Subtask1完了(RED1+GREEN1+REFACTOR2=4commit),既存実装テスト追加,共通処理抽出,Promise処理適正化,IMP-048-1/2解決,Phase 13開始" },
  { sprint: 49, pbi: "PBI-050", story: "メインビューAI機能統合+プロセス改善基盤確立", verification: "passed", notes: "807t(+2t),Subtask3完了(RED1+GREEN4commit),AC2/AC3テスト追加,REFACTOR判断4項目チェック体制確立,累積Actions整理(29項目→2項目実施),actionManagement改善(41%→43%)" },
  { sprint: 50, pbi: "PBI-049", story: "検索ボックスフォーカス維持機能実装", verification: "passed", notes: "813t(+6t),Subtask2完了(RED2+GREEN2+bugfix1=5commit),サイドパネル/メインビュー両方対応,renderTaskListOnly/renderTaskListSection部分更新実装,REFACTOR判断2回不要,DoD全pass,actionManagement rate 43%維持" },
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  // Sprint 42: Phase 9完遂、REFACTOR率50%達成、CSS 214→513行 - see git history
  // Sprint 43: 740t(+114t)、70エッジケーステスト追加、Phase 10開始 - see git history
  // Sprint 44: 738t(-2t統合化)、Phase 10完遂、Actions 5項目未消化 - see git history
  // Sprint 45: 762t(+24t)、アーカイブ機能実装、REFACTOR 3連続未実施 - see git history
  // Sprint 46: 770t(+8t)、サイドパネル実装、REFACTOR 4連続未実施、Action実施率0% - see git history
  // Sprint 47: 801t(+31t)、AI連携実装、REFACTOR復活、Action実施率0% - see git history
  { sprint: 48,
    workedWell: [
      "REFACTOR習慣定着継続: 2 Sprint連続で2 REFACTOR commits実施（共通処理抽出+Promise処理適正化）、習慣化の兆し",
      "Impediments迅速解決: IMP-048-1（テスト期待値不一致）+IMP-048-2（Lintエラー5件）を同一Sprint内で完全解消",
      "既存負債クリーンアップ: Sprint開始前から存在していた技術負債（view.test.ts期待値、main.ts Promise処理）を体系的に解決",
      "DoD完全達成: Impediments解決後、Tests/Lint/Types/Build全てpass、品質基準維持",
      "テストカバレッジ向上: 801t→805t(+4t, 0.5%増)、サイドパネルボタン操作の包括的テスト追加",
      "Phase 13開始: サイドパネルフル機能化・バグ修正フェーズのキックオフ成功",
    ],
    toImprove: [
      "Sprint 47 Actions実施率20%: 5項目中1項目のみ実施（REFACTOR習慣のみ達成）、目標60%に対して大幅未達",
      "Actions優先順位付け不足: Action実施最優先化・REFACTOR判断可視化・累積Actions整理が全て未実施",
      "既存負債によるSprint妨害: DoD Tests/Lintが既存負債で失敗、新規実装以外の修正作業が発生",
      "Action execution tracking未実施: Sprint 47 Actions実施状況の数値化が行われず、進捗可視化が不十分",
    ],
    actions: [
      "Sprint開始前DoD実行義務化: Planning開始前にDoD 4項目（Tests/Lint/Types/Build）実行、既存負債を事前に可視化しImpedimentsとして記録",
      "Action実施Subtask化: Sprint 49 Planningで過去未実施Actions（Sprint 47-48累積）から最低2項目選定、明示的にSubtaskとして組み込み",
      "REFACTOR判断4項目チェック記録: 各GREEN完了時に（1）重複コード、（2）複雑度、（3）命名、（4）構造の4項目を明示的評価、scrum.tsに記録",
      "Action実施率トラッキング厳格化: Retrospective時に前Sprint Actions実施状況を必ず数値化（例: 5項目中1項目実施=20%）、actionManagementに反映",
      "累積Actions整理プロセス確立: 5 Sprint以上経過したActionsは「廃棄/統合/実施」判断を実施、actionManagement.trackingから削除または明示的に再計画",
    ] },
  { sprint: 49,
    workedWell: [
      "Sprint 48 Actions完全達成: 5項目全て実施（DoD義務化・Subtask化・REFACTOR判断記録・トラッキング厳格化・累積Actions整理）、史上初100%実施率",
      "プロセス改善基盤確立: REFACTOR判断4項目チェック体制確立（重複コード/複雑度/命名/構造）、scrum.tsへの記録フロー定着",
      "累積Actions大規模整理完了: Sprint 43-46技術Actions廃棄（~20項目）、Sprint 47-48プロセス改善Actions統合、actionManagement tracking健全化",
      "REFACTOR習慣完全定着: 3 Sprint連続REFACTOR実施、判断プロセス明文化により習慣化が確実に",
      "Action実施率改善継続: 41%→43%(+2pt)、KPI min 50%まであと7pt、改善傾向維持",
      "feature+process同時推進成功: メインビューAI機能統合（behavioral）とプロセス改善（structural 2 subtasks）を並行実施",
    ],
    toImprove: [
      "Action実施率KPI未達: 43% < 50% (KPI min)、あと7pt不足、次Sprintで最優先達成必要",
      "残Action数依然高水準: 50項目残存、次Sprintで10項目以上の実施/廃棄/統合が必要",
      "プロセス改善Action偏重: Sprint 49は3 subtasks中2がstructural、次Sprintはbehavioral機能実装を優先すべき",
    ],
    actions: [
      "KPI min達成最優先化: Sprint 50で累積Actions最低10項目実施/廃棄、rate 43%→53%(+10pt)到達、KPI min 50%超過を確実に",
      "Behavioral機能優先: Sprint 50では最低2 behavioral subtasks実施、structural subtaskは1以下に抑制、feature delivery速度維持",
      "Actions整理継続: Sprint 50 Retrospectiveで残50項目から「3 Sprint以上経過かつ実施優先度低」を抽出、最低10項目廃棄/統合",
    ] },
  { sprint: 50,
    workedWell: [
      "Behavioral機能優先達成: Sprint 49 Action完全遵守、2/2 subtasksがbehavioral、feature delivery速度維持",
      "小規模PBIの高速完遂: PBI-049（検索フォーカス維持）を2 subtasks・5 commitsでクリーン完遂、DoD全pass",
      "REFACTOR判断プロセス定着: 2回とも4項目チェック（重複コード/複雑度/命名/構造）実施、両方「不要」判断記録",
      "バグ修正迅速対応: 検索フォーカス問題をサイドパネル+メインビュー両方で解決、bugfix commit 1回",
      "テストカバレッジ維持: 807t→813t(+6t)、部分更新実装の包括的テスト追加",
      "Phase 13進捗: Sprint 48-50で3 PBIs完了、残PBI-048のみでPhase完遂目前",
    ],
    toImprove: [
      "Action実施率停滞: rate 43%維持（Sprint 49から変化なし）、KPI min 50%未達2 Sprint連続",
      "Actions整理未実施: Sprint 49 Action「最低10項目廃棄/統合」未実施、残52項目に対して整理作業0",
      "KPI達成戦略不足: Sprint 50は小規模PBIのため整理作業時間不足、大規模Sprint時の統合戦略が必要",
    ],
    actions: [
      "Phase 13完遂優先: Sprint 51でPBI-048（サイドパネルフル機能化、MEDIUM complexity、5 subtasks）完遂、Phase 13完了を最優先",
      "Actions整理Sprint 52延期: PBI-048大規模実装に集中、Action整理作業はSprint 52 Retrospectiveで実施（10項目以上廃棄/統合）",
      "KPI達成ロードマップ策定: Sprint 52で大規模Actions整理（rate 43%→53%以上）+Phase 14開始準備を並行実施",
    ] },
];

// Action Management (Sprint 50完了、rate 43%維持、KPI min 50%未達2連続 - Sprint 52で大規模整理予定)
export const actionManagement = {
  kpi: { min: 50, healthy: 70, excellent: 90 },
  tracking: { total: 94, executed: 40, rate: 43, remaining: 54 },
  // Sprint 50完了: +3 new actions, 1 executed from Sprint 49 (Behavioral機能優先のみ達成、Actions整理・KPI達成は未実施)
  // Sprint 49 Actions実施状況: 1/3=33%（Behavioral機能優先のみ達成、KPI達成・Actions整理は延期）
  // rate停滞: 43%維持（Sprint 49から変化なし）、KPI min 50%未達2 Sprint連続
  // Sprint 52戦略: Phase 13完遂（Sprint 51 PBI-048）後、大規模Actions整理（10項目以上廃棄/統合）実施、rate 43%→53%以上目標
};

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
