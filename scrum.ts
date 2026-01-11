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
  sprint: { number: 41, pbi: "PBI-041", status: "not_started" as SprintStatus,
    subtasksCompleted: 0, subtasksTotal: 0, impediments: 0 },
  phase: { number: 9, status: "in_progress", sprints: "40-42", pbis: "PBI-040〜042", goal: "UIデザイン刷新（Apple-likeモダンデザイン）" },
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
  //   Sprint 39 PBI-039: フォーム/テキストモード切替、626t(+16t)、done
  // Phase 9: UIデザイン刷新（Apple-likeモダンデザイン）
  //   Sprint 40 PBI-040: ミニマルUIデザイン基盤、626t、done
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
  sprint: 40,
  pbi: "PBI-040",
  goal: "Apple-likeミニマルデザインの基盤CSS構築により、洗練されたタスク管理UIを実現する",
  status: "in_progress" as SprintStatus,
  subtasks: [
    {
      test: "CSS変数が:rootに定義され、フォントサイズ階層（16px/14px/12px）とカラー/トランジション変数が設定されている",
      implementation: ":root定義でカラー（--color-*）・タイポグラフィ（--font-size-*/--line-height-*）・トランジション（--transition-default）変数を追加",
      type: "structural",
      status: "completed",
      commits: [
        { phase: "red", message: "test: CSS変数システムの検証基準を文書化" },
        { phase: "green", message: "feat: CSS変数システムとタイポグラフィ階層を定義" },
        { phase: "refactor", message: "refactor: CSS変数を論理的にグループ化しコメント改善" },
      ],
    },
    {
      test: ".task-itemクラスがpadding: 12px 16pxを持ち、タスク間に16px以上の余白があり、BEM命名規則に従う",
      implementation: "BEM形式のクラス体系確立（.task-item/.task-item__element/.task-item--modifier）、スペーシングユーティリティ追加、既存クラスのリファクタリング",
      type: "structural",
      status: "completed",
      commits: [
        { phase: "red", message: "test: タスクリストBEMクラスの検証基準を文書化" },
        { phase: "green", message: "feat: タスクリストのBEMクラス体系とスペーシングを実装" },
        { phase: "refactor", message: "refactor: スペーシングユーティリティ追加とPriorityクラスをBEM化" },
      ],
    },
    {
      test: ".task-item__checkboxクラスに角丸・transition: all 0.15s easeが適用され、カスタムスタイルが機能する",
      implementation: ".task-item__checkboxクラス定義、角丸・トランジション・ホバー効果のカスタムスタイル適用（Obsidian標準スタイル考慮）",
      type: "structural",
      status: "completed",
      commits: [
        { phase: "red", message: "test: チェックボックスカスタムスタイルの検証基準を文書化" },
        { phase: "green", message: "feat: チェックボックスのカスタムスタイルとアニメーションを実装" },
        { phase: "refactor", message: "refactor: チェックボックススタイルをCSS変数化し洗練" },
      ],
    },
    {
      test: ":focus-visibleスタイルが定義され、CSS変数でダークモード/ライトモード両方で視認性が確保されている",
      implementation: ":focus-visibleアウトライン定義（--color-focus使用）、CSS変数のグループ化コメント追加（Layout/Typography/Color/Animation）",
      type: "behavioral",
      status: "completed",
      commits: [
        { phase: "red", message: "test: アクセシビリティとテーマ対応の検証基準を文書化" },
        { phase: "green", message: "feat: アクセシビリティのフォーカススタイルを実装" },
        { phase: "refactor", message: "refactor: CSS変数システムを完全体系化しアクセシビリティ変数追加" },
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

// Completed Sprints - Phase 1-7 compacted, see git history for details
export const completedSprints: CompletedSprint[] = [
  // Phase 1-7 (Sprint 1-34): 基本機能+ドキュメント+UI実装完了、554t達成
  // Phase 8 (Sprint 35-39): フォームUI強化完了、626t達成(+72t)
  { sprint: 35, pbi: "PBI-035", story: "優先度ドロップダウン", verification: "passed", notes: "563t(+9t)" },
  { sprint: 36, pbi: "PBI-036", story: "デートピッカー", verification: "passed", notes: "585t(+22t)" },
  { sprint: 37, pbi: "PBI-037", story: "プロジェクト/コンテキスト選択", verification: "passed", notes: "597t(+12t)" },
  { sprint: 38, pbi: "PBI-038", story: "リアルタイムプレビュー", verification: "passed", notes: "610t(+13t),REFACTOR率60%" },
  { sprint: 39, pbi: "PBI-039", story: "フォーム/テキストモード切替", verification: "passed", notes: "626t(+16t),Phase 8完遂,Action実行率80%" },
  // Phase 9 (Sprint 40-42): UIデザイン刷新（Apple-likeモダンデザイン）
  { sprint: 40, pbi: "PBI-040", story: "ミニマルUIデザイン基盤", verification: "passed", notes: "626t,REFACTOR率33%,CSS実装のためテスト増加なし" },
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  { sprint: 39,
    workedWell: [
      "テスト増加数+16t達成: 目標+15tを超過達成（610t → 626t）、Phase 8完遂記念として品質向上実現",
      "Phase 8完遂: 5 Sprint（Sprint 35-39）でフォームUI強化完了、+63t追加（563t → 626t）",
      "form-helpersパターン推進成功: buildTextFromFormValues/parseFormValuesFromText追加でフォーム⇔テキスト双方向変換実装",
      "TDDサイクル遵守: 8コミット（RED 3 + GREEN 3 + REFACTOR 2）でテストファースト継続",
      "Action実行率80%達成: Sprint 38のAction 4/5件実行、前Sprint比で大幅改善",
      "Action Management実行率63%に改善: +9pt向上（54% → 63%）、健全水準70%に接近",
      "全AC達成: 切替ボタン表示/todo.txt形式直接編集/入力内容保持すべて実現",
      "BaseTaskModal強化継続: createToggleButton/createTextModeArea/updateTextModeVisibility/onToggleMode追加で機能拡充"
    ],
    toImprove: [
      "REFACTOR率25%で目標50%未達: Sprint 38の60%から35pt低下、Phase 8最低記録（2/8コミット）",
      "Phase 9はUIデザイン中心: 目視確認が主体でテスト増加が困難な性質、新たなテスト戦略が必要",
      "REFACTOR専念Sprint未実施: 4 Sprint連続で延期されたまま、技術的負債解消が先送り",
      "Phase 9 PBI全てdraft状態: PBI-040/041/042すべてがRefinement待ち、Sprint 40開始前に解消必要",
      "CSS/スタイリング変更の検証アプローチ未確立: Visual Regression Testingやスナップショットテスト等の導入検討が必要"
    ],
    actions: [
      "視覚的品質の測定基準確立: スクリーンショット比較やVisual Regression Testingツール導入検討、Phase 9の性質に適合した品質保証手法の確立",
      "CSS変更のテスト戦略策定: スタイル変更に対するテストアプローチ（スナップショットテスト、アクセシビリティテスト、レスポンシブテスト等）を確立",
      "PBI Refinement最優先: Sprint 40開始前にPBI-040/041/042をreadyステータスに移行、Backlog Refinement実施",
      "REFACTOR専念Sprint実施判断: Phase 9開始前または終了後のタイミングで技術的負債解消Sprintを実施、5 Sprint連続延期の解消",
      "Action実行率70%目標設定: 健全水準70%を次Sprintの必須目標とし、実行確認プロセス継続",
      "Phase 9目標値再設定: テスト増加数の現実的目標値設定（UIデザインの性質を考慮し、品質指標の多様化を検討）"
    ] },
];

// Action Management (Sprint 39完了、Sprint 38 Action 4/5件実行、新規Action未追加)
export const actionManagement = {
  kpi: { min: 50, healthy: 70, excellent: 90 },
  tracking: { total: 46, executed: 29, rate: 63, remaining: 17 }, // Sprint 39完了（Sprint 38 Action 4件実行: テスト増加数+15t再設定/Action実行率の明示化/form-helpersパターン推進/REFACTOR率50%維持未達、Phase 8完了記念Sprint実施延期）
};

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
