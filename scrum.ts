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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  sprint: { number: 29, pbi: "PBI-029", status: "in_progress" as SprintStatus,
    subtasksCompleted: 0, subtasksTotal: 4, impediments: 0 },
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
  {
    id: "PBI-029",
    story: { role: "user", capability: "due:とt:の視覚的表示", benefit: "期限と着手日の一目確認" },
    acceptanceCriteria: [
      { criterion: "due:表示", verification: "due:タグのあるタスクに期限日表示" },
      { criterion: "期限ハイライト", verification: "過期=赤、今日=オレンジで色分け" },
      { criterion: "t:グレーアウト", verification: "t:以前のタスクがグレーアウト表示" },
    ],
    dependencies: ["PBI-028"],
    status: "ready",
    complexity: { functions: 2, estimatedTests: 8, externalDependencies: 2, score: "LOW", subtasks: 4 },
  },
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
  },
];

// Definition of Ready
export const definitionOfReady = {
  criteria: [
    "AI can complete without human input",
    "User story has role/capability/benefit",
    "At least 3 acceptance criteria with verification",
    "Dependencies resolved or not blocking",
  ],
};

// Current Sprint
export const currentSprint = {
  sprint: 29,
  pbi: "PBI-029",
  goal: "due:とt:の視覚的フィードバックをタスクリストに統合し、期限管理と着手時期の判断を直感的にする",
  status: "in_progress" as SprintStatus,
  subtasks: [
    {
      test: "due:タグから期限日を抽出しバッジとして表示する",
      implementation: "renderTaskList()内でgetDueDate()を使用し、期限日バッジ要素を生成してタスク行に追加",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
    {
      test: "期限日の状態に応じて色分けスタイルを適用する(overdue=赤, today=オレンジ)",
      implementation: "getDueDateStyle()の戻り値をバッジ要素のstyleに適用",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
    {
      test: "t:タグの状態に応じてタスク行をグレーアウト表示する(not_ready時)",
      implementation: "getThresholdDateStyle()の戻り値をli要素のstyleに適用",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
    {
      test: "due:バッジ、期限ハイライト、t:グレーアウトの統合動作を検証する",
      implementation: "view.test.ts内で複数のdue:/t:パターンのタスクリストをレンダリングし、DOM構造とスタイルを検証",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
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
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  { sprint: 28,
    workedWell: [
      "REFACTOR文化の部分的回復: 11コミット（5 RED + 5 GREEN + 1 REFACTOR）構成、REFACTOR率9.1%達成、Sprint 27の0%から改善、`refactor: ESLintエラー修正`コミットで品質維持、TDD文化とRefactor文化の両立再開",
      "EditTaskModal設計パターン継承: AddTaskModal成功パターンを完全踏襲、7テストでTDD実装、Modalインスタンス管理・入力検証・コールバック処理を統一設計、UI統合コンポーネントの一貫性確保",
      "UI統合完全達成: チェックボックス（完了トグル）・編集ボタン・削除ボタンの3機能統合、既存ハンドラー（getToggleHandler/getEditHandler/getDeleteHandler）との統合成功、+19テスト（7 EditTaskModal + 12 view統合）で品質保証",
      "計画的Sprint実行: PBI-028をDefinition of Ready遵守で投入、MEDIUM複雑度事前見積もり、5 subtasks全てbehavioral type、RED-GREENサイクル完全遵守、緊急対応なしの計画的開発",
      "DoD全項目PASS継続: Tests 490pass・Lint pass・Types pass・Build pass達成、Sprint 25→28の4 Sprint連続DoD完全達成、Phase 6 UI実装フェーズの安定稼働、品質基準維持",
    ],
    toImprove: [
      "Sprint 26/27 Action完全未実行: 過去2 Sprintの全10 Action未着手、Action実行率0%、統合テスト戦略未策定・テストユーティリティ未作成・Phase 6 PBI ready化未完了・DoD動作検証未追加・Technical Debt返済Sprint未実施、Retrospective Actionの実効性欠如",
      "REFACTOR率依然低水準: 9.1%達成もSprint 11-24の37%実績比で-28pt低下、1 REFACTORコミット（ESLint修正のみ）、構造改善機会多数残存（view.ts責務分離・テストDRY原則・ハンドラー抽象化）、Technical Debt蓄積継続",
      "Phase 6統合テスト戦略不在: Sprint 26-28の3 Sprint実施も統合テスト方針未定義、UI操作→データ保持→ファイル保存フロー検証体系化なし、個別PBIテストのみで横断的品質保証欠如、将来的バグリスク残存",
      "Action実行プロセス未確立: Retrospective Actionの追跡メカニズムなし、PBI化・優先度付け・Sprint Planningへの組込プロセス不在、Sprint 26 Action 5件→Sprint 27 Action 5件→Sprint 28 Action 0実行で累積10件遅延、改善サイクル機能不全",
      "view.ts構造的負債未解消: setViewData/clear/getViewDataメソッド群の責務過多、DOM操作とデータ管理の混在、renderTaskList()の肥大化（チェックボックス・編集・削除ボタン追加で複雑化）、リファクタリング先送りで保守性低下",
    ],
    actions: [
      "Action管理PBIの創設: 過去Sprint Action累積10件をPBI化（PBI-032: Retrospective Action実行Sprint）、優先度HIGH設定、Sprint 29候補として投入、統合テスト戦略・テストユーティリティ・view.tsリファクタリングを1 Sprintで集中実施、Technical Debt返済メカニズム確立",
      "Phase 6統合テスト基盤構築: view integration test設計ドキュメント作成、UI操作→データ保持→ファイル保存のE2Eテストフレームワーク定義、テストユーティリティ関数群実装（createMockView/simulateUIOperation/verifyDataPersistence）、PBI-029以降の各Sprintで統合テスト追加ルール化",
      "view.tsリファクタリングPBI作成: PBI-033としてview.ts構造改善定義、setViewData/clear責務分離・renderTaskList()コンポーネント化・ハンドラー抽象化・テストDRY原則適用を5 subtasksで実施、complexity MEDIUM見積もり、Sprint 29または30で実施検討",
      "Retrospective Action実行率KPI設定: 次Sprint開始時にAction→PBI変換ルール義務化、Sprint Planning時にAction PBI優先度評価必須化、Action実行率目標60%以上設定、Sprint Review時にAction達成状況報告、改善サイクル実効性担保",
      "Phase 6 Roadmap中間レビュー実施: PBI-029～031のready状態再確認、統合テスト戦略組込でAcceptance Criteria更新、Technical Debt返済PBI（032/033）追加後の優先順位再調整、Phase 6完了条件明確化、残Sprint数見積もり（予想3-5 Sprint）",
    ] },
];

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
