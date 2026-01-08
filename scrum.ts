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
  sprint: { number: 14, pbi: null as string | null, status: "not_started" as SprintStatus,
    subtasksCompleted: 0, subtasksTotal: 0, impediments: 0 },
};

// Product Goal
export const productGoal = {
  statement: "Obsidian内でtodo.txt形式のファイルを直感的に管理・表示する",
  owner: "@scrum-team-product-owner",
};

// Product Backlog (Order = Priority)
export const productBacklog: ProductBacklogItem[] = [
  // Phase 1: MVP - COMPLETE (Sprint 1-7)
  { id: "PBI-001", story: { role: "Obsidianユーザー", capability: ".txt/.todotxtファイルを専用ビューで開く", benefit: "todo.txt形式を認識し適切なUIで表示" }, acceptanceCriteria: [
      { criterion: ".txt/.todotxt拡張子を専用ビューで開ける", verification: "pnpm vitest run --grep 'extension'" },
      { criterion: "TextFileView継承カスタムビュー登録", verification: "pnpm vitest run --grep 'TextFileView'" },
    ], dependencies: [], status: "done" },
  { id: "PBI-002", story: { role: "Obsidianユーザー", capability: "todo.txtをパースしてタスク一覧表示", benefit: "構造化されたリストで確認" }, acceptanceCriteria: [
      { criterion: "完了/優先度/日付/プロジェクト/コンテキスト/タグをパース", verification: "pnpm vitest run src/lib/parser.test.ts" },
    ], dependencies: ["PBI-001"], status: "done" },
  { id: "PBI-003", story: { role: "Obsidianユーザー", capability: "チェックボックスで完了切替", benefit: "ワンクリックで状態更新" }, acceptanceCriteria: [
      { criterion: "完了状態トグル/日付自動付与/ファイル保存", verification: "pnpm vitest run -t 'toggle'" },
    ], dependencies: ["PBI-002"], status: "done" },
  { id: "PBI-004", story: { role: "Obsidianユーザー", capability: "新規タスク作成", benefit: "簡単に追加" }, acceptanceCriteria: [
      { criterion: "タスク作成/作成日自動付与/ファイル追加", verification: "pnpm vitest run -t 'create'" },
    ], dependencies: ["PBI-002"], status: "done" },
  { id: "PBI-005", story: { role: "Obsidianユーザー", capability: "タスク編集", benefit: "内容修正" }, acceptanceCriteria: [
      { criterion: "編集/メタデータ保持/ファイル更新", verification: "pnpm vitest run -t 'edit'" },
    ], dependencies: ["PBI-002"], status: "done" },
  { id: "PBI-006", story: { role: "Obsidianユーザー", capability: "タスク削除", benefit: "不要タスク除去" }, acceptanceCriteria: [
      { criterion: "削除/リスト再構成/ファイル更新", verification: "pnpm vitest run -t 'delete'" },
    ], dependencies: ["PBI-002"], status: "done" },
  { id: "PBI-007", story: { role: "Obsidianユーザー", capability: "ソート表示", benefit: "優先度順の一覧" }, acceptanceCriteria: [
      { criterion: "未完了優先/優先度順/辞書順/イミュータブル", verification: "pnpm vitest run src/lib/sort.test.ts" },
    ], dependencies: ["PBI-002"], status: "done" },
  // Phase 2: フィルタリング & UI
  { id: "PBI-008", story: { role: "Obsidianユーザー", capability: "優先度色分けバッジ", benefit: "視覚的識別" }, acceptanceCriteria: [
      { criterion: "優先度A=赤、B=橙、C=黄の色分けバッジ表示", verification: "pnpm vitest run --grep 'priority badge color A B C'" },
      { criterion: "優先度D-Zはデフォルトスタイル適用", verification: "pnpm vitest run --grep 'priority badge default style'" },
      { criterion: "優先度なしタスクはバッジ非表示", verification: "pnpm vitest run --grep 'priority badge none'" },
    ], dependencies: ["PBI-002"], status: "done",
    complexity: { functions: 2, estimatedTests: 15, externalDependencies: 0, score: "LOW", subtasks: 4 } },
  { id: "PBI-009", story: { role: "Obsidianユーザー", capability: "優先度フィルタ", benefit: "特定優先度表示" }, acceptanceCriteria: [
      { criterion: "優先度A-Z指定でフィルタリング実行", verification: "pnpm vitest run --grep 'filter by specific priority'" },
      { criterion: "優先度なしタスクのフィルタリング", verification: "pnpm vitest run --grep 'filter tasks without priority'" },
      { criterion: "フィルタ結果が元リストを変更しないイミュータブル実装", verification: "pnpm vitest run --grep 'filter immutability'" },
    ], dependencies: ["PBI-007"], status: "done",
    complexity: { functions: 1, estimatedTests: 15, externalDependencies: 0, score: "LOW", subtasks: 4 } },
  { id: "PBI-010", story: { role: "Obsidianユーザー", capability: "テキスト検索", benefit: "キーワード絞込" }, acceptanceCriteria: [
      { criterion: "description検索: 説明文に検索キーワードが含まれるタスクを抽出", verification: "pnpm vitest run -t 'filter by search description'" },
      { criterion: "projects/contexts検索: +project/@contextタグで検索可能", verification: "pnpm vitest run -t 'filter by search projects contexts'" },
      { criterion: "大文字小文字区別なし検索: 検索時に大文字小文字を区別しない", verification: "pnpm vitest run -t 'filter by search case insensitive'" },
      { criterion: "空文字列検索: 空文字列で全タスク表示(フィルタなし)", verification: "pnpm vitest run -t 'filter by search empty'" },
    ], dependencies: ["PBI-007"], status: "done",
    complexity: { functions: 1, estimatedTests: 15, externalDependencies: 0, score: "LOW", subtasks: 4 } },
  { id: "PBI-011", story: { role: "Obsidianユーザー", capability: "グループ化", benefit: "関連タスクまとめ" }, acceptanceCriteria: [
      { criterion: "+projectでグループ化し、プロジェクトごとにタスクをまとめて表示", verification: "pnpm vitest run src/lib/group.test.ts" },
      { criterion: "@contextでグループ化し、コンテキストごとにタスクをまとめて表示", verification: "pnpm vitest run src/lib/group.test.ts" },
      { criterion: "グループなし(プロジェクト/コンテキスト未指定)タスクを\"未分類\"グループに配置", verification: "pnpm vitest run src/lib/group.test.ts" },
      { criterion: "複数プロジェクト/コンテキストを持つタスクを全該当グループに表示", verification: "pnpm vitest run src/lib/group.test.ts" },
      { criterion: "グループ内でソート順を保持(未完了優先/優先度順/辞書順)", verification: "Implementation preserves input array order (verified in code review)" },
    ], dependencies: ["PBI-007"], status: "done",
    complexity: { functions: 3, estimatedTests: 25, externalDependencies: 0, score: "MEDIUM", subtasks: 6 } },
  { id: "PBI-012", story: { role: "Obsidianユーザー", capability: "due:表示", benefit: "期限確認" }, acceptanceCriteria: [
      { criterion: "due:YYYY-MM-DD形式をDate型として正しく抽出", verification: "pnpm vitest run --grep 'getDueDate'" },
      { criterion: "期限切れタスク（過去日付）を赤色でハイライト表示", verification: "pnpm vitest run --grep 'due.*overdue'" },
      { criterion: "本日期限タスクをオレンジ色でハイライト表示", verification: "pnpm vitest run --grep 'due.*today'" },
    ], dependencies: ["PBI-002"], status: "done",
    complexity: { functions: 2, estimatedTests: 18, externalDependencies: 0, score: "LOW", subtasks: 4 } },
  // Phase 3: 拡張機能
  { id: "PBI-013", story: { role: "Obsidianユーザー", capability: "t:YYYY-MM-DD形式のしきい値日付タグ表示", benefit: "着手可能時期を視覚的に区別し、未来のタスクを判別可能にする" }, acceptanceCriteria: [
      { criterion: "t:YYYY-MM-DD形式をDate型として正しく抽出", verification: "pnpm vitest run -t 'getThresholdDate'" },
      { criterion: "しきい値が未来のタスク（未着手期間）を判定", verification: "pnpm vitest run -t 'threshold' src/lib/threshold.test.ts" },
      { criterion: "しきい値が本日または過去のタスク（着手可能）を判定", verification: "pnpm vitest run -t 'threshold' src/lib/threshold.test.ts" },
    ], dependencies: ["PBI-002"], status: "done",
    complexity: { functions: 2, estimatedTests: 28, externalDependencies: 0, score: "LOW", subtasks: 3 } },
  { id: "PBI-014", story: { role: "Obsidianユーザー", capability: "[[Note]]リンク", benefit: "ノート遷移" }, acceptanceCriteria: [
      { criterion: "内部リンク", verification: "pnpm vitest run --grep 'internal link'" },
    ], dependencies: ["PBI-002"], status: "draft" },
  { id: "PBI-015", story: { role: "Obsidianユーザー", capability: "[text](url)リンク", benefit: "Web遷移" }, acceptanceCriteria: [
      { criterion: "外部リンク", verification: "pnpm vitest run --grep 'external link'" },
    ], dependencies: ["PBI-002"], status: "draft" },
  { id: "PBI-016", story: { role: "Obsidianユーザー", capability: "rec:繰り返し", benefit: "定期タスク自動生成" }, acceptanceCriteria: [
      { criterion: "繰り返し生成", verification: "pnpm vitest run --grep 'recurrence'" },
    ], dependencies: ["PBI-003"], status: "draft" },
  { id: "PBI-017", story: { role: "Obsidianユーザー", capability: "pri:タグ保存", benefit: "優先度復元" }, acceptanceCriteria: [
      { criterion: "pri:変換", verification: "pnpm vitest run --grep 'pri tag'" },
    ], dependencies: ["PBI-003"], status: "draft" },
  { id: "PBI-018", story: { role: "Obsidianユーザー", capability: "設定画面", benefit: "カスタマイズ" }, acceptanceCriteria: [
      { criterion: "設定タブ", verification: "pnpm vitest run --grep 'settings'" },
    ], dependencies: [], status: "draft" },
  { id: "PBI-019", story: { role: "Obsidianユーザー", capability: "構造化フォーム", benefit: "形式不要の入力" }, acceptanceCriteria: [
      { criterion: "フォーム入力", verification: "pnpm vitest run --grep 'form'" },
    ], dependencies: ["PBI-004", "PBI-005"], status: "draft" },
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
  number: 14,
  pbiId: null as string | null,
  story: "Sprint not yet planned",
  status: "not_started" as SprintStatus,
  subtasks: [] as Subtask[],
  notes: "",
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

// Completed Sprints (Phase 1 MVP完了: Sprint 1-7, Phase 2完了: Sprint 8-12, Phase 3開始: Sprint 13-)
export const completedSprints: CompletedSprint[] = [
  { sprint: 1, pbi: "PBI-001", story: ".txt/.todotxt専用ビュー", verification: "passed", notes: "3サブタスク完了" },
  { sprint: 2, pbi: "PBI-002", story: "todo.txtパース", verification: "passed", notes: "6サブタスク完了、30テスト" },
  { sprint: 3, pbi: "PBI-003", story: "完了切替", verification: "passed", notes: "5サブタスク完了、57テスト" },
  { sprint: 4, pbi: "PBI-004", story: "新規タスク作成", verification: "passed", notes: "5サブタスク完了、77テスト" },
  { sprint: 5, pbi: "PBI-005", story: "タスク編集", verification: "passed", notes: "5サブタスク完了、102テスト" },
  { sprint: 6, pbi: "PBI-006", story: "タスク削除", verification: "passed", notes: "4サブタスク完了、120テスト" },
  { sprint: 7, pbi: "PBI-007", story: "ソート表示", verification: "passed", notes: "3サブタスク完了、132テスト。Phase 1 MVP完成" },
  { sprint: 8, pbi: "PBI-008", story: "優先度色分けバッジ", verification: "passed", notes: "4サブタスク完了、153テスト(+21)。DoD全項目合格。AC全3項目達成" },
  { sprint: 9, pbi: "PBI-009", story: "優先度フィルタ", verification: "passed", notes: "4サブタスク完了、164テスト(+11)。DoD全項目合格。AC全3項目達成。Refactor率27%(3/11コミット)" },
  { sprint: 10, pbi: "PBI-010", story: "テキスト検索", verification: "passed", notes: "4サブタスク完了、175テスト(+11)。DoD全項目合格。AC全4項目達成。Refactor率33%(4/12コミット)" },
  { sprint: 11, pbi: "PBI-011", story: "グループ化", verification: "passed", notes: "6サブタスク完了(初MEDIUM複雑度Sprint)、183テスト(+8)、19コミット(RED 6 + GREEN 6 + REFACTOR 7)。DoD全項目合格。AC全5項目達成。Refactor率37%(7/19)。groupByTags高階関数抽出でコード再利用実現、両関数1行化達成" },
  { sprint: 12, pbi: "PBI-012", story: "due:表示", verification: "passed", notes: "4サブタスク完了(Subtask3&4統合テスト実施)、209テスト(+26: getDueDate 15 + getDueDateStatus 8 + 統合3)、10コミット(RED 3 + GREEN 2 + REFACTOR 5)。DoD全項目合格。AC全3項目達成。Refactor率50%目標達成(5/10)。Phase 2完遂(Sprint 8-12、5 PBI、77テスト追加)" },
  { sprint: 13, pbi: "PBI-013", story: "t:グレーアウト", verification: "passed", notes: "3サブタスク完了(UI統合除外)、237テスト(+28: getThresholdDate 11 + getThresholdDateStatus 10 + 統合7)、10コミット(RED 2 + GREEN 3 + REFACTOR 5)。DoD全項目合格。AC全3項目達成。Refactor率50%維持(5/10)。Phase 3初Sprint、due.tsより厳密な日付検証実現(2026-02-30自動補正検出)" },
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  { sprint: 13,
    workedWell: [
      "due.tsパターンの完全再利用(Sprint 12知識活用): parseValidDate/toDateOnly/calculateDaysDifference再利用、2026-02-30自動補正検出でdue.tsより厳密な日付検証実現、一貫性のあるコードベース維持",
      "Refactor率50%の安定維持(2 Sprint連続達成): 5/10コミット、Sprint 12→13連続50%、持続可能な水準として実証。各サブタスク平均1.5 Refactor継続",
      "日付検証の品質向上: isDateAutoAdjusted関数による自動補正検出、形式+有効性+補正の3段階検証、境界値テスト2件追加(2026-13-01, 2026-02-30)",
      "UI実装延期の戦略的判断: React component構造理解不足考慮、統合テスト7件でE2Eフロー検証、コア機能完全性保証とUI実装リスク分離",
      "Phase 3初Sprintの成功: Phase 2→3シームレス移行、確立されたTDDプロセス維持、DoD全項目合格、AC全達成、+28テスト(209→237)",
    ],
    toImprove: [
      "Phase 1テクニカルレビューの継続未実施(6 Sprint経過): Sprint 12から持ち越し、Sprint 8開始時から6 Sprint経過、リスクCRITICAL、技術的負債の蓄積継続、これ以上の延期は不可",
      "UI実装戦略の継続未確定: Sprint 12 Action 3「Sprint 13 Planning時決定」未達成、PBI-012/013連続延期、戦略なき延期累積、UI統合複雑性増大リスク",
      "サブタスク統合判断基準の未策定: Sprint 12 Action 4「DoD/Planning guideline文書化」未実施、アドホック判断継続、見積もり精度への影響",
      "Refactor率50%の天井: 2 Sprint連続50%で向上なし、各サブタスク平均1.5 Refactorが実質上限か、60%超えの可能性と必要性不明",
    ],
    actions: [
      "Phase 1テクニカルレビューの必達実施(最優先・期限設定): Sprint 14開始前(Planning前完了必須)、Sprint 1-7全実装対象(todo.ts/parser.ts/sort.ts/filter.ts/group.ts)、コード品質/テストカバレッジ/型安全性/アーキテクチャ4観点チェック、テクニカルレビューレポート(docs/technical-review-phase1.md)作成、改善PBIリスト化、Product Ownerレビュー承認",
      "UI実装ロードマップの策定(具体的計画): Sprint 14 Planning前、React component現状分析(TodosView/TodosList/TodoItem構造、State管理)、UI統合パターン選択(個別統合/専用Sprint/段階的統合)、UI統合テスト戦略、成果物: docs/ui-implementation-roadmap.md",
      "サブタスク統合判断基準の文書化(DoD更新): 統合許可条件(UI未実装時/依存関係強/完全フロー検証)、統合時要件(E2Eテスト必須/ヘルパー関数/見積もり調整)、統合不可条件(独立機能/テストケース数不均衡)、scrum.ts definitionOfDone or planningGuidelines追加、Sprint 14以降適用",
      "Refactor率50%維持戦略の継続(現状維持): 50%を標準水準として継続、60%超えは追求しない、各サブタスク平均1.5 Refactor維持、チェックリスト4観点独立コミット継続、Sprint Review時発生率報告、50%下回った場合の原因分析",
      "Phase 3日付処理パターンの標準化: threshold.ts品質をPhase 3標準とする、将来の日付関連PBI対象(rec:繰り返し等)、パターン: parseValidDate(形式+有効性+自動補正)/toDateOnly/calculateDaysDifference/セマンティック定数、開発ガイドラインor技術レビュー成果物に文書化",
    ] },
];

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
