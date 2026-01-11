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
  sprint: { number: 41, pbi: "PBI-041", status: "in_progress" as SprintStatus,
    subtasksCompleted: 1, subtasksTotal: 4, impediments: 0 },
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
    status: "ready",
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

// Current Sprint (Sprint 41開始)
export const currentSprint = {
  sprint: 41,
  pbi: "PBI-041",
  goal: "タスク操作時の滑らかなフィードバック体験を実現し、直感的なインタラクションを提供する",
  status: "in_progress" as SprintStatus,
  subtasks: [
    {
      test: "タスク行ホバー時に背景色が150-200msでフェードイン",
      implementation: "task-itemにtransition: background-color 0.15s easeを定義、:hoverで背景色変化",
      type: "behavioral" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [
        { phase: "red" as CommitPhase, message: "test: タスク行ホバーアニメーション - 背景色フェードイン仕様定義" },
        { phase: "green" as CommitPhase, message: "feat: タスク行ホバーアニメーション実装 - 背景色150msフェードイン" },
        { phase: "refactor" as CommitPhase, message: "refactor: transition変数を特定プロパティ用に最適化" },
      ],
    },
    {
      test: "ボタンホバー時にスケール/シャドウが微細に変化",
      implementation: "ボタンクラスにtransition: transform 0.15s, box-shadow 0.15s定義、:hoverでtransform: scale(1.05)適用",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
    {
      test: "フォーカス時にアウトラインまたはシャドウでハイライト表示（キーボードナビゲーション対応）",
      implementation: ":focus-visibleでoutline/box-shadowを定義、既存のアクセシビリティ変数を活用",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
    {
      test: "完了トグル時にチェックマークがスムーズに出現するアニメーション",
      implementation: "チェックボックスに@keyframes定義、transition/transformでスケール+フェード効果を実装",
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

// Completed Sprints - Phase 1-8 compacted, see git history for details
export const completedSprints: CompletedSprint[] = [
  // Phase 1-7 (Sprint 1-34): 基本機能+ドキュメント+UI実装完了、554t達成
  // Phase 8 (Sprint 35-39): フォームUI強化完了、626t達成(+72t)
  // Phase 9 (Sprint 40-42): UIデザイン刷新（Apple-likeモダンデザイン）
  { sprint: 40, pbi: "PBI-040", story: "ミニマルUIデザイン基盤", verification: "passed", notes: "626t,CSS変数/BEM/アクセシビリティ確立" },
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  { sprint: 40,
    workedWell: [
      "CSS変数システム確立: 4グループ体系化（Layout/Typography/Color/Animation）により、保守性と拡張性が大幅向上",
      "BEM命名規則導入成功: .task-item/.task-item__element/.task-item--modifierパターン確立でCSSの可読性・保守性向上",
      "Obsidian標準変数活用: --background-*や--text-*変数使用によりテーマ自動対応実現、ダークモード/ライトモード両対応",
      "アクセシビリティ対応実装: :focus-visibleスタイル定義とWCAA AA準拠のコントラスト比確保",
      "全6AC達成: CSS変数定義/BEMクラス体系/チェックボックスカスタムスタイル/フォーカス/テーマ対応/視覚的調和すべて実現",
      "全サブタスクでRED-GREEN-REFACTORサイクル完遂: 12コミット（RED 4 + GREEN 4 + REFACTOR 4）でTDD継続",
      "Apple-likeミニマルデザイン基盤構築: 角丸・トランジション・スペーシングの統一デザインシステム確立",
      "REFACTOR率改善: 33%達成でSprint 39の25%から+8pt向上、Phase 8最低記録からの回復"
    ],
    toImprove: [
      "REFACTOR率33%で目標50%未達: Sprint 38の60%には遠く及ばず、-27pt低下（ただしSprint 39の25%からは+8pt改善）",
      "テスト増加0t: CSS実装の性質上予想通りだが、Phase 9全体での品質指標が不明確（626t維持）",
      "Phase 9適合の品質指標未確立: UIデザイン中心のため従来のテスト増加指標が適用困難、代替指標が必要",
      "PBI-041/042のdependency解消: PBI-040完了により依存関係が解消されたが、Refinement未実施でdraft状態継続"
    ],
    actions: [
      "CSS変数システム活用の徹底: PBI-040で確立した4グループ体系（Layout/Typography/Color/Animation）をPBI-041/042でも一貫適用",
      "PBI-041/042のBacklog Refinement実施: Sprint 41開始前に両PBIをreadyステータスに移行、依存関係解消済みを確認",
      "Phase 9品質指標の再定義: テスト増加数に代わる指標（アクセシビリティスコア、CSS複雑度、BEM準拠率等）を設定",
      "REFACTOR率50%目標の再設定: Sprint 41/42で各50%目標、Phase 9全体で40%以上達成を目指す",
      "Visual Regression Testing導入検討: CSS変更の品質保証として、スクリーンショット比較ツール（Percy、Chromatic等）の導入可否を検討",
      "Phase 9完遂後のREFACTOR専念Sprint計画: Phase 9終了後（Sprint 43候補）に技術的負債解消Sprintを実施、6 Sprint延期の解消"
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
