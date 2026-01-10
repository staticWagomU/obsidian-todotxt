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
  sprint: { number: 0, pbi: "", status: "not_started" as SprintStatus,
    subtasksCompleted: 0, subtasksTotal: 0, impediments: 0 },
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
      { criterion: "既存テスト全通過", verification: "リファクタリング後も502tests全pass維持、振る舞い変更なし確認" },
    ],
    dependencies: [],
    status: "ready",
    complexity: { functions: 2, estimatedTests: 0, externalDependencies: 0, score: "LOW", subtasks: 3 },
    refactorChecklist: [
      "src/lib/handlers.ts作成 - 4 handler functions移動",
      "src/lib/rendering.ts作成 - renderTaskList()移動",
      "view.ts import更新、244行→150行目標",
      "既存テスト全通過確認 (502 tests)",
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
  sprint: 0,
  pbi: "",
  goal: "",
  status: "not_started" as SprintStatus,
  subtasks: [] as Subtask[],
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

// Action Management Process (Sprint 29 Retrospective Action導入)
export const actionManagement = {
  kpi: { executionRateTarget: 50, description: "Retrospective Actionの実行率目標（%）" },
  evaluationProcess: [
    "Sprint Planning時に前Sprintの全Actionを評価",
    "各Action実施工数見積もり（0.5-2 Sprints）と優先度評価（High/Medium/Low）",
    "High優先度Action→即時PBI化、Medium→バックログ追加、Low→次回評価",
    "Sprint終了時に実行率計算: (実行Action数 / 全Action数) × 100",
    "実行率50%未満の場合、次SprintでAction返済Sprint検討",
  ],
  tracking: {
    totalActions: 10,
    executedActions: 0,
    currentRate: 0,
    note: "Sprint 30 (PBI-032) でAction返済Sprint実施、統合テスト・プロセス改善・KPI設定の3件実行予定",
  },
};

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
