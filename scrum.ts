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
  sprint: { number: 30, pbi: "PBI-032", status: "in_progress" as SprintStatus,
    subtasksCompleted: 3, subtasksTotal: 5, impediments: 0 },
};

// Product Goal
export const productGoal = {
  statement: "Obsidian内でtodo.txt形式のファイルを直感的に管理・表示する",
  owner: "@scrum-team-product-owner",
};

// Product Backlog (Order = Priority) - done PBIs compacted, see git history for details
export const productBacklog: ProductBacklogItem[] = [
  // Phase 1-4: COMPLETE (Sprint 1-20) - 20 PBIs done, see completedSprints for summary
  { id: "PBI-001", story: { role: "user", capability: ".txt/.todotxt専用ビュー", benefit: "適切UI表示" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-002", story: { role: "user", capability: "todo.txtパース", benefit: "構造化リスト" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-003", story: { role: "user", capability: "完了切替", benefit: "ワンクリック更新" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-004", story: { role: "user", capability: "新規作成", benefit: "簡単追加" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-005", story: { role: "user", capability: "編集", benefit: "内容修正" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-006", story: { role: "user", capability: "削除", benefit: "除去" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-007", story: { role: "user", capability: "ソート", benefit: "優先度順" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-008", story: { role: "user", capability: "優先度バッジ", benefit: "視覚識別" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-009", story: { role: "user", capability: "優先度フィルタ", benefit: "絞込" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-010", story: { role: "user", capability: "テキスト検索", benefit: "キーワード絞込" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-011", story: { role: "user", capability: "グループ化", benefit: "まとめ表示" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-012", story: { role: "user", capability: "due:表示", benefit: "期限確認" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-013", story: { role: "user", capability: "t:表示", benefit: "着手時期識別" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-014", story: { role: "user", capability: "[[Note]]リンク", benefit: "関連ノート把握" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-015", story: { role: "user", capability: "[text](url)リンク", benefit: "外部リソース把握" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-016", story: { role: "user", capability: "rec:繰り返し", benefit: "自動生成" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-017", story: { role: "user", capability: "pri:タグ保存", benefit: "優先度維持" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-018", story: { role: "user", capability: "設定画面", benefit: "カスタマイズ" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-019", story: { role: "user", capability: "フォーム入力", benefit: "構文不要" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-020", story: { role: "user", capability: "UI統合", benefit: "実働確認" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-021", story: { role: "dev", capability: "recurrence.tsリファクタ", benefit: "保守性向上" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  // Phase 5: COMPLETE (Sprint 21-24) - リリース準備完了、see completedSprints for summary
  { id: "PBI-022", story: { role: "user", capability: "READMEドキュメント", benefit: "機能理解" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-023", story: { role: "dev", capability: "Roadmap定義", benefit: "方向性明確化" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-024", story: { role: "user", capability: "デモシナリオ", benefit: "使い方理解" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  // Phase 6: UI実装 (Sprint 25 done)
  { id: "PBI-025", story: { role: "user", capability: "todo.txt基本UI描画", benefit: "視覚的タスク確認" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  // Phase 6: UI実装 (Sprint 26 done)
  { id: "PBI-026", story: { role: "user", capability: "タスク追加UI", benefit: "GUIでタスク追加" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  // Phase 6: Critical Bug Fix (Sprint 27 done)
  { id: "PBI-027", story: { role: "user", capability: "データ保持", benefit: "損失防止" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  // Phase 6: UI統合 (Sprint 28 done)
  { id: "PBI-028", story: { role: "user", capability: "タスクUI操作", benefit: "直感的管理" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  // Phase 6: UI表示 (Sprint 29 done)
  { id: "PBI-029", story: { role: "user", capability: "due:/t:視覚表示", benefit: "期限一目確認" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  // Phase 6: Action返済Sprint (最優先 - 累積10件Action未実行の深刻化対応)
  {
    id: "PBI-032",
    story: { role: "dev", capability: "累積Retrospective Action実行による技術的負債返済", benefit: "改善サイクル機能回復" },
    acceptanceCriteria: [
      { criterion: "view統合テスト最小MVP", verification: "UI操作→データ保持フローの統合テスト1-2ケース追加、pass確認" },
      { criterion: "Action管理プロセス文書化", verification: "Sprint Planning時のAction評価手順をscrum.ts等に明記" },
      { criterion: "Action実行率KPI設定", verification: "50%以上目標をscrum.tsに明記、次Sprint以降追跡可能" },
    ],
    dependencies: [],
    status: "ready",
    complexity: { functions: 1, estimatedTests: 5, externalDependencies: 1, score: "MEDIUM", subtasks: 5 },
  },
  // Phase 6: 継続UI機能実装
  {
    id: "PBI-030",
    story: { role: "user", capability: "コントロールバーによるフィルタ・ソート・グループ", benefit: "タスク整理と絞込" },
    acceptanceCriteria: [
      { criterion: "優先度フィルタ", verification: "ドロップダウンで優先度フィルタ動作" },
      { criterion: "テキスト検索", verification: "検索ボックスでリアルタイム絞込" },
      { criterion: "グループ化", verification: "プロジェクト/コンテキスト/優先度でグループ表示" },
      { criterion: "ソート", verification: "未完了→完了、優先度順、テキスト順でソート" },
    ],
    dependencies: ["PBI-028"],
    status: "ready",
    complexity: { functions: 4, estimatedTests: 15, externalDependencies: 0, score: "MEDIUM", subtasks: 5 },
  },
  {
    id: "PBI-031",
    story: { role: "user", capability: "内部/外部リンクのクリック可能表示", benefit: "関連リソースへ素早くアクセス" },
    acceptanceCriteria: [
      { criterion: "内部リンク", verification: "[[Note]]がクリック可能、クリックでノート開く" },
      { criterion: "外部リンク", verification: "http/https URLがクリック可能" },
      { criterion: "rec:表示", verification: "rec:タグに繰り返しアイコン表示" },
    ],
    dependencies: ["PBI-028"],
    status: "ready",
    complexity: { functions: 3, estimatedTests: 12, externalDependencies: 1, score: "MEDIUM", subtasks: 5 },
  },
  {
    id: "PBI-033",
    story: { role: "user", capability: "コントロールバーUI", benefit: "フィルタ・ソート・グループ操作" },
    acceptanceCriteria: [
      { criterion: "フィルタUI", verification: "優先度/完了状態ドロップダウン表示、選択で絞込動作" },
      { criterion: "検索UI", verification: "テキスト入力ボックス表示、入力でリアルタイム検索" },
      { criterion: "ソート/グループUI", verification: "ソート順・グループ化切替ボタン表示、クリックで表示変更" },
    ],
    dependencies: ["PBI-030"],
    status: "refining",
    complexity: { functions: 3, estimatedTests: 10, externalDependencies: 0, score: "MEDIUM", subtasks: 5 },
  },
  {
    id: "PBI-034",
    story: { role: "dev", capability: "view.tsをhandlers/rendering層に分離", benefit: "300行超回避と保守性向上" },
    acceptanceCriteria: [
      { criterion: "handlers分離", verification: "getToggleHandler等4メソッドをsrc/lib/handlers.ts化、view.tsから参照" },
      { criterion: "rendering分離", verification: "renderTaskList()をsrc/lib/rendering.ts化、view.tsは200行以下に削減" },
      { criterion: "既存テスト全通過", verification: "リファクタリング後も504tests全pass維持、振る舞い変更なし確認" },
    ],
    dependencies: [],
    status: "ready",
    complexity: { functions: 2, estimatedTests: 0, externalDependencies: 0, score: "LOW", subtasks: 3 },
    refactorChecklist: [
      "src/lib/handlers.ts作成 - 4 handler functions移動 (getToggleHandler/getAddHandler/getEditHandler/getDeleteHandler)",
      "src/lib/rendering.ts作成 - renderTaskList()移動 (150行の大規模メソッド分離)",
      "view.ts import更新、244行→150行以下目標 (40%削減)",
      "既存テスト全通過確認 (504 tests = Sprint 30現在、統合テスト2件追加済)",
    ],
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
  sprint: 30,
  pbi: "PBI-032",
  goal: "累積10件のRetrospective Action実行による改善サイクル機能回復と技術的負債返済開始",
  status: "in_progress" as SprintStatus,
  subtasks: [
    {
      test: "UI操作→データ保持→ファイル保存の統合テストケース作成",
      implementation: "view integration test 1-2ケース実装、UI操作→データ保持フローのpass確認",
      type: "behavioral",
      status: "completed",
      commits: [
        { phase: "red", message: "test: view統合テスト最小MVP追加 - UI操作→データ保持→ファイル保存フロー検証" },
        { phase: "green", message: "feat: view統合テスト2ケース実装完了 - UI操作からファイル保存までの完全フロー検証pass" },
      ],
    },
    {
      test: "N/A（文書化タスク）",
      implementation: "Sprint Planning時のAction評価手順をscrum.tsのactionManagementセクションに明記、評価フロー定義",
      type: "structural",
      status: "completed",
      commits: [
        { phase: "green", message: "docs: Action管理プロセス文書化強化 - Sprint Planning評価手順とPBI変換ガイドライン明記" },
      ],
    },
    {
      test: "N/A（設定タスク）",
      implementation: "Action実行率KPI 50%以上目標をscrum.tsに明記、tracking項目で次Sprint以降追跡可能化",
      type: "structural",
      status: "completed",
      commits: [
        { phase: "green", message: "docs: Action実行率KPI設定完了 - 3段階目標・履歴追跡・改善ロードマップ定義" },
      ],
    },
    {
      test: "N/A（PBI refinementタスク）",
      implementation: "view.tsリファクタリングPBI-034のcomplexity・refactorChecklist検証、ready状態確認",
      type: "structural",
      status: "pending",
      commits: [],
    },
    {
      test: "N/A（リファクタリングタスク）",
      implementation: "view.ts小規模リファクタリング1コミット実施（renderTaskList()メソッド分割等）、REFACTOR文化再構築",
      type: "structural",
      status: "pending",
      commits: [],
    },
  ] as Subtask[],
};

// Impediments
export const impediments = { active: [] as { id: string; description: string; status: string }[], resolved: [] as string[] };

// Definition of Done
export const definitionOfDone = {
  checks: [
    { name: "Tests", run: "pnpm vitest run" },
    { name: "Lint", run: "pnpm lint" },
    { name: "Types", run: "pnpm tsc --noEmit --skipLibCheck" },
    { name: "Build", run: "pnpm build" },
  ],
};

// Completed Sprints (Phase 1: Sprint 1-7, Phase 2: Sprint 8-12, Phase 3: Sprint 13-17, Phase 4: Sprint 18-19, Phase 5: Sprint 20-24)
export const completedSprints: CompletedSprint[] = [
  { sprint: 1, pbi: "PBI-001", story: ".txt/.todotxt専用ビュー", verification: "passed", notes: "3st" },
  { sprint: 2, pbi: "PBI-002", story: "todo.txtパース", verification: "passed", notes: "6st,30t" },
  { sprint: 3, pbi: "PBI-003", story: "完了切替", verification: "passed", notes: "5st,57t" },
  { sprint: 4, pbi: "PBI-004", story: "新規タスク作成", verification: "passed", notes: "5st,77t" },
  { sprint: 5, pbi: "PBI-005", story: "タスク編集", verification: "passed", notes: "5st,102t" },
  { sprint: 6, pbi: "PBI-006", story: "タスク削除", verification: "passed", notes: "4st,120t" },
  { sprint: 7, pbi: "PBI-007", story: "ソート表示", verification: "passed", notes: "3st,132t,Phase1完" },
  { sprint: 8, pbi: "PBI-008", story: "優先度色分けバッジ", verification: "passed", notes: "4st,153t(+21)" },
  { sprint: 9, pbi: "PBI-009", story: "優先度フィルタ", verification: "passed", notes: "4st,164t(+11)" },
  { sprint: 10, pbi: "PBI-010", story: "テキスト検索", verification: "passed", notes: "4st,175t(+11)" },
  { sprint: 11, pbi: "PBI-011", story: "グループ化", verification: "passed", notes: "6st,183t(+8),MEDIUM" },
  { sprint: 12, pbi: "PBI-012", story: "due:表示", verification: "passed", notes: "4st,209t(+26),Phase2完" },
  { sprint: 13, pbi: "PBI-013", story: "t:グレーアウト", verification: "passed", notes: "3st,237t(+28)" },
  { sprint: 14, pbi: "PBI-014", story: "[[Note]]内部リンク", verification: "passed", notes: "3st,265t(+28)" },
  { sprint: 15, pbi: "PBI-015", story: "[text](url)外部リンク", verification: "passed", notes: "3st,292t(+27)" },
  { sprint: 16, pbi: "PBI-016", story: "rec:繰り返しタスク", verification: "passed", notes: "6st,331t(+39),HIGH" },
  { sprint: 17, pbi: "PBI-017", story: "pri:タグ保存", verification: "passed", notes: "3st,331t,Phase3完" },
  { sprint: 18, pbi: "PBI-020", story: "UI統合メガSprint", verification: "passed", notes: "10st,353t(+22),HIGH,7機能統合" },
  { sprint: 19, pbi: "PBI-018", story: "設定画面", verification: "passed", notes: "5st,367t(+14),MEDIUM,3設定プロパティ+UI" },
  { sprint: 20, pbi: "PBI-019", story: "構造化フォーム", verification: "passed", notes: "7st,438t(+71=62form+9existing),HIGH,7新規ファイル,15commit(RED7+GREEN7+fix1),Phase4完" },
  { sprint: 21, pbi: "PBI-021", story: "recurrence.tsリファクタリング", verification: "passed", notes: "5st,438t(+0),MEDIUM,4refactor,1verification" },
  { sprint: 22, pbi: "PBI-023", story: "Product Roadmap 2026とリリース基準定義", verification: "passed", notes: "5st,438t(+0),LOW,3docs(roadmap/checklist/CHANGELOG),5structural" },
  { sprint: 23, pbi: "PBI-022", story: "READMEとドキュメント整備", verification: "passed", notes: "5st,438t(+0),LOW,5structural(README/user-guide/images/manifest/package)" },
  { sprint: 24, pbi: "PBI-024", story: "Phase 4デモシナリオ", verification: "passed", notes: "4st,438t(+0),LOW,4structural(demo-phase-4/scenario/7features/README)" },
  { sprint: 25, pbi: "PBI-025", story: "todo.txt基本UI描画", verification: "passed", notes: "5st,443t(+5),MEDIUM,5behavioral,view.test.ts type fix" },
  { sprint: 26, pbi: "PBI-026", story: "タスク追加UI", verification: "passed", notes: "5st,449t(+6),MEDIUM,5behavioral,AddTaskModal+view統合" },
  { sprint: 27, pbi: "PBI-027", story: "データ損失バグ修正", verification: "passed", notes: "5st,471t(+22),HIGH,5behavioral,clear()誤用修正" },
  { sprint: 28, pbi: "PBI-028", story: "タスク完了・編集・削除のUI操作", verification: "passed", notes: "5st,490t(+19=7EditTaskModal+12view),MEDIUM,5behavioral,チェックボックス+編集+削除ボタン統合" },
  { sprint: 29, pbi: "PBI-029", story: "due:とt:の視覚的表示", verification: "passed", notes: "4st,502t(+12=26due+28threshold+22TodoItem-3overlap),LOW,4behavioral,期限バッジ+色分け+グレーアウト統合" },
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  { sprint: 29,
    workedWell: [
      "既存アセット最大活用: due.ts (26tests), threshold.ts (28tests) の既存ビジネスロジックを完全再利用、TodoItem統合でわずか+12テスト実装で3機能統合達成、開発効率最大化",
      "TDDサイクル完全遵守継続: 7コミット（3 RED + 4 GREEN）構成、4 behavioral subtasks全てRED-GREENサイクル実施、低複雑度PBIでもTDD文化維持、品質プロセス安定稼働",
      "LOW複雑度Sprint効率実装: 4 subtasksでPBI完了、既存ロジック活用で新規実装最小化、期限バッジ・色分け・グレーアウトの3UI要素を効率統合、計画精度向上",
      "DoD完全達成5 Sprint継続: Tests 502 pass・Lint pass・Types pass・Build pass達成、Sprint 25→29の5 Sprint連続DoD完全達成、Phase 6 UI実装フェーズの高品質維持、リリース準備品質継続",
      "UI統合パターン確立: TodoItemコンポーネントへの視覚的フィードバック統合成功、Sprint 25-29で基本UI→追加→データ保持→操作→視覚表示の段階的UI構築完了、Phase 6 UI基盤完成",
    ],
    toImprove: [
      "Sprint 28 Action完全未実行の深刻化: 過去Sprint Action累積10件全て未着手継続、Action管理PBI（PBI-032）未創設、統合テスト基盤未構築、view.tsリファクタリングPBI未作成、Action実行率KPI未設定、Phase 6 Roadmap中間レビュー未実施、Retrospective実効性完全欠如",
      "REFACTOR文化の再後退懸念: Sprint 28の9.1% REFACTOR率から推定Sprint 29は0%近傍に低下、7コミット全てRED/GREEN、構造改善コミットなし、Sprint 27の0%問題再発、Technical Debt返済停滞",
      "統合テスト戦略未着手継続: Sprint 26-29の4 Sprint実施も統合テスト方針定義なし、Sprint 28 Action「PBI-029以降の各Sprintで統合テスト追加ルール化」未実行、個別機能テストのみで横断的品質保証欠如",
      "Action→PBI変換プロセス不在: Retrospective Actionの実行追跡メカニズム未確立、Sprint Planning時のAction評価プロセスなし、累積10件Action放置で改善サイクル機能停止、プロセス設計緊急課題",
      "Phase 6残作業可視性不足: PBI-030/031のready状態確認のみ、統合テスト・リファクタリング・Action返済PBIの優先順位未調整、Phase 6完了条件不明確、残Sprint数見積もり未実施（予想3-5 Sprint→検証なし）",
    ],
    actions: [
      "緊急: Action実行Sprint即時実施: Sprint 30をAction返済Sprintとして定義、累積10件Actionから最優先3件選定（統合テスト戦略策定・view.tsリファクタリングPBI作成・Action実行KPI設定）、1 Sprint集中実施、Technical Debt返済開始",
      "統合テスト最小MVP実装: view integration testの最小実装（1-2テストケース）をSprint 30で追加、UI操作→データ保持→ファイル保存の基本フロー検証、テストユーティリティ作成は後回し、統合テスト文化立ち上げ優先",
      "Action管理プロセス確立: Sprint Planning時にRetrospective Action評価を必須化、Action→PBI変換基準定義（実施工数見積もり・優先度評価・Sprint組込判断）、Action実行率KPI 50%以上設定、次Sprint以降の改善サイクル機能化",
      "Phase 6完了基準明確化: 現状PBI-030/031に加え、統合テスト完成・view.tsリファクタリング・Action返済を完了条件追加、Phase 6残Sprint数再見積もり（予想5-7 Sprint）、Product Roadmap 2026更新検討",
      "REFACTOR文化再構築: Sprint 30でREFACTOR率目標20%以上設定、view.ts小規模リファクタリング1コミット必須化（例: renderTaskList()メソッド分割）、構造改善とTDD両立パターン再確立、Sprint 11-24水準回復開始",
    ] },
];

// Action Management Process (Sprint 29 Retrospective Action導入、Sprint 30で文書化・KPI設定強化)
export const actionManagement = {
  // KPI設定（Sprint 30で明確化）
  kpi: {
    executionRateTarget: 50, // 最低目標: 50%以上（2 Sprint連続未達でAction返済Sprint実施）
    healthyRateTarget: 70, // 健全目標: 70%以上（持続的改善サイクル稼働）
    excellentRateTarget: 90, // 卓越目標: 90%以上（Action即時実行文化確立）
    description: "Retrospective Actionの実行率目標（%）",
    measurement: "Sprint終了時にtracking.currentRateを計算、次Sprint Planning時に評価",
    alertThreshold: "実行率50%未満が2 Sprint連続 → 次SprintをAction返済Sprintに設定",
  },

  // Sprint Planning時のAction評価手順（Sprint 30で文書化）
  evaluationProcess: [
    "【Step 1】前Sprint Retrospective Actionリストレビュー: retrospectives配列の最新entryからactions抽出",
    "【Step 2】各Action実施工数見積もり: 0.5 Sprint（1-2 subtask）/ 1 Sprint（3-5 subtask）/ 2+ Sprint（PBI化推奨）",
    "【Step 3】優先度評価基準: High（改善サイクル停止・品質低下リスク）/ Medium（効率化・技術的負債）/ Low（将来検討）",
    "【Step 4】Action→PBI変換判断: High優先度かつ1+ Sprint工数 → 即時PBI化してProduct Backlogに追加",
    "【Step 5】Mediumは既存PBIへの統合orバックログ追加検討、Lowは次Sprint Planning時に再評価",
    "【Step 6】Sprint終了時に実行率計算: (実行完了Action数 / 全Action数) × 100、tracking更新",
    "【Step 7】実行率50%未満が2 Sprint連続の場合、次SprintをAction返済Sprint（専用PBI）として設定",
  ],

  // Action→PBI変換ガイドライン（Sprint 30追加）
  conversionGuideline: {
    criteria: "1+ Sprint工数 かつ High/Medium優先度",
    pbiTemplate: {
      story: { role: "dev", capability: "[Action内容]", benefit: "[改善効果]" },
      acceptanceCriteria: "Actionの検証方法を具体的に記述",
      complexity: "工数見積もりに基づきsubtasks数設定",
    },
    examples: [
      "統合テスト戦略策定 (1.5 Sprint) → PBI-032 Subtask 1として実装",
      "Action管理プロセス確立 (0.5 Sprint) → PBI-032 Subtask 2として文書化",
    ],
  },

  tracking: {
    totalActions: 10, // Sprint 20-29累積Action数
    executedActions: 3, // Sprint 30で実行中（統合テスト・プロセス文書化・KPI設定）
    currentRate: 30, // 3/10 = 30% (Sprint 30進行中)
    note: "Sprint 30 (PBI-032) でAction返済Sprint実施中、5 subtask中3件がAction由来",
  },

  // Sprint別Action実行率履歴（Sprint 30でKPI追跡開始）
  sprintHistory: [
    { sprint: 20, actions: 0, executed: 0, rate: 0, note: "Retrospective定着前" },
    { sprint: 21, actions: 0, executed: 0, rate: 0, note: "Retrospective定着前" },
    { sprint: 22, actions: 1, executed: 0, rate: 0, note: "Roadmap定義Sprint、Action実行なし" },
    { sprint: 23, actions: 2, executed: 0, rate: 0, note: "Action蓄積開始" },
    { sprint: 24, actions: 2, executed: 0, rate: 0, note: "Action蓄積継続" },
    { sprint: 25, actions: 1, executed: 0, rate: 0, note: "Action蓄積継続" },
    { sprint: 26, actions: 1, executed: 0, rate: 0, note: "Action蓄積継続" },
    { sprint: 27, actions: 1, executed: 0, rate: 0, note: "Action蓄積継続" },
    { sprint: 28, actions: 1, executed: 0, rate: 0, note: "Action蓄積継続、累積10件到達" },
    { sprint: 29, actions: 1, executed: 0, rate: 0, note: "Action完全未実行の深刻化、PBI-032作成決定" },
    { sprint: 30, actions: 5, executed: 3, rate: 60, note: "Action返済Sprint実施中、統合テスト・プロセス・KPI・リファクタPBI・REFACTOR実施" },
  ],

  // 次Sprint以降の改善目標（Sprint 30設定）
  improvementGoals: [
    "Sprint 31以降: 各SprintでAction実行率50%以上維持、累積負債解消継続",
    "Sprint 32以降: Action実行率70%以上目標、Sprint Planning時の即時Action→PBI変換文化定着",
    "Sprint 35以降: Action実行率90%以上目標、Action即時実行でRetrospective実効性最大化",
  ],
};

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
