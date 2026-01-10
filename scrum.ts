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
  sprint: { number: 39, pbi: "PBI-039", status: "done" as SprintStatus,
    subtasksCompleted: 5, subtasksTotal: 5, impediments: 0 },
  phase: { number: 8, status: "done", sprints: "35-39", pbis: "PBI-035〜039", goal: "フォームUI強化（構造化入力/デートピッカー/コンボボックス/プレビュー）" },
};

// Product Goal
export const productGoal = {
  statement: "Obsidian内でtodo.txt形式のファイルを直感的に管理・表示する",
  owner: "@scrum-team-product-owner",
};

// Product Backlog (Order = Priority) - done PBIs compacted, see git history
export const productBacklog: ProductBacklogItem[] = [
  // Phase 1-7完了: Sprint 1-34（34 PBIs done）
  // Phase 8進行中 (Sprint 35-39): フォームUI強化
  //   Sprint 35 PBI-035: 優先度ドロップダウン、563t(+9t)、done
  //   Sprint 36 PBI-036: デートピッカー、585t(+22t)、done
  //   Sprint 37 PBI-037: プロジェクト/コンテキスト選択、597t(+12t)、done
  //   Sprint 38 PBI-038: リアルタイムプレビュー、610t(+13t)、done
  {
    id: "PBI-039",
    story: { role: "上級ユーザー", capability: "構造化フォームと直接テキスト編集モードを切り替え", benefit: "慣れたユーザーは高速にtodo.txt形式で直接入力できる" },
    acceptanceCriteria: [
      { criterion: "フォーム/テキストモード切替ボタンが表示される", verification: "pnpm vitest run -- AddTaskModal EditTaskModal" },
      { criterion: "テキストモードでは生のtodo.txt形式で編集できる", verification: "pnpm vitest run -- AddTaskModal" },
      { criterion: "モード切替時に入力内容が保持される", verification: "pnpm vitest run -- AddTaskModal" },
    ],
    dependencies: ["PBI-038"],
    status: "done",
    complexity: { functions: 3, estimatedTests: 12, externalDependencies: 0, score: "LOW", subtasks: 5 },
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
  sprint: 39,
  pbi: "PBI-039",
  goal: "上級ユーザーが慣れたtodo.txt形式で高速入力できるよう、フォーム/テキストモード切替機能を実装し、Phase 8フォームUI強化を完遂する",
  status: "done" as SprintStatus,
  subtasks: [
    {
      test: "AddTaskModal/EditTaskModalにモード切替ボタンが表示されること",
      implementation: "BaseTaskModalにモード状態(isTextMode)とcreateToggleButton()を追加し、フォーム/テキストモード切替UIを実装",
      type: "behavioral" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [
        { phase: "red" as CommitPhase, message: "test: モード切替ボタンUI表示と状態管理のテスト追加" },
        { phase: "green" as CommitPhase, message: "feat: モード切替ボタンのUI表示と状態管理を実装" },
      ],
    },
    {
      test: "テキストモードでtextareaが表示され、フォーム値と同期すること",
      implementation: "BaseTaskModalにcreateTextModeArea()を追加し、フォーム値⇔テキスト双方向変換を実装",
      type: "behavioral" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [
        { phase: "red" as CommitPhase, message: "test: テキストモード時のtextarea表示と値同期のテスト追加" },
        { phase: "green" as CommitPhase, message: "feat: テキストモード時のtextarea表示と値同期を実装" },
      ],
    },
    {
      test: "フォーム→テキスト、テキスト→フォーム切替時に入力内容が保持されること",
      implementation: "onToggleMode()でフォーム値⇔テキスト変換ロジックを実装し、モード切替時の入力値保持を実現",
      type: "behavioral" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [
        { phase: "red" as CommitPhase, message: "test: モード切替時の入力値保持ロジックのテスト追加" },
        { phase: "green" as CommitPhase, message: "feat: モード切替時の入力値保持ロジックを実装" },
      ],
    },
    {
      test: "既存テストが継続して通過すること(変換ロジック抽出後)",
      implementation: "parseFormValueFromText()とbuildTextFromFormValue()をutils/form-helpersに抽出し、変換ロジックを再利用可能に",
      type: "structural" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [
        { phase: "refactor" as CommitPhase, message: "refactor: フォーム⇔テキスト変換ロジックをutils/form-helpersに抽出" },
      ],
    },
    {
      test: "既存テストが継続して通過すること(モード管理ロジック整理後)",
      implementation: "モード状態管理とUI更新ロジックをBaseTaskModalクラス内メソッドに整理し、保守性を向上",
      type: "structural" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [
        { phase: "refactor" as CommitPhase, message: "refactor: BaseTaskModalのコード構造を整理" },
      ],
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
  // Phase 8 (Sprint 35-37): フォームUI強化
  { sprint: 35, pbi: "PBI-035", story: "優先度ドロップダウン", verification: "passed", notes: "563t(+9t),TDD適用(7commit:RED3+GREEN3+REFACTOR1),REFACTOR率14%(1/7),priority-options.ts新規作成,AddTaskModal/EditTaskModal/view.ts連携実装" },
  { sprint: 36, pbi: "PBI-036", story: "カレンダーからdue:/t:日付選択", verification: "passed", notes: "585t(+22t),TDD適用(13commit:RED4+GREEN5+REFACTOR4),REFACTOR率31%(4/13),date-picker-utils.ts/BaseTaskModal.ts新規作成,HTML5 date input実装,Lint修正でCSSクラス化,BaseTaskModal基底クラス抽出" },
  { sprint: 37, pbi: "PBI-037", story: "プロジェクト/コンテキスト選択", verification: "passed", notes: "597t(+12t),TDD適用(10commit:RED3+GREEN4+REFACTOR3),REFACTOR率30%(3/10),project-context-utils.ts新規作成,BaseTaskModalにcreateMultiSelect/createProjectContextSelects追加,マルチセレクトUI実装,全AC達成(ドロップダウン表示/新規作成/複数選択)" },
  { sprint: 38, pbi: "PBI-038", story: "リアルタイムプレビュー", verification: "passed", notes: "610t(+13t),TDD適用(10commit:RED2+GREEN2+REFACTOR6),REFACTOR率60%(6/10),utils/form-helpers.ts新規作成,BaseTaskModalにcreatePreviewArea/updatePreview/updatePreviewFromFormValues追加,AddTaskModal/EditTaskModalにプレビュー機能実装,全AC達成(プレビューエリア表示/リアルタイム更新/todo.txt形式準拠)" },
  { sprint: 39, pbi: "PBI-039", story: "構造化フォーム/テキストモード切替", verification: "passed", notes: "626t(+16t),TDD適用(8commit:RED3+GREEN3+REFACTOR2),REFACTOR率25%(2/8),utils/form-helpersにbuildTextFromFormValues/parseFormValuesFromText追加,BaseTaskModalにcreateToggleButton/createTextModeArea/updateTextModeVisibility/onToggleMode追加,フォーム⇔テキスト双方向変換実装,全AC達成(切替ボタン表示/todo.txt形式直接編集/入力内容保持),Phase 8完遂(Sprint 35-39完了)" },
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  { sprint: 37,
    workedWell: [
      "BaseTaskModal活用成功: createMultiSelect/createProjectContextSelects追加でDRY原則実践",
      "再利用可能ユーティリティ作成: project-context-utils.ts新規作成、date-picker-utilsパターンの継承",
      "REFACTOR率安定化: 30%でSprint 35の14%から+16ptの改善を維持",
      "マルチセレクトUI実装完了: HTML5標準要素活用で実装効率向上",
      "TDDサイクル遵守: 10コミット中7コミットがRED/GREEN、テストファースト継続",
      "全AC達成: ドロップダウン表示/新規作成/複数選択すべて実現"
    ],
    toImprove: [
      "REFACTOR率未達継続: 30% vs 目標50%、3Sprint連続で未達成（Sprint 35: 14%, Sprint 36: 31%, Sprint 37: 30%）",
      "Action実行率低迷: 40%（2/5件）vs 目標50%、健全水準70%から大幅に乖離",
      "テスト増加数減少: +12t vs Sprint 36の+22t、成長ペースが鈍化",
      "Action実行確認プロセス未確立: 今Sprint中に初めて明示的確認実施、定常化が必要"
    ],
    actions: [
      "REFACTOR率50%目標再設定: Sprint 38でREFACTOR率50%達成を必須目標とし、Subtask設計時に最低2REFACTORコミットを計画",
      "Action実行確認の定常化: Sprint Planning時に前SprintのActionsを必ずレビューし、実行率を記録",
      "テスト設計強化: Sprint 38でテスト増加数+15t以上を目標に、複雑なシナリオのテスト追加",
      "BaseTaskModal/utils系パターン推進: 共通ロジック抽出を積極化し、コードの再利用性を最大化",
      "Phase 8完了後のREFACTOR専念Sprint実施: Sprint 39完了後にREFACTOR専念Sprintを挿入し、技術的負債解消"
    ] },
  { sprint: 38,
    workedWell: [
      "REFACTOR率60%達成: 目標50%を10pt上回り過去最高記録樹立、4Sprint連続改善（Sprint 35: 14% → Sprint 36: 31% → Sprint 37: 30% → Sprint 38: 60%）",
      "Action実行確認の定常化成功: Sprint Planning時に前SprintのActionsをレビュー実施、プロセスが定着",
      "utils/form-helpers.ts新規作成: buildDescriptionWithTags関数でdescription構築ロジック共通化、再利用可能ユーティリティパターン継続",
      "BaseTaskModal強化: createPreviewArea/updatePreview/updatePreviewFromFormValuesの3メソッド追加、モーダル基底クラス拡充",
      "アクセシビリティ向上: aria-label=\"Todo.txt format preview\"追加、UI品質改善",
      "TDDサイクル堅守: 10コミット中4コミットがRED/GREEN、テストファースト継続",
      "全AC達成: プレビューエリア表示/リアルタイム更新/todo.txt形式準拠すべて実現"
    ],
    toImprove: [
      "テスト増加数微減: +13t vs 目標+15t（-2t未達）、Sprint 36の+22tから減少継続",
      "Action実行率未計測: 今Sprintで何件実行したか明示されておらず、透明性不足",
      "REFACTOR専念Sprint未実施: Sprint 37で提案されたが4Sprint連続で延期、実行されず"
    ],
    actions: [
      "テスト増加数+15t再設定: Sprint 39でテスト増加数+15t以上を目標に、Phase 8完遂記念として品質向上",
      "Action実行率の明示化: Sprint Review時にAction実行数/実行率を明確に記録し、透明性確保",
      "REFACTOR率50%維持: Sprint 39でもREFACTOR率50%以上を維持し、新たな基準として定着",
      "Phase 8完了記念Sprint実施: Sprint 39完了後にPhase 8完遂を祝い、REFACTOR専念Sprint実施を再評価",
      "form-helpersパターン推進: 共通ユーティリティの抽出を継続し、フォーム処理の標準化を推進"
    ] },
];

// Action Management (Sprint 38完了、新規5件Action追加)
export const actionManagement = {
  kpi: { min: 50, healthy: 70, excellent: 90 },
  tracking: { total: 46, executed: 25, rate: 54, remaining: 21 }, // Sprint 38完了（Sprint 37 Action 3件実行: REFACTOR率50%目標再設定/Action実行確認の定常化/BaseTaskModal-utils系パターン推進）、新規5件Action追加（テスト増加数+15t再設定/Action実行率の明示化/REFACTOR率50%維持/Phase 8完了記念Sprint実施/form-helpersパターン推進）
};

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
