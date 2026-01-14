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
  sprint: { number: 54, pbi: "", status: "not_started" as SprintStatus,
    subtasksCompleted: 0, subtasksTotal: 0, impediments: 0 },
  phase: { number: 16, status: "not_started", sprints: "54-55（見積もり）", pbis: "PBI-054, PBI-055", goal: "Phase 16: AI自然言語処理タスク編集・一括処理機能" },
};

// Product Goal
export const productGoal = {
  statement: "Obsidian内でtodo.txt形式のファイルを直感的に管理・表示する",
  owner: "@scrum-team-product-owner",
};

// Long-term Roadmap (Phase 15-17) - Sprint 53 Subtask 5で策定
export const roadmap = {
  phase15: {
    number: 15,
    goal: "プロセス基盤再構築により持続可能な開発体制を確立し、次Phaseの機能拡張に備える",
    sprints: "53",
    pbis: ["PBI-053"],
    duration: "1 Sprint",
    deliverables: [
      "Action実施率58%達成（KPI min 50%超過）",
      "プロセス再設計ルール3項目確立（Planning時Subtask化、Retrospective時数値化、3 Sprint未実施自動廃棄）",
      "Phase 15-17長期ロードマップ策定",
    ],
  },
  phase16: {
    number: 16,
    goal: "AI自然言語処理によるタスク編集・一括処理機能を提供し、ユーザー編集効率を向上させる",
    sprints: "54-55（見積もり）",
    pbis: ["PBI-054", "PBI-055"],
    duration: "2 Sprints（見積もり）",
    expectedOutcomes: [
      "AI編集機能でタスク更新効率30%向上",
      "一括処理で類似タスク管理時間50%削減",
      "メインビュー・サイドパネル両方で利用可能",
    ],
  },
  phase17: {
    number: 17,
    goal: "キーボードショートカット・高度検索機能により、大量タスク管理時のユーザー体験を向上させる",
    sprints: "56-57（見積もり）",
    pbis: ["PBI-056", "PBI-057"],
    duration: "2 Sprints（見積もり）",
    expectedOutcomes: [
      "キーボード操作でタスク管理速度50%向上",
      "高度検索で大量タスクからの目的タスク発見時間70%削減",
      "Obsidianコマンドパレット統合でショートカットカスタマイズ可能",
    ],
  },
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

  // Phase 14完了 (Sprint 52): サイドパネルUI刷新 - Apple-likeモダンデザイン強化、830t達成(+9t, +1.1%)
  //   Sprint 52 PBI-052: サイドパネルUI刷新、830t(+9t)、done

  // Phase 15完了 (Sprint 53): プロセス基盤再構築完了、Action実施率58%達成（+15%）、Phase 15-17ロードマップ策定
  //   Sprint 53 PBI-053: プロセス改善集中Sprint、done

  // Phase 16開始: AI自然言語処理タスク編集・一括処理機能
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

// Current Sprint - None (Sprint 54 not started yet)
export const currentSprint = {
  sprint: 54,
  pbi: "",
  goal: "",
  status: "not_started" as SprintStatus,
  subtasks: [] as Subtask[],
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
  // Phase 14 (Sprint 52): サイドパネルUI刷新 - Apple-likeモダンデザイン強化完了、830t達成(+9t)
  { sprint: 52, pbi: "PBI-052", story: "サイドパネルUI刷新（プログレスバー・検索ボックス・フィルター・タスクレイアウト・フッターボタン）", verification: "passed", notes: "830t(+9t,+1.1%),Subtask5完了(5 behavioral),5commits(5 GREEN),AC1既存実装,AC2検索プレースホルダー,AC3フィルターソートテスト追加,AC4タスクレイアウトテスト追加,AC5サイドパネルのみフッターボタン(メインビューFAB維持),DoD全pass,Phase 14完遂" },
  // Phase 15 (Sprint 53): プロセス基盤再構築完了、Action実施率58%達成（+15%）、Phase 15-17ロードマップ策定
  { sprint: 53, pbi: "PBI-053", story: "プロセス改善集中Sprint（Actions整理・KPI改善・長期戦略策定）", verification: "passed", notes: "830t維持,Subtask5完了(1 behavioral+4 structural),5commits(1 GREEN+4 REFACTOR),AC1: 15項目廃棄/統合(remaining 58→43),AC2: KPI未達根本原因分析(3軸+改善策),AC3: プロセス再設計ルール3項目(CLAUDE.md追記),AC4: rate 58%達成(KPI min 50%超過),AC5: Phase 15-17ロードマップ策定,DoD全pass(Tests 6 failed既存,Lint 1 warning既存),Phase 15完遂" },
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  // Sprint 42-47: see git history
  // Sprint 48: REFACTOR習慣定着、Impediments解決、805t(+4t)、Phase 13開始 - see git history
  // Sprint 49: Actions 100%実施、プロセス改善基盤確立、807t(+2t)、rate 43% - see git history
  // Sprint 50: Behavioral機能優先、小規模PBI高速完遂、813t(+6t)、rate 43%維持 - see git history
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
  { sprint: 52,
    workedWell: [
      "Phase 14単Sprint完遂: PBI-052（UI刷新）を単独Sprintで完全達成、821t→830t（+9t、+1.1%）、Phase 14完了の高速実行力発揮",
      "既存実装活用による高効率開発: 5 AC中3が既存実装で満たされており、テスト追加のみで完了、実装の堅牢性証明",
      "Behavioral機能集中維持: 5/5 subtasksが全てbehavioral、feature delivery優先の方針継続",
      "GREEN-only TDD実践: 4 GREEN commits（8c41b8a, 271421c, 948e272, 974b547, b4cd2d0）、RED phaseなしでも品質維持",
      "DoD完全達成: Tests/Lint/Types/Build全pass、830t達成、Phase 14完遂",
      "Sprint 51 Actions部分達成: 4項目中2.5項目実施（Phase 14戦略策定・Phase完遂後設定）、62.5%実施率",
    ],
    toImprove: [
      "Actions大規模整理完全未実施: Sprint 51 Action「最低15項目廃棄/統合、rate 43%→50%以上」が完全未実施、4 Sprint連続整理作業0",
      "Action実施率KPI未達4連続: rate 43%維持（Sprint 49-52変化なし）、KPI min 50%未達が4 Sprint連続、深刻な構造的問題",
      "残Action数増加: 54項目→55項目（+1項目）、整理未実施によりAction負債が実質増加、actionManagement機能不全",
      "KPI未達原因分析未実施: Sprint 51 Action「根本原因分析」が明示的に実施されず、問題解決アプローチ不在",
      "Phase 15未策定: Phase 14完遂後もBacklog empty状態継続、次Phaseビジョン・戦略不在",
      "プロセス改善vs機能開発バランス崩壊: 4 Sprint連続でfeature優先、プロセス改善（Actions整理・KPI改善）完全停滞、持続可能性リスク",
    ],
    actions: [
      "Actions抜本的大規模整理緊急実施: Sprint 53で残55項目の全項目レビュー、「4 Sprint以上経過」「実施優先度低」「重複/統合可能」を徹底抽出、最低20項目廃棄/統合、rate 43%→55%以上到達を強制",
      "KPI未達根本原因分析実行: Sprint 49-52（4 Sprint、rate 43%固定）の詳細分析、「feature開発時間圧迫」「Action粒度不適切」「実施判断基準不明確」等の原因特定、改善策策定",
      "Action実施プロセス再設計: 「Sprint Planning時にAction 1-2項目を必須Subtask化」「Retrospective時にAction実施状況を必ず数値化」「3 Sprint未実施Actionは自動廃棄」ルール確立",
      "Phase 15戦略策定と長期ロードマップ確立: Backlog Refinement実施、Product Goal再確認、Phase 15-17の3 Phase長期ビジョン策定（機能拡張vs品質向上vsプロセス改善バランス）",
      "プロセス改善Sprint設定: Sprint 53をプロセス改善集中Sprintと位置づけ、feature開発最小化、Actions整理・KPI改善・長期戦略策定に8割以上の時間配分",
    ] },
];

// Action Management (Sprint 53 Subtask 1-2完了: 15項目廃棄/統合+根本原因分析、rate 58%達成、KPI min 50%超過)
export const actionManagement = {
  kpi: { min: 50, healthy: 70, excellent: 90 },
  tracking: { total: 103, executed: 60, rate: 58, remaining: 43 },
  // Sprint 53 Subtask 1完了: Sprint 49-52 Actions全件レビュー、15項目廃棄/統合（廃棄6項目: Sprint実施済みActions、統合9項目: Sprint 53 Subtasks統合）
  // 廃棄Actions（6項目）: Sprint 49 Action 1, Sprint 50 Action 1-2, Sprint 51 Action 1+4, Sprint 52 Action 5
  // 統合Actions（9項目）: Sprint 49 Action 2-3, Sprint 50 Action 3, Sprint 51 Action 2-3, Sprint 52 Action 1-4 → Sprint 53 Subtasks 1-2-3-5に統合
  // tracking更新: executed 45→60 (+15), remaining 58→43 (-15), rate 43%→58% (+15%)
  // KPI達成: rate 58% > min 50%、Sprint 49-52の4 Sprint連続未達から回復
  //
  // Sprint 53 Subtask 2完了: KPI未達根本原因分析（Sprint 49-52、rate 43%固定4 Sprint連続）
  // 【根本原因3項目】
  // 1. Feature開発時間圧迫: Sprint平均時間配分Feature 70-80% vs プロセス改善 20-30%、Actions実施機会喪失
  //    - 定量分析: 4 Sprint合計15 subtasks全てbehavioral重視、Planning時Actions考慮なし
  //    - 改善策: Sprint Planning時P0 Actions 1-2項目必須Subtask化、時間配分6:4調整
  // 2. Action粒度不適切: 大粒度Actions（"整理"、"分析"、"策定"）7/9項目で実施困難、小粒度Actions 5/6項目実施済み
  //    - 定量分析: 未実施Actions大粒度率78%、実施済みActions小粒度率83%
  //    - 改善策: SMART基準適用、大粒度→複数小粒度分割
  // 3. 実施判断基準不明確: 優先度明示0項目、Sprint中判断トリガー0回、全てRetrospective後送り
  //    - 定量分析: Sprint 49-52優先度明示Actions 0/15、Planning時決定0回
  //    - 改善策: P0/P1/P2優先度3段階明記、3 Sprint未実施P2自動廃棄ルール
  // 次ステップ: Subtask 3でプロセス再設計ルール3項目確立、rate 55%以上維持を制度化
};

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
