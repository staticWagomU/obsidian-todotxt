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
  sprint: { number: 28, pbi: "PBI-028", status: "in_progress" as SprintStatus,
    subtasksCompleted: 0, subtasksTotal: 5, impediments: 0 },
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
  // Phase 6: UI統合 (Sprint 28以降予定) - requirements.md/user-guide.mdの未実装機能
  {
    id: "PBI-028",
    story: { role: "user", capability: "タスク完了・編集・削除のUI操作", benefit: "直感的タスク管理" },
    acceptanceCriteria: [
      { criterion: "チェックボックス表示", verification: "各タスク行にチェックボックスが表示される" },
      { criterion: "完了トグル動作", verification: "チェックボックスクリックで完了/未完了切替" },
      { criterion: "編集ボタン表示と動作", verification: "編集ボタンクリックで編集モーダル表示" },
      { criterion: "削除ボタン表示と動作", verification: "削除ボタンクリックでタスク削除" },
    ],
    dependencies: ["PBI-027"],
    status: "ready",
  },
  {
    id: "PBI-029",
    story: { role: "user", capability: "due:とt:の視覚的表示", benefit: "期限と着手日の一目確認" },
    acceptanceCriteria: [
      { criterion: "due:表示", verification: "due:タグのあるタスクに期限日表示" },
      { criterion: "期限ハイライト", verification: "過期=赤、今日=強調、間近=注意の色分け" },
      { criterion: "t:グレーアウト", verification: "t:以前のタスクがグレーアウト表示" },
    ],
    dependencies: ["PBI-028"],
    status: "ready",
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
  sprint: 28,
  pbi: "PBI-028",
  goal: "TodoItemにチェックボックス・編集・削除ボタンを実装し、既存ハンドラーと統合して直感的なタスク管理UIを完成させる",
  status: "in_progress" as SprintStatus,
  subtasks: [
    {
      test: "TodoItem.test.tsxにチェックボックスレンダリングテスト追加（input[type=\"checkbox\"]存在確認、完了状態でchecked属性検証）",
      implementation: "TodoItem.tsxにチェックボックス要素追加、todo.completedに基づくchecked状態反映",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
    {
      test: "TodoItem.test.tsxにチェックボックスクリックテスト追加（クリックイベントでonToggleハンドラー呼出確認、引数todo.id検証）",
      implementation: "チェックボックスonChangeイベントにonToggleハンドラー接続（TodosList→TodoItemへgetToggleHandler経由で渡す）",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
    {
      test: "EditTaskModal.test.tsx新規作成（モーダル表示、初期値セット、保存ボタン→onSaveコールバック、キャンセルボタン→onClose、入力フィールド検証）",
      implementation: "ui/EditTaskModal.tsx新規作成（AddTaskModal構造参考、既存タスク編集用にフォーム初期化）",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
    {
      test: "TodoItem.test.tsxに編集ボタンテスト追加（ボタンレンダリング、クリック→onEditハンドラー呼出、引数todo検証）、view.test.tsに編集フロー統合テスト追加",
      implementation: "TodoItem.tsxに編集ボタン追加、onEditハンドラー接続（TodosList→TodoItemへgetEditHandler経由で渡す）、view.tsxでEditTaskModalインポート・統合",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
    {
      test: "TodoItem.test.tsxに削除ボタンテスト追加（ボタンレンダリング、クリック→onDeleteハンドラー呼出、引数todo.id検証）、view.test.tsに削除フロー統合テスト追加",
      implementation: "TodoItem.tsxに削除ボタン追加、onDeleteハンドラー接続（TodosList→TodoItemへgetDeleteHandler経由で渡す）",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
  ],
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
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  { sprint: 27,
    workedWell: [
      "Critical Bug迅速修正完遂: データ損失バグ（PBI-027）をHIGH複雑度として5 subtasks完遂、1 RED + 5 GREENコミット、テスト数449→471（+22）、DoD全項目PASS達成、Phase 6継続の基盤確保",
      "根本原因の的確な特定: setViewData()内のclear()誤用を正確に特定、this.dataを誤削除する問題を解明、clearパラメータをDOM最適化フラグと再解釈、根本原因ベースの修正実施",
      "包括的テストカバレッジ追加: +22テストで徹底的データ保持検証、setViewData/getViewData/タスク操作/ファイル再オープンの統合テスト全実装、将来の再発防止基盤確立",
      "全behavioral subtasksでTDD実践: 5 subtasks全てbehavioral type、RED-GREENサイクル遵守（Subtask 1のみRED、Subtask 2-5はGREEN phase testing）、バグ修正でもTDD原則維持",
      "Phase 6開発継続可能化: データ損失バグ解消によりPBI-028（タスク完了・編集・削除UI）への進行可能、UI実装フェーズの信頼性確保、ユーザーエクスペリエンス品質保証",
    ],
    toImprove: [
      "REFACTORフェーズ完全欠如: 6コミット全てRED/GREENフェーズ、Refactor発生率0%（Sprint 25以前は37%達成実績）、Sprint 11-24で構築したRefactor文化の一時的停止、バグ修正優先による構造改善機会損失",
      "Sprint 26 Action未実行: Action#1（UI操作フィードバック追加）未実施、Action#2（テストユーティリティ関数化）未実施、Action#3（Phase 6 PBI ready化）未実施、Action#4（DoD型チェック自動化）未実施、Action#5（Sprint 27 Planning）のみ実施、Retrospective Action実行率20%",
      "バグ混入の事前検出失敗: Sprint 26でsetViewData()実装時にclear()誤用混入、開発中のテスト不足（view integration test未実装）、DoD型チェックのみで動作検証不足、バグ予防プロセスの脆弱性露呈",
      "緊急対応による計画外Sprint発生: PBI-027はBacklog refinement未実施でSprint投入、Definition of Ready未確認、complexity見積もり事後判定（HIGH）、計画的開発プロセスの一時的中断",
      "Refactorチャンス未活用: view.ts内のsetViewData/clear/getViewDataメソッド群のリファクタリング機会あり、DOM操作とデータ管理の責務分離余地、テストコードのDRY原則適用余地、構造改善の先送り",
    ],
    actions: [
      "Phase 6統合テスト戦略策定: view integration testカテゴリ定義、UI操作→データ保持→ファイル保存の一連フロー検証、各PBI完了時に統合テスト追加ルール化、バグ混入の事前検出強化",
      "Critical Bug後のRefactoring Sprint実施: Sprint 28開始前にview.ts構造改善検討、setViewData/clear責務分離Refactoring PBI作成、テストコードDRY原則適用、Technical Debt返済機会確保",
      "Sprint 26 Action再実行と優先度付け: Action#2（テストユーティリティ）優先実施（統合テスト基盤）、Action#3（Phase 6 PBI ready化）Sprint 28 Planning前完了、Action#1/4は次Sprintで再評価、遅延Action解消計画",
      "DoD動作検証ステップ追加: DoD checklistに「主要ユースケース手動検証」項目追加、Tests PASSのみでは不十分な動作保証を補完、Critical path検証の明文化、品質保証プロセス強化",
      "Phase 6 Roadmap再確認とPBI優先順位調整: PBI-028（タスク完了・編集・削除UI）をSprint 28候補確定、PBI-029以降のready状態確認、Technical Debt返済PBI追加検討、Phase 6継続計画明確化",
    ] },
];

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
