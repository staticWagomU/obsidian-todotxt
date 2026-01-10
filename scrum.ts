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
  sprint: { number: 36, pbi: "PBI-036", status: "in_progress" as SprintStatus,
    subtasksCompleted: 0, subtasksTotal: 4, impediments: 0 },
  phase: { number: 8, status: "in_progress", sprints: "35-39", pbis: "PBI-035〜039", goal: "フォームUI強化（構造化入力/デートピッカー/コンボボックス/プレビュー）" },
};

// Product Goal
export const productGoal = {
  statement: "Obsidian内でtodo.txt形式のファイルを直感的に管理・表示する",
  owner: "@scrum-team-product-owner",
};

// Product Backlog (Order = Priority) - done PBIs compacted, see git history
export const productBacklog: ProductBacklogItem[] = [
  // Phase 1-7完了: Sprint 1-34（34 PBIs done）
  // PBI-001〜034 done: 専用ビュー/パース/CRUD/ソート/フィルタ/グループ/日付表示/リンク/rec:/pri:/設定/フォーム/UI統合/ドキュメント/Action返済/view.tsリファクタ/コントロールバー/リンククリック可能表示
  // Phase 7完了 (Sprint 32-34): コントロールバー実装 + UI統合 + リンク表示機能実装
  //   Sprint 32 PBI-030: コントロールバーロジック実装、533t(+29t)、REFACTOR率50%
  //   Sprint 33 PBI-033: コントロールバーUI統合、542t(+9t)、REFACTOR率50%、アクセシビリティ向上
  //   Sprint 34 PBI-031: 内部/外部リンク+rec:アイコン表示、554t(+12t)、REFACTOR率40%、LinkHandler抽象化
  // Phase 8: フォームUI強化（Sprint 35〜39）
  {
    id: "PBI-035",
    story: { role: "ユーザー", capability: "タスク追加/編集時に優先度をドロップダウンから選択", benefit: "手入力の手間なく正確な優先度設定ができる" },
    acceptanceCriteria: [
      { criterion: "優先度ドロップダウン（なし/A-Z）が表示される", verification: "pnpm vitest run -- AddTaskModal EditTaskModal" },
      { criterion: "選択した優先度がtodo.txt形式で保存される", verification: "pnpm vitest run -- handlers" },
      { criterion: "編集時に既存の優先度が選択状態で表示される", verification: "pnpm vitest run -- EditTaskModal" },
    ],
    dependencies: [],
    status: "done",
    complexity: { functions: 3, estimatedTests: 8, externalDependencies: 0, score: "LOW", subtasks: 3 },
  },
  {
    id: "PBI-036",
    story: { role: "ユーザー", capability: "タスク追加/編集時にカレンダーから期限日・開始日を選択", benefit: "日付入力が直感的で入力ミスを防げる" },
    acceptanceCriteria: [
      { criterion: "due:用デートピッカーが表示される", verification: "pnpm vitest run -- AddTaskModal EditTaskModal" },
      { criterion: "t:（しきい値日）用デートピッカーが表示される", verification: "pnpm vitest run -- AddTaskModal EditTaskModal" },
      { criterion: "選択した日付がYYYY-MM-DD形式でタグに反映される", verification: "pnpm vitest run -- handlers" },
      { criterion: "編集時に既存の日付がピッカーに表示される", verification: "pnpm vitest run -- EditTaskModal" },
    ],
    dependencies: ["PBI-035"],
    status: "ready",
    complexity: { functions: 4, estimatedTests: 10, externalDependencies: 1, score: "MEDIUM", subtasks: 4 },
    refactorChecklist: [
      "HTML5 <input type=\"date\"> を使用したデートピッカー実装",
      "due.ts/threshold.tsの既存日付パースロジックを活用",
      "priority-options.tsパターンを踏襲してdate-picker-utils.ts作成",
      "AddTaskModal/EditTaskModalへのdue:/t:入力フィールド追加",
      "handlers.tsでタグ反映処理実装（tag-utils活用）",
    ],
  },
  {
    id: "PBI-037",
    story: { role: "ユーザー", capability: "既存のプロジェクト/コンテキストをドロップダウンから選択または新規作成", benefit: "一貫性のあるタグ付けができ、タイポを防げる" },
    acceptanceCriteria: [
      { criterion: "既存プロジェクト（+tag）一覧がドロップダウンで表示される", verification: "pnpm vitest run -- AddTaskModal" },
      { criterion: "既存コンテキスト（@tag）一覧がドロップダウンで表示される", verification: "pnpm vitest run -- AddTaskModal" },
      { criterion: "新規タグをテキスト入力で作成できる", verification: "pnpm vitest run -- AddTaskModal" },
      { criterion: "複数のプロジェクト/コンテキストを選択できる", verification: "pnpm vitest run -- AddTaskModal" },
    ],
    dependencies: ["PBI-035"],
    status: "draft",
    complexity: { functions: 5, estimatedTests: 12, externalDependencies: 0, score: "MEDIUM", subtasks: 4 },
  },
  {
    id: "PBI-038",
    story: { role: "ユーザー", capability: "フォーム入力中にtodo.txt形式でリアルタイムプレビューを確認", benefit: "保存前に最終形式を確認でき、意図通りの入力ができる" },
    acceptanceCriteria: [
      { criterion: "フォーム下部にプレビューエリアが表示される", verification: "pnpm vitest run -- AddTaskModal EditTaskModal" },
      { criterion: "入力変更時にリアルタイムでプレビューが更新される", verification: "pnpm vitest run -- AddTaskModal" },
      { criterion: "プレビューがtodo.txt形式に準拠している", verification: "pnpm vitest run -- serializer" },
    ],
    dependencies: ["PBI-035"],
    status: "draft",
    complexity: { functions: 2, estimatedTests: 6, externalDependencies: 0, score: "LOW", subtasks: 3 },
  },
  {
    id: "PBI-039",
    story: { role: "上級ユーザー", capability: "構造化フォームと直接テキスト編集モードを切り替え", benefit: "慣れたユーザーは高速にtodo.txt形式で直接入力できる" },
    acceptanceCriteria: [
      { criterion: "フォーム/テキストモード切替ボタンが表示される", verification: "pnpm vitest run -- AddTaskModal EditTaskModal" },
      { criterion: "テキストモードでは生のtodo.txt形式で編集できる", verification: "pnpm vitest run -- AddTaskModal" },
      { criterion: "モード切替時に入力内容が保持される", verification: "pnpm vitest run -- AddTaskModal" },
    ],
    dependencies: ["PBI-038"],
    status: "draft",
    complexity: { functions: 3, estimatedTests: 8, externalDependencies: 0, score: "LOW", subtasks: 3 },
  },
  // Phase 9: UIデザイン刷新（Apple-likeモダンデザイン）
  {
    id: "PBI-040",
    story: { role: "ユーザー", capability: "洗練されたミニマルなUIでタスクを管理", benefit: "視覚的に美しく、使っていて心地よい体験が得られる" },
    acceptanceCriteria: [
      { criterion: "タスクリストに十分な余白（padding/margin）が設定されている", verification: "目視確認: タスク間に16px以上の余白" },
      { criterion: "チェックボックスがカスタムスタイル（角丸、アニメーション付き）になる", verification: "目視確認: チェック時に滑らかなトランジション" },
      { criterion: "フォントサイズに明確な階層がある（タイトル/本文/補助テキスト）", verification: "目視確認: 3段階以上のフォントサイズ" },
      { criterion: "Obsidianのダークモード/ライトモードに適切に対応", verification: "目視確認: 両モードで視認性良好" },
    ],
    dependencies: [],
    status: "draft",
    complexity: { functions: 0, estimatedTests: 0, externalDependencies: 0, score: "MEDIUM", subtasks: 4 },
  },
  {
    id: "PBI-041",
    story: { role: "ユーザー", capability: "ホバーやフォーカス時に滑らかなフィードバックを得る", benefit: "操作に対する応答性が感じられ、直感的に使える" },
    acceptanceCriteria: [
      { criterion: "タスク行ホバー時に背景色がフェードイン", verification: "目視確認: 150-200msのtransition" },
      { criterion: "ボタンホバー時にスケール/シャドウ変化", verification: "目視確認: 微細なtransform効果" },
      { criterion: "フォーカス時にアウトラインまたはシャドウでハイライト", verification: "目視確認: キーボードナビゲーションで確認" },
      { criterion: "完了トグル時にチェックマークがアニメーション", verification: "目視確認: スムーズな出現アニメーション" },
    ],
    dependencies: ["PBI-040"],
    status: "draft",
    complexity: { functions: 0, estimatedTests: 0, externalDependencies: 0, score: "LOW", subtasks: 4 },
  },
  {
    id: "PBI-042",
    story: { role: "ユーザー", capability: "モーダルが洗練されたデザインで表示される", benefit: "タスク入力時も一貫した美しい体験が得られる" },
    acceptanceCriteria: [
      { criterion: "モーダルに適切な角丸（border-radius: 12-16px）が設定されている", verification: "目視確認: 角丸の統一" },
      { criterion: "モーダル背景にブラー効果（backdrop-filter）が適用される", verification: "目視確認: 背景がぼかされる" },
      { criterion: "入力フィールドがフラットデザイン（ボーダーレスまたは細いボーダー）", verification: "目視確認: ミニマルな入力欄" },
      { criterion: "保存ボタンがプライマリカラーで目立つデザイン", verification: "目視確認: アクセントカラー適用" },
    ],
    dependencies: ["PBI-040"],
    status: "draft",
    complexity: { functions: 0, estimatedTests: 0, externalDependencies: 0, score: "LOW", subtasks: 4 },
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
  sprint: 36,
  pbi: "PBI-036",
  goal: "デートピッカー実装により、ユーザーが直感的に日付を入力でき、入力ミスを防げるようにする",
  status: "in_progress" as SprintStatus,
  subtasks: [
    {
      test: "date-picker-utils.tsのテスト作成: formatDateForInput/parseDateFromInput関数のテスト（YYYY-MM-DD形式の相互変換、無効な日付のハンドリング、空文字列処理）",
      implementation: "date-picker-utils.ts実装: HTML5 date input用のフォーマット変換ユーティリティ作成（due.ts/threshold.tsのパース/フォーマットロジックを活用）",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
    {
      test: "AddTaskModal.tsのデートピッカーテスト: due:/t:入力フィールドのレンダリング、日付選択時のコールバック、初期値なし状態のテスト",
      implementation: "AddTaskModal.tsにdue:/t:デートピッカー追加: HTML5 <input type=\"date\">を使用、priority-options.tsパターンを踏襲した実装、date-picker-utils.ts活用",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
    {
      test: "EditTaskModal.tsのデートピッカーテスト: 既存due:/t:タグの初期値表示、日付変更時のコールバック、タグなし→タグありの変更テスト",
      implementation: "EditTaskModal.tsにdue:/t:デートピッカー追加: 既存タグのパース処理実装、tag-utils.tsのupdateTag()連携、初期値復元ロジック実装",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
    {
      test: "handlers.tsのタグ反映テスト: due:/t:タグの追加/更新/削除、YYYY-MM-DD形式の検証、既存タスクへのタグ追加テスト",
      implementation: "handlers.tsにdue:/t:タグ反映処理実装: tag-utils.tsのaddTag()/updateTag()活用、デートピッカー値のタスク反映ロジック、保存時の検証処理",
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

// Completed Sprints - Phase 1-6 (Sprint 1-31) compacted, see git history for details
export const completedSprints: CompletedSprint[] = [
  // Phase 1-5 (Sprint 1-24): 基本機能+ドキュメント完了、438t達成
  // Phase 6 (Sprint 25-31): UI実装+Action返済+view.tsリファクタ完了
  { sprint: 25, pbi: "PBI-025", story: "基本UI描画", verification: "passed", notes: "443t" },
  { sprint: 26, pbi: "PBI-026", story: "タスク追加UI", verification: "passed", notes: "449t" },
  { sprint: 27, pbi: "PBI-027", story: "データ保持修正", verification: "passed", notes: "471t" },
  { sprint: 28, pbi: "PBI-028", story: "タスクUI操作", verification: "passed", notes: "490t" },
  { sprint: 29, pbi: "PBI-029", story: "due:/t:視覚表示", verification: "passed", notes: "502t" },
  { sprint: 30, pbi: "PBI-032", story: "Action返済Sprint", verification: "passed", notes: "504t,Action実行率50%" },
  { sprint: 31, pbi: "PBI-034", story: "view.ts層分離", verification: "passed", notes: "504t,view.ts258→126行(51%削減),handlers.ts87行+rendering.ts129行作成,REFACTOR率100%" },
  // Phase 7 (Sprint 32-34): UI機能実装継続→完了
  { sprint: 32, pbi: "PBI-030", story: "コントロールバー", verification: "passed", notes: "533t(+29t),TDD完全適用(9commit:RED4+GREEN4+REFACTOR3),REFACTOR率50%,controlbar.test.ts29t追加,FilterState型導入,CRUD後状態維持実装" },
  { sprint: 33, pbi: "PBI-033", story: "コントロールバーUI", verification: "passed", notes: "542t(+9t),aria-label追加でアクセシビリティ向上,FilterState型&DEFAULT_FILTER_STATE定数エクスポート,TDD適用(4commit:RED3+REFACTOR2),REFACTOR率50%(2/4),controlbar.test.ts38t(+9)" },
  { sprint: 34, pbi: "PBI-031", story: "リンククリック可能表示", verification: "passed", notes: "554t(+12t),内部/外部リンク+rec:アイコン表示実装,rendering.test.ts12t追加,TDD適用(5commit:RED1+GREEN2+REFACTOR2),REFACTOR率40%(2/5),LinkHandlerインターフェース抽象化,Phase 7完了" },
  // Phase 8 (Sprint 35-39): フォームUI強化
  { sprint: 35, pbi: "PBI-035", story: "優先度ドロップダウン", verification: "passed", notes: "563t(+9t),TDD適用(7commit:RED3+GREEN3+REFACTOR1),REFACTOR率14%(1/7),priority-options.ts新規作成,AddTaskModal/EditTaskModal/view.ts連携実装" },
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  { sprint: 35,
    workedWell: [
      "Phase 8初回Sprint完了: 優先度ドロップダウン実装、全AC達成",
      "TDDサイクル遵守: 7コミット中6コミットがRED/GREEN、テストファースト維持",
      "既存コード活用: priority-options.ts新規作成、再利用可能な設計",
      "テスト増加: 554t→563t（+9t）、品質向上継続",
      "3コンポーネント連携: AddTaskModal/EditTaskModal/view.tsの統合成功"
    ],
    toImprove: [
      "REFACTOR率大幅低下: 14%（1/7コミット）vs 目標50%、Phase 7水準（40-50%）から大幅悪化",
      "Sprint 34 Actions実行率低迷: 20%（1/5）、目標50%を大幅に下回る",
      "累積Action実行率悪化: 69%→実質更に低下、Excellent基準（90%）から遠のく",
      "REFACTORコミット不足: 1コミットのみ、技術的負債蓄積リスク"
    ],
    actions: [
      "REFACTOR専念Sprint検討: Sprint 36-37間でREFACTOR専念Sprintを挿入し、REFACTOR率を目標50%に回復",
      "Actions優先実行: Sprint 36で残8件のActionから最優先3件を実行（実行率60%以上目標）",
      "REFACTOR基準明確化: 各Subtaskで最低1REFACTORコミットを義務付けるルール導入",
      "品質評価実施: Sprint 36 Planning前に563テストのカバレッジ・保守性を評価",
      "ドキュメント即時更新: Sprint完了時にCLAUDE.md/README.mdを即座に更新するフロー確立"
    ] },
];

// Action Management (Sprint 35完了、新規5件Action追加)
export const actionManagement = {
  kpi: { min: 50, healthy: 70, excellent: 90 },
  tracking: { total: 31, executed: 19, rate: 61, remaining: 12 }, // Sprint 35完了（Sprint 34 Action 1件実行: Phase 8計画策定）、新規5件Action追加（REFACTOR専念Sprint検討/Actions優先実行/REFACTOR基準明確化/品質評価実施/ドキュメント即時更新）
};

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
