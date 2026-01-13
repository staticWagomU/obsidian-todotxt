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
interface ImplementationPolicy { policy: string; rationale: string; }
interface ProductBacklogItem {
  id: string; story: UserStory; acceptanceCriteria: AcceptanceCriterion[];
  dependencies: string[]; status: PBIStatus;
  complexity?: Complexity; refactorChecklist?: string[]; implementationPolicies?: Record<string, ImplementationPolicy>;
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
  sprint: { number: 43, pbi: "PBI-043", status: "not_started" as SprintStatus,
    subtasksCompleted: 0, subtasksTotal: 0, impediments: 0 },
  phase: { number: 10, status: "in_progress", sprints: "43-", pbis: "PBI-043〜", goal: "パーサー堅牢化（unified-test-cases.md準拠で品質向上）" },
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
  // Phase 10: パーサー堅牢化（unified-test-cases.md準拠）
  {
    id: "PBI-043",
    story: {
      role: "todo.txtユーザー",
      capability: "様々なエッジケースを含むtodo.txt形式のタスクを正確にパースできる",
      benefit: "公式仕様に準拠した堅牢なパース結果を得られ、データの信頼性が向上する",
    },
    acceptanceCriteria: [
      { criterion: "優先度エッジケース11件をテストでカバー（小文字/数字/複数文字/スペース内包等の無効形式検出）", verification: "pnpm vitest run src/lib/parser.test.ts -- -t 'priority edge'" },
      { criterion: "日付エッジケース14件をテストでカバー（スラッシュ形式/ゼロパディングなし/無効月日等の検出）", verification: "pnpm vitest run src/lib/parser.test.ts -- -t 'date edge'" },
      { criterion: "プロジェクト/コンテキストエッジケース17件をテストでカバー（前空白必須/メールアドレス誤認識防止）", verification: "pnpm vitest run src/lib/parser.test.ts -- -t 'project context edge'" },
      { criterion: "タグエッジケース12件をテストでカバー（URL/時刻/複数コロン等の対応）", verification: "pnpm vitest run src/lib/parser.test.ts -- -t 'tag edge'" },
      { criterion: "完了マーク/空白/特殊文字エッジケース20件をテストでカバー", verification: "pnpm vitest run src/lib/parser.test.ts -- -t 'completion|whitespace|special'" },
      { criterion: "実用的な複合パターン8件をテストでカバー", verification: "pnpm vitest run src/lib/parser.test.ts -- -t 'practical'" },
    ],
    dependencies: [],
    status: "ready" as PBIStatus,
    complexity: { functions: 2, estimatedTests: 82, externalDependencies: 0, score: "HIGH", subtasks: 6 },
    refactorChecklist: ["パーサー関数の責務分離", "正規表現の最適化", "エラーメッセージの改善"],
    implementationPolicies: {
      "完了タスクの優先度": { policy: "保持する", rationale: "既存実装(L140-143)は完了フラグに関係なくpriorityをパースしている。公式仕様では削除推奨だが、互換性のため保持" },
      "日付のバリデーション": { policy: "フォーマットチェックのみ", rationale: "YYYY-MM-DD正規表現による形式検証のみ実施。2024-02-30等の無効日付は本文扱い（パース時エラーとしない）" },
      "Unicode対応": { policy: "許可する", rationale: "\\S+パターンで非空白文字全体を受け入れる実装(L178,L186)により、日本語・絵文字などUnicodeをプロジェクト/コンテキスト/タグ名に許可" },
      "先頭・末尾の空白": { policy: "トリムする", rationale: "L131でtrim()実施。ただしdescription途中の複数スペースは保持" },
      "コメント行": { policy: "対応しない", rationale: "todo.txt公式仕様に記載なし。現在の実装にコメント行処理が存在せず、`#`で始まる行は通常タスクとして扱う" },
      "タグのvalueにコロン": { policy: "最初のコロンで分割", rationale: "正規表現/(\S+):(\S+)/gにより、key:val:ue → key='val:ue'として2番目のキャプチャグループに残りを含む。時刻値(10:30)やURL(http://...)に対応" },
      "エラーハンドリング": { policy: "無効な行もパース", rationale: "現在の実装は例外スローせず、どんな行もTodoオブジェクトとして返す。空行はparseTodoTxtレベル(L12-14)でスキップ" },
    },
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

// Current Sprint (Sprint 43: パーサー堅牢化)
export const currentSprint = {
  sprint: 43,
  pbi: "PBI-043",
  goal: "unified-test-cases.mdに基づくパーサーテスト網羅とパーサー堅牢化",
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
  { sprint: 42,
    workedWell: [
      "REFACTOR率50%達成（Sprint 41目標実現）: 12コミット中6コミット（角丸/ブラー/入力/ボタン各サブタスクで1-2REFACTORコミット配分）",
      "Phase 9完遂（Sprint 40-42）: Apple-like UIデザイン基盤確立 - CSS変数システム/BEM/アクセシビリティ/アニメーション/モーダル洗練の3 Sprint体系完成",
      "CSS変数システムの最終完成形: --border-radius-lg/--modal-backdrop-blur/--input-border-width/--input-padding追加で、モーダル固有変数を体系に統合",
      "prefers-reduced-motion対応: backdrop-filterを@media (prefers-reduced-motion: reduce)で無効化、アクセシビリティ配慮を強化",
      "BEM一貫性の維持: .modal配下でもBEMパターンを継続、.modal-containerなど構造的命名で可読性向上",
      "全4AC達成: 角丸/ブラー/フラット入力/プライマリボタンすべての洗練デザイン要件を満たした",
      "DoD全項目合格: Tests 626t維持、Lint/Types/Build通過、品質基準を保持したままPhase 9完了",
      "Phase 9総括: 3 Sprint（40-42）でCSS実装214行から513行に拡張（+299行、約2.4倍）、変数体系/BEM/アニメーション/アクセシビリティを包括的に確立"
    ],
    toImprove: [
      "Phase 9品質指標の未測定: Sprint 41 Actionで計画したアクセシビリティスコア/CSS複雑度/BEM準拠率の定量評価が未実施",
      "Visual Regression Testing未導入: CSS大幅拡張したが視覚的退行を自動検証する仕組みがなく、手動確認に依存",
      "REFACTOR専念Sprint未計画: Sprint 40/41で延期した技術的負債解消の具体計画が、Phase 9完了後も未策定",
      "CSS変数命名規則の未文書化: 変数体系は確立したが、命名ルール（Typography/Colors/Animation/Layout）がCLAUDE.mdに未記載",
      "Sprint 40 Action残件5件: PBI-041/042 Refinement実行、Phase 9品質指標再定義、REFACTOR専念Sprint計画が未完了",
      "テスト数626t据え置き: CSS実装中心のためテスト増加なし、Phase 9の品質指標をテスト数以外で示す必要性が顕在化"
    ],
    actions: [
      "Phase 10方向性の検討: 技術的負債解消Sprint/新機能実装/パフォーマンス最適化の3候補から優先度を決定",
      "CSS変数命名規則のドキュメント化: CLAUDE.mdに変数グループ（Typography/Colors/Animation/Layout）と命名ルールを記載",
      "BEM準拠率の定量測定: 全クラス定義を解析し、BEM命名規則準拠率を算出（目標90%以上）",
      "Visual Regression Testing導入検討: Storybook + Chromatic または Percy などのツール候補を調査",
      "Phase 9成果のREADME反映: Apple-like UIデザイン確立をプロジェクト概要に追記、スクリーンショット更新を検討",
      "actionManagement tracking更新: Sprint 42完了でexecuted +1（REFACTOR率50%達成）、remaining再計算"
    ] },
];

// Action Management (Sprint 42完了、Sprint 40 Action 2/6件実行、Sprint 41 Action 2/6件実行、Sprint 42 Action 6件追加)
export const actionManagement = {
  kpi: { min: 50, healthy: 70, excellent: 90 },
  tracking: { total: 58, executed: 32, rate: 55, remaining: 26 }, // Sprint 42完了（Sprint 40 Action 2/6実行: CSS変数活用徹底+PBI-042 Refinement、4件未実行: Phase 9品質指標再定義/Visual Regression Testing導入検討/REFACTOR専念Sprint計画未策定/Phase 9完了記念Sprint計画策定。Sprint 41 Action 2/6実行: REFACTOR率50%達成+Sprint 40 Action実行状況確認、4件未実行: Phase 9完了記念Sprint計画策定/REFACTORの影響範囲記録/Phase 9品質指標最終評価/PBI-042 Refinement完了）
};

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
