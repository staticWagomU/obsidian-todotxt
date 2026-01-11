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
  sprint: { number: 43, pbi: "TBD", status: "not_started" as SprintStatus,
    subtasksCompleted: 0, subtasksTotal: 0, impediments: 0 },
  phase: { number: 9, status: "done", sprints: "40-42", pbis: "PBI-040〜042", goal: "UIデザイン刷新（Apple-likeモダンデザイン）完遂" },
};

// Product Goal
export const productGoal = {
  statement: "Obsidian内でtodo.txt形式のファイルを直感的に管理・表示する",
  owner: "@scrum-team-product-owner",
};

// Product Backlog (Order = Priority) - done PBIs compacted, see git history
export const productBacklog: ProductBacklogItem[] = [
  // Phase 1-7完了: Sprint 1-34（34 PBIs done）
  // Phase 8完了 (Sprint 35-39): フォームUI強化、626t達成(+72t)
  //   Sprint 35 PBI-035: 優先度ドロップダウン、563t(+9t)、done
  //   Sprint 36 PBI-036: デートピッカー、585t(+22t)、done
  //   Sprint 37 PBI-037: プロジェクト/コンテキスト選択、597t(+12t)、done
  //   Sprint 38 PBI-038: リアルタイムプレビュー、610t(+13t)、done
  //   Sprint 39 PBI-039: フォーム/テキストモード切替、626t(+16t)、done
  // Phase 9完了 (Sprint 40-42): UIデザイン刷新（Apple-likeモダンデザイン）、626t維持
  //   Sprint 40 PBI-040: ミニマルUIデザイン基盤、626t、done
  //   Sprint 41 PBI-041: 滑らかなインタラクション、626t、done
  //   Sprint 42 PBI-042: モーダル洗練デザイン、626t、done、REFACTOR率50%達成
  // Phase 10: 次のPhaseを計画中
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

// Current Sprint (Sprint 43準備中)
export const currentSprint = {
  sprint: 43,
  pbi: "TBD",
  goal: "TBD - Phase 10の方向性を検討中",
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

// Completed Sprints - Phase 1-8 compacted, see git history for details
export const completedSprints: CompletedSprint[] = [
  // Phase 1-7 (Sprint 1-34): 基本機能+ドキュメント+UI実装完了、554t達成
  // Phase 8 (Sprint 35-39): フォームUI強化完了、626t達成(+72t)
  // Phase 9 (Sprint 40-42): UIデザイン刷新完了（Apple-likeモダンデザイン）、626t維持
  { sprint: 40, pbi: "PBI-040", story: "ミニマルUIデザイン基盤", verification: "passed", notes: "626t,CSS変数/BEM/アクセシビリティ確立" },
  { sprint: 41, pbi: "PBI-041", story: "滑らかなインタラクションフィードバック", verification: "passed", notes: "626t,ホバー/フォーカス/チェックマークアニメーション完遂" },
  { sprint: 42, pbi: "PBI-042", story: "モーダル洗練デザイン", verification: "passed", notes: "626t,角丸/ブラー/入力/ボタン完成,REFACTOR率50%達成,Phase 9完遂" },
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  { sprint: 41,
    workedWell: [
      "全サブタスクでRED-GREEN-REFACTORサイクル完遂: 4サブタスク×3コミット=12コミットで一貫したTDDサイクル維持",
      "CSS変数システムの一貫活用: Sprint 40で確立したシステムを継続適用し、animation-specific変数を追加拡張",
      "アニメーション実装の体系化: transition時間をCSS変数で管理する仕組みを構築、保守性向上",
      "アクセシビリティ対応の継続: :focus-visibleセレクタを明示的に指定し、キーボードナビゲーション対応を強化",
      "全4AC達成: ホバー/ボタン/フォーカス/チェックマークすべてのアニメーション要件を満たした",
      "DoD全項目合格: Tests/Lint/Types/Buildすべて通過、品質基準維持",
      "Phase 9進捗順調: 3 Sprintのうち2 Sprint完了（PBI-040, 041）、最終Sprint 42への準備万端"
    ],
    toImprove: [
      "REFACTOR率33%で目標50%未達: Sprint 40の33%と同率、目標の-17pt低下継続",
      "Phase 9品質指標の未確立: CSS実装中心のため、従来のテスト増加数指標が適用できず626t維持のまま",
      "Sprint 40 Action実行状況の未追跡: Action 6件のうち実行状況が不明確（PBI-041/042 Refinement未確認）",
      "REFACTORの質的評価不足: コミット数は記録されているが、リファクタリングの影響範囲や効果が定量化されていない",
      "Phase 9完了後の技術的負債計画未着手: Sprint 40で延期した「REFACTOR専念Sprint」の具体計画が未策定"
    ],
    actions: [
      "Sprint 42でREFACTOR率50%達成: 4サブタスク想定なら12コミットのうち6コミットをREFACTORに配分",
      "Sprint 40 Action実行状況の確認と記録: actionManagement trackingを更新し、executed/rate/remainingを再計算",
      "Phase 9完了記念Sprintの計画策定: Sprint 43候補として技術的負債解消Sprintを計画、対象範囲をリストアップ",
      "REFACTORの影響範囲記録: 各REFACTORコミットで変更した変数/セレクタ数などを記録し、質的評価の基盤を構築",
      "Phase 9品質指標の最終評価: Sprint 42完了時にアクセシビリティスコア、CSS複雑度、BEM準拠率を測定",
      "PBI-042のBacklog Refinement完了: Sprint 42 Planning前にPBI-042をreadyステータスに移行確認"
    ] },
];

// Action Management (Sprint 41完了、Sprint 40 Action 1/6件実行、Sprint 41 Action 6件追加)
export const actionManagement = {
  kpi: { min: 50, healthy: 70, excellent: 90 },
  tracking: { total: 52, executed: 30, rate: 58, remaining: 22 }, // Sprint 41完了（Sprint 40 Action 1件実行: CSS変数システム活用徹底、5件未実行: PBI-041/042 Refinement/Phase 9品質指標再定義/REFACTOR率50%未達/Visual Regression Testing導入検討/REFACTOR専念Sprint計画未策定）
};

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
