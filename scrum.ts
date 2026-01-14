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
  sprint: { number: 52, pbi: "PBI-052", status: "done" as SprintStatus,
    subtasksCompleted: 5, subtasksTotal: 5, impediments: 0 },
  phase: { number: 14, status: "in_progress", sprints: "52-", pbis: "PBI-052", goal: "Phase 14: サイドパネルUI刷新 - Apple-likeモダンデザイン強化" },
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
  // Phase 13完了 (Sprint 48-51): サイドパネルフル機能化・バグ修正完了、821t達成(+20t, +2.5%)
  //   Sprint 48 PBI-051: サイドパネルボタン修正とリスト更新実装、805t(+4t)、done
  //   Sprint 49 PBI-050: メインビューAI機能統合、807t(+2t)、done
  //   Sprint 50 PBI-049: 検索フォーカス維持、813t(+6t)、done
  //   Sprint 51 PBI-048: サイドパネルフル機能化（追加/編集/削除/設定値引き継ぎ/コンパクトUI）、821t(+8t)、done

  // Phase 14: サイドパネルUI刷新 - Apple-likeモダンデザイン強化
  {
    id: "PBI-052",
    story: {
      role: "Obsidianユーザー",
      capability: "サイドパネルで洗練されたUIでタスクを管理できる",
      benefit: "狭いスペースでも快適にタスク操作ができ、作業効率が向上する",
    },
    acceptanceCriteria: [
      {
        criterion: "ヘッダーにステータスフィルター（全て/完了/未完了）とプログレスバー（完了率表示）を表示",
        verification: "pnpm vitest run src/view.test.ts --grep 'side panel header with status filter and progress'",
      },
      {
        criterion: "検索ボックスをApple-styleのピル型デザインで表示（角丸20px、プレースホルダー付き）",
        verification: "pnpm vitest run src/view.test.ts --grep 'side panel search box pill design'",
      },
      {
        criterion: "フィルタードロップダウン（なし/+project/@context）とソートドロップダウン（デフォルト/優先度/日付）を横並びで表示",
        verification: "pnpm vitest run src/view.test.ts --grep 'side panel filter sort dropdowns'",
      },
      {
        criterion: "タスクアイテムに[チェックボックス][優先度][説明]を1行目、[プロジェクト/コンテキストタグ]を2行目、[編集アイコン]を右端に表示",
        verification: "pnpm vitest run src/view.test.ts --grep 'side panel task item layout'",
      },
      {
        criterion: "フッターに「AIタスク追加」「タスク追加」の2つのボタンを横並びで固定表示（FABではなくフッターボタン形式）",
        verification: "pnpm vitest run src/view.test.ts --grep 'side panel footer buttons'",
      },
    ],
    dependencies: [],
    status: "ready" as PBIStatus,
    complexity: {
      functions: 10,
      estimatedTests: 18,
      externalDependencies: 0,
      score: "MEDIUM" as const,
      subtasks: 5,
    },
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

// Current Sprint (Sprint 52 - PBI-052: サイドパネルUI刷新) - COMPLETED
export const currentSprint = {
  sprint: 52,
  pbi: "PBI-052",
  goal: "サイドパネルUI刷新: Apple-likeモダンデザイン強化（プログレスバー・フィルター・フッターボタン）",
  status: "done" as SprintStatus,
  subtasks: [
    {
      test: "サイドパネルヘッダーに「全て/完了/未完了」のフィルターボタンと完了率表示プログレスバーをレンダリング、フィルター切り替えでタスクリスト更新を検証",
      implementation: "既存実装でAC1満たしている（ステータスフィルター・プログレスバーは既存のrenderControlBarに実装済み）",
      type: "behavioral" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [] as Commit[], // AC1は既存実装で満たしているため、コミットなし（Subtask 1はUser実装済み）
    },
    {
      test: "検索ボックスが角丸20px、プレースホルダー「タスク検索...」、Apple-styleのピル型スタイルでレンダリングされることを検証",
      implementation: "renderSearchBox関数でプレースホルダーを「検索...」→「タスク検索...」に変更、CSS既存のborder-radius: 20px活用",
      type: "behavioral" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [{ phase: "green", message: "feat: update search box placeholder to 'タスク検索...' for AC2 (8c41b8a)" }] as Commit[],
    },
    {
      test: "フィルタードロップダウン（なし/+project/@context）とソートドロップダウン（デフォルト/優先度/日付）が横並びでレンダリングされ、選択値が反映されることを検証",
      implementation: "既存実装でAC3満たしている（group-selector・sort-selectorはrenderControlBarで実装済み、CSSで横並び）",
      type: "behavioral" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [{ phase: "green", message: "test: add test for filter/sort dropdowns horizontal layout (AC3) (271421c)" }] as Commit[], // テスト追加のみ
    },
    {
      test: "タスクアイテムが1行目に[チェックボックス][優先度][説明]、2行目に[プロジェクト/コンテキストタグ]、右端に[編集アイコン]のレイアウトでレンダリングされることを検証",
      implementation: "既存実装でAC4満たしている（task-main-row・task-item-tags・task-actions-row構造は既存のrenderTaskItemに実装済み）",
      type: "behavioral" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [{ phase: "green", message: "test: add test for task item 2-line layout with edit icon (AC4) (948e272)" }] as Commit[], // テスト追加のみ
    },
    {
      test: "フッターに「AIタスク追加」「タスク追加」の2ボタンが横並びで固定表示され、FABではなくフッターボタン形式でレンダリングされることを検証",
      implementation: "renderFabContainer→renderFooterButtonsに名前変更、.fab-container→.footer-buttonsクラス変更、ボタンテキスト追加、レンダリング順序変更（FAB廃止）",
      type: "behavioral" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [
        { phase: "green", message: "feat: replace FAB with footer buttons for AC5 (974b547)" },
        { phase: "green", message: "test: update test expectation for footer button text (b4cd2d0)" },
      ] as Commit[],
    },
  ] as Subtask[],
};
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
  { sprint: 51, pbi: "PBI-048", story: "サイドパネルフル機能化（追加/編集/削除/設定値引き継ぎ/コンパクトUI）", verification: "passed", notes: "821t(+8t),Subtask5完了(4 behavioral+1 structural),6commits(2 GREEN-only,1 GREEN+REFACTOR,1 lint fix),タスク追加(ファイル選択),編集(EditTaskModal),削除(確認ダイアログ),設定値引き継ぎ,コンパクトUIスタイル,REFACTOR判断4項目チェック実施,DoD全pass,Phase 13完遂" },
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
  { sprint: 51,
    workedWell: [
      "Phase 13完遂達成: Sprint 48-51（4 Sprints、4 PBIs）で801t→821t（+20t、+2.5%）、サイドパネルフル機能化・バグ修正フェーズ完全達成",
      "MEDIUM PBI単Sprint完遂: PBI-048（5 subtasks、complexity MEDIUM）を1 Sprint内で完全実装、DoD全pass、計画通りの遂行力発揮",
      "Sprint 50 Actions完全遵守: 「Phase 13完遂優先」「Actions整理Sprint 52延期」「KPI達成ロードマップ策定」の3項目全て達成、100%実施率",
      "Behavioral機能集中成功: 5 subtasks中4がbehavioral（タスク追加・編集・削除・設定値引き継ぎ）、feature delivery最優先実現",
      "TDD規律維持: 6 commits（2 GREEN-only、1 GREEN+REFACTOR、1 lint fix）、RED phase 1回でもテスト先行アプローチ継続",
      "REFACTOR判断4項目チェック実施: Subtask完了時に重複コード/複雑度/命名/構造を評価、プロセス遵守継続",
      "Phase 13総合成果: Sprint 48 PBI-051（ボタン修正、+4t）、Sprint 49 PBI-050（AI統合、+2t）、Sprint 50 PBI-049（検索フォーカス、+6t）、Sprint 51 PBI-048（フル機能化、+8t）で包括的機能提供実現",
    ],
    toImprove: [
      "Action実施率KPI未達3連続: rate 43%維持（Sprint 49-51変化なし）、KPI min 50%未達が3 Sprint連続、構造的な問題認識必要",
      "Actions整理完全未実施: Sprint 49「最低10項目廃棄/統合」、Sprint 50「Actions整理Sprint 52延期」両方とも整理作業0、残54項目が高水準維持",
      "Backlog empty状態: Phase 13完遂後、Product Backlog完全空、Phase 14目標・PBI未策定、次Sprint開始不可状態",
      "Phase完遂優先によるプロセス負債蓄積: Phase 13完遂を最優先し、Action実施率・Actions整理を3 Sprint先送り、プロセス改善停滞",
    ],
    actions: [
      "Phase 14戦略策定緊急実施: Sprint 52開始前にBacklog Refinement実施、Product Goal再確認・Phase 14目標策定・PBI 3-5項目準備、Backlog empty解消",
      "Actions大規模整理実行: Sprint 52で残54項目から「3 Sprint以上経過かつ実施優先度低」を抽出、最低15項目廃棄/統合、rate 43%→50%以上到達必須",
      "KPI未達原因分析: Action実施率43%停滞（3 Sprint連続）の根本原因分析実施、「feature優先vsプロセス改善」バランス調整戦略策定",
      "Phase完遂後プロセス改善期設定: Phase完遂Sprint直後（Sprint 52）はfeature開発を抑制、累積プロセス負債解消・KPI達成・次Phase準備に集中",
    ] },
];

// Action Management (Sprint 51完了、rate 43%維持、KPI min 50%未達3連続 - Sprint 52で大規模整理緊急実施)
export const actionManagement = {
  kpi: { min: 50, healthy: 70, excellent: 90 },
  tracking: { total: 98, executed: 43, rate: 43, remaining: 55 },
  // Sprint 51完了: +4 new actions, 3 executed from Sprint 50 (Phase 13完遂優先・Actions整理Sprint 52延期・KPI達成ロードマップ策定全て達成、100%実施率)
  // Sprint 50 Actions実施状況: 3/3=100%（Phase 13完遂優先・Actions整理延期・ロードマップ策定全て達成）
  // Sprint 49 Actions実施状況: 1/3=33%（Behavioral機能優先のみ達成、KPI達成・Actions整理は延期）
  // rate停滞継続: 43%維持（Sprint 49-51変化なし）、KPI min 50%未達3 Sprint連続、構造的問題認識必要
  // Sprint 52緊急戦略: Phase 14準備（Backlog Refinement）+Actions大規模整理（15項目以上廃棄/統合）+KPI未達原因分析、rate 43%→50%以上到達必須
};

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
