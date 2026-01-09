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
  sprint: { number: 26, pbi: "PBI-026", status: "in_progress" as SprintStatus,
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
  // Phase 6: UI実装 (Sprint 26+)
  { id: "PBI-026", story: { role: "user", capability: "タスク追加UI", benefit: "GUIでタスク追加" },
    acceptanceCriteria: [
      { criterion: "ビューに「+」ボタンが表示される", verification: "UIに追加ボタンが存在することを確認" },
      { criterion: "ボタンクリックでモーダルが開く", verification: "クリック時にモーダルが表示されることを確認" },
      { criterion: "モーダルでタスク説明を入力できる", verification: "入力フィールドが機能することを確認" },
      { criterion: "保存でタスクがリストに追加される", verification: "getAddHandler()経由でタスクが追加されることを確認" },
    ],
    dependencies: ["PBI-025", "PBI-019"], status: "ready",
    complexity: { functions: 3, estimatedTests: 8, externalDependencies: 1, score: "MEDIUM", subtasks: 5 } },
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
  sprint: 26,
  pbi: "PBI-026",
  goal: "ユーザーがGUIでタスクを追加できるようにする",
  status: "in_progress" as SprintStatus,
  subtasks: [
    { test: "renderTaskList()が追加ボタン要素を含むこと", implementation: "ul要素の前に「+」ボタンを描画", type: "behavioral" as SubtaskType, status: "pending" as SubtaskStatus, commits: [] },
    { test: "AddTaskModal classが存在しModalを継承すること", implementation: "AddTaskModalクラスをui/AddTaskModal.tsに作成", type: "behavioral" as SubtaskType, status: "pending" as SubtaskStatus, commits: [] },
    { test: "モーダルにタスク説明入力フィールドが存在すること", implementation: "Modal.onOpen()でinput要素を描画", type: "behavioral" as SubtaskType, status: "pending" as SubtaskStatus, commits: [] },
    { test: "モーダルに保存ボタンが存在しクリックでonSaveが呼ばれること", implementation: "保存ボタンとonSaveコールバック実装", type: "behavioral" as SubtaskType, status: "pending" as SubtaskStatus, commits: [] },
    { test: "追加ボタンクリックでモーダルが開きタスク追加後にリスト更新されること", implementation: "view.tsで追加ボタンにAddTaskModalを接続しgetAddHandler()を呼び出す", type: "behavioral" as SubtaskType, status: "pending" as SubtaskStatus, commits: [] },
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
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  { sprint: 25,
    workedWell: [
      "Phase 6初Sprint完遂: Sprint 25でPhase 6（UI実装フェーズ）開始、PBI-025完了（5 behavioral subtasks全完遂）、テスト数438→443（+5）、TDDサイクル完全実施（RED×4, GREEN×4）、UI実装フェーズへの移行成功",
      "全behavioral subtasks成功: 5 subtasks全てbehavioral type、TDD Red-Green-Refactorサイクル完全遵守、空ファイル→基本描画→完了状態→再描画→優先度バッジの段階的実装、Sprint 20以来の完全TDD Sprint復活",
      "型安全性改善リファクタリング実施: Sprint Review中のTypeScript型エラー（createEl型互換性）即座修正、DOMモック型安全性向上リファクタリング実施、テスト品質向上、型システム活用強化",
      "DoD全項目PASS達成: Tests✅ Lint✅ Types✅ Build✅全通過、型エラー修正含めた完全DoD達成、Phase 6初Sprintから品質基準維持",
      "UI実装基盤確立: view.tsにrenderTaskList()メソッド実装、parseTodoTxt()統合、contentEl DOM操作基盤確立、Phase 6以降のUI機能追加基盤完成",
    ],
    toImprove: [
      "Sprint Review中の型エラー発生: DoD検証時にTypeScript型エラー（createEl互換性）発見、開発中の型チェック漏れ、TDDサイクル中のtsc --noEmit実行不足、型安全性検証プロセス改善必要",
      "Sprint 24 Action未完遂: Action#1（1.0.0リリース最終検証）未実施、Action#2（Phase 6計画策定）未実施、Action#3（Action追跡自動化）未実施、Action#4（CHANGELOG Unreleased更新）未実施、Action#5（Sprint 25 Planning準備）のみ部分実施、Retrospective Action実行率低下",
      "PBI-026以降Backlog未定義: Phase 6 Roadmap存在するがPBI未定義、Product Backlog最新状態PBI-025まで、次Sprint候補不明確、Backlog refinement実施必要",
      "completedSprints肥大化継続: Sprint 25追加で25要素、5 Sprint連続改善なし（Sprint 21-25）、Phase 1-5完遂後も圧縮なし、git履歴参照ルール形骸化継続",
      "DOMモックメンテナンス性: view.test.tsのDOMモック記述分散（createElement/appendChild/empty型定義）、型修正時の影響範囲広い、テストユーティリティ関数化検討余地",
    ],
    actions: [
      "TDDサイクル型チェック強化: 各commit前にtsc --noEmit実行ルール化、RED/GREEN phase両方で型エラー検証、vitest実行と並行して型チェック、Sprint Review前の型エラー防止",
      "Phase 6 Backlog refinement実施: Product Roadmap 2026のv1.1.0機能からPBI-026以降定義、優先順位付けとcomplexity見積もり、最低3 PBI ready状態達成、Sprint 26 Planning準備",
      "Sprint 24 Action再実行: Action#1（1.0.0リリース最終検証）Phase 6区切りで再検討、Action#3（Action追跡自動化）Sprint 20-24完了Action削除、Action#4（CHANGELOG更新）Sprint 25内容反映、遅延Action解消",
      "テストユーティリティ関数化検討: DOMモック型定義をtest-utils.ts集約、createElement/appendChild/empty型安全ラッパー作成、view.test.ts可読性向上、型修正時の影響範囲局所化",
      "Sprint 26 Planning準備: PBI-026候補選定（カレンダービュー/タグオートコンプリート/一括編集/優先度編集UI）、Definition of Ready確認、complexity見積もり、Phase 6継続Sprint計画",
    ] },
];

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
