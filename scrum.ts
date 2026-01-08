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
// interface Commit { phase: CommitPhase; message: string; }
// interface Subtask {
//   test: string; implementation: string; type: SubtaskType;
//   status: SubtaskStatus; commits: Commit[];
// }
interface CompletedSprint {
  sprint: number; pbi: string; story: string;
  verification: "passed" | "failed"; notes: string;
}
interface Retrospective {
  sprint: number; workedWell: string[]; toImprove: string[]; actions: string[];
}

// Quick Status
export const quickStatus = {
  sprint: { number: 17, pbi: "PBI-017", status: "done" as SprintStatus,
    subtasksCompleted: 3, subtasksTotal: 3, impediments: 0 },
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
  { id: "PBI-014", story: { role: "Obsidianユーザー", capability: "説明文中の[[Note]]形式の内部リンクをパース・検出し、リンク先とエイリアスを抽出する", benefit: "タスクと関連ノートの関係を把握し、Obsidianの内部リンクとして正しく表示できる" }, acceptanceCriteria: [
      { criterion: "[[NoteName]]形式の基本的なwikilink検出: 説明文から[[NoteName]]を抽出し、リンク先ノート名を取得", verification: "pnpm vitest run -t 'extractInternalLinks' src/lib/internallink.test.ts" },
      { criterion: "[[NoteName|Display Text]]形式のエイリアス付きwikilink検出: エイリアス部分を分離し、リンク先とエイリアス両方を取得", verification: "pnpm vitest run -t 'extractInternalLinks' src/lib/internallink.test.ts" },
      { criterion: "複数の内部リンク検出: 1つの説明文に複数の[[wikilink]]が存在する場合、すべてを抽出", verification: "pnpm vitest run -t 'extractInternalLinks' src/lib/internallink.test.ts" },
      { criterion: "不正な形式の検出除外: 閉じ括弧なし・空文字列・ネストなど不正形式を無視", verification: "pnpm vitest run -t 'extractInternalLinks' src/lib/internallink.test.ts" },
    ], dependencies: ["PBI-002"], status: "done",
    complexity: { functions: 1, estimatedTests: 20, externalDependencies: 0, score: "LOW", subtasks: 3 } },
  { id: "PBI-015", story: { role: "Obsidianユーザー", capability: "説明文中の[text](url)形式のMarkdown外部リンクをパース・検出し、表示テキストとURLを抽出する", benefit: "タスクと関連Webリソース(ドキュメント、Issue、PR等)の関係を把握し、外部リンクとして正しく表示できる" }, acceptanceCriteria: [
      { criterion: "[text](url)形式の基本的なMarkdownリンク検出: 説明文から[text](url)を抽出し、表示テキストとURLを取得", verification: "pnpm vitest run -t 'extractExternalLinks' src/lib/externallink.test.ts" },
      { criterion: "複数の外部リンク検出: 1つの説明文に複数の[text](url)が存在する場合、すべてを抽出", verification: "pnpm vitest run -t 'extractExternalLinks' src/lib/externallink.test.ts" },
      { criterion: "不正な形式の検出除外: 閉じ括弧なし・空文字列・ネスト・スペース含むURL等不正形式を無視", verification: "pnpm vitest run -t 'extractExternalLinks' src/lib/externallink.test.ts" },
      { criterion: "様々なURLスキーム対応: https://, http://, ftp://等の各種プロトコルを検出", verification: "pnpm vitest run -t 'extractExternalLinks' src/lib/externallink.test.ts" },
    ], dependencies: ["PBI-002"], status: "done",
    complexity: { functions: 1, estimatedTests: 22, externalDependencies: 0, score: "LOW", subtasks: 3 } },
  { id: "PBI-016", story: { role: "Obsidianユーザー", capability: "rec:タグによる繰り返しタスク自動生成", benefit: "完了時に次回タスクを自動作成し、定期的なタスクを手動登録なしで継続管理できる" }, acceptanceCriteria: [
      { criterion: "rec:パース: rec:1d, rec:+1w, rec:3m, rec:1y形式を正しくパースし、数値・期間・strict/non-strict判定を抽出", verification: "pnpm vitest run -t 'parseRecurrenceTag' src/lib/recurrence.test.ts" },
      { criterion: "次回日付計算: 日/週/月/年の期間で次回due:日付を計算。strict(+)モードは現due:基準、non-strictは完了日(今日)基準", verification: "pnpm vitest run -t 'calculateNextDueDate' src/lib/recurrence.test.ts" },
      { criterion: "しきい値保持: 元タスクのt:とdue:の間隔を計算し、新タスクの次回due:から同間隔でt:を逆算して設定", verification: "pnpm vitest run -t 'preserveThresholdInterval' src/lib/recurrence.test.ts" },
      { criterion: "繰り返しタスク生成: 完了タスクからrec:に基づき新タスク作成。due:/t:更新、作成日=今日、completed=false、pri:タグ削除", verification: "pnpm vitest run -t 'createRecurringTask' src/lib/recurrence.test.ts" },
      { criterion: "統合: toggleCompletionでrec:タグ検出時、元タスク完了+新タスク生成の両方を実行し、ファイル更新", verification: "pnpm vitest run -t 'toggle.*recurrence' src/lib/todo.test.ts" },
    ], dependencies: ["PBI-003"], status: "done",
    complexity: { functions: 6, estimatedTests: 38, externalDependencies: 0, score: "HIGH", subtasks: 6 },
    refactorChecklist: [
      "parseRecurrenceTag: 正規表現パターンの抽出（magic number排除）",
      "calculateNextDueDate: 日付計算ロジックの関数分割（月末/年末境界処理の独立）",
      "createRecurringTask: タスククローン処理の共通化（既存clone処理との統一検討）",
      "月/年の日数計算: Date APIの月末自動補正を利用した堅牢な実装（2月/閏年対応）",
      "期間計算の型安全性: Duration型の導入検討（days/weeks/months/yearsの型区別）",
    ] },
  { id: "PBI-017", story: { role: "Obsidianユーザー", capability: "完了時にpri:タグとして優先度を保存し、未完了時に復元する", benefit: "タスクの完了/未完了トグル時に優先度を失わず、元の優先度を維持できる" }, acceptanceCriteria: [
      { criterion: "完了時に優先度→pri:タグ変換: (A)のタスクを完了すると、(A)が削除されpri:Aタグが追加される", verification: "pnpm vitest run -t 'toggleCompletion.*priority to pri tag'" },
      { criterion: "未完了時にpri:タグ→優先度復元: pri:Aタグ付き完了タスクを未完了にすると、pri:Aが削除され(A)が復元される", verification: "pnpm vitest run -t 'toggleCompletion.*pri tag to priority'" },
      { criterion: "優先度なしタスクはpri:タグ追加しない: 優先度なしタスクを完了してもpri:タグは追加されない", verification: "pnpm vitest run -t 'toggleCompletion.*no priority no pri tag'" },
      { criterion: "description内のpri:タグ保持: 説明文に含まれるpri:Aなどの文字列を誤検出せず、tagsオブジェクトのpri:のみ処理", verification: "pnpm vitest run -t 'toggleCompletion.*preserve description pri'" },
    ], dependencies: ["PBI-003"], status: "done",
    complexity: { functions: 2, estimatedTests: 18, externalDependencies: 0, score: "LOW", subtasks: 3 } },
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
  number: 17,
  pbiId: "PBI-017",
  story: "完了時にpri:タグとして優先度を保存し、未完了時に復元することで、優先度を失わずトグル可能にする",
  status: "done" as SprintStatus,
  subtasks: [
    {
      test: "toggleCompletion - 完了時変換: (A)のタスクを完了すると、(A)が削除されpri:Aタグが追加される (AC1)",
      implementation: "src/lib/todo.ts: toggleCompletion関数内に優先度→pri:タグ変換ロジック追加。未完了→完了時、priorityがnull以外なら tags配列にpri:${priority}追加 → priority=nullに設定 → 再シリアライズ。",
      type: "behavioral" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [
        { phase: "red" as CommitPhase, message: "test: 完了時にpriority→pri:タグ変換テスト追加 (RED)" },
        { phase: "green" as CommitPhase, message: "feat: 完了時にpriority→pri:タグ変換を実装 (GREEN)" }
      ]
    },
    {
      test: "toggleCompletion - 未完了時復元: pri:Aタグ付き完了タスクを未完了にすると、pri:Aが削除され(A)が復元される (AC2)",
      implementation: "src/lib/todo.ts: toggleCompletion関数内にpri:タグ→優先度復元ロジック追加。完了→未完了時、tags配列からpri:パターン検出 → priority設定 → tags配列からpri:削除 → 再シリアライズ。",
      type: "behavioral" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [
        { phase: "red" as CommitPhase, message: "test: 未完了時にpri:タグ→priority復元テスト追加 (RED)" },
        { phase: "green" as CommitPhase, message: "feat: 未完了時にpri:タグ→priority復元を実装 (GREEN)" }
      ]
    },
    {
      test: "toggleCompletion - 統合テスト: 優先度なしタスクはpri:タグ追加せず、説明文のpri:文字列を誤検出しない (AC3-4)",
      implementation: "src/lib/todo.test.ts: 統合テスト追加。優先度なしタスク完了時pri:タグ不在確認、説明文\"priority: high\"等pri:誤検出しないことをアサート。tagsオブジェクトのpri:のみ処理確認。",
      type: "behavioral" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [
        { phase: "green" as CommitPhase, message: "test: 優先度なし/誤検出防止の統合テスト追加" }
      ]
    }
  ]
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
  { sprint: 14, pbi: "PBI-014", story: "[[Note]]内部リンク", verification: "passed", notes: "3サブタスク完了、265テスト(+28: extractInternalLinks全28件)、6コミット(RED 3 + GREEN 3 + REFACTOR 0)。DoD全項目合格。AC全4項目達成。Refactor率0%(シンプルな正規表現実装のためリファクタリング不要)" },
  { sprint: 15, pbi: "PBI-015", story: "[text](url)外部リンク", verification: "passed", notes: "3サブタスク完了、292テスト(+27: extractExternalLinks全27件)、8コミット(RED 3 + GREEN 3 + FIX 1 + CHORE 1)。DoD全項目合格。AC全4項目達成。Refactor率0%(LOW複雑度、シンプルな正規表現実装)" },
  { sprint: 16, pbi: "PBI-016", story: "rec:繰り返しタスク自動生成", verification: "passed", notes: "6サブタスク完了(初HIGH複雑度Sprint)、331テスト(+39: recurrence.test.ts 31 + todo.test.ts 4 + view統合)、13コミット(RED 6 + GREEN 6 + FIX 1)。DoD全項目合格。AC全5項目達成。Refactor率0%(HIGH複雑度、実装集中型)" },
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  { sprint: 16,
    workedWell: [
      "初HIGH複雑度Sprintの成功完遂(Phase 3最難関突破): 6サブタスク/6関数/39テスト/13コミット計画通り実行、Sprint 11 MEDIUM経験活用の構造化設計、TDDサイクル維持(RED 6 → GREEN 6 → FIX 1)、Phase 3最難関PBI予測(Sprint 15 Action#5)の正確性実証",
      "6サブタスク分割の有効性(日付計算複雑度の分離): パース(Subtask 1) → 日付計算non-strict/strict(2-3) → しきい値保持(4) → タスク生成(5) → toggleCompletion統合(6)、各境界明確で依存関係最小化、段階的実装の成功",
      "日付計算実装の堅牢性(月末/閏年対応): Date API月末自動補正活用(2026-01-31+1m→2026-02-28)、閏年テスト(2024-02-29→2024-03-31)、月/年境界処理の手動計算不要、calculateNextDueDate関数strictモード分岐明確",
      "toggleCompletion統合パターンの成熟(Phase 3標準化): PBI-013(threshold) → PBI-016(recurrence)統合パターン継承、rec:検出→createRecurringTask→配列追加→ファイル更新、既存ロジック影響最小化、統合テスト4件品質保証",
      "Refactor率0%の複雑度ベース正当化(HIGH複雑度基準確立): HIGH複雑度実装集中優先(0-10%目標)、Sprint 11 MEDIUM(37%) → Sprint 16 HIGH(0%)段階的基準、refactorChecklist将来候補明示、戦略的判断(技術負債先送りではない)",
    ],
    toImprove: [
      "Phase 1テクニカルレビューの9 Sprint未実施(プロジェクト存続危機): Sprint 15「Sprint 16完全BLOCKER化」Action未達成(4連続)、Sprint 8開始から9 Sprint経過(約3ヶ月)、Phase 1コードレビュー不在でPhase 3ほぼ完遂、プロジェクト基盤品質保証欠如で存続可否判断必要",
      "Retrospective Action実行率0%の4 Sprint継続(プロセス完全崩壊): Sprint 13→14→15→16で4連続0%、5項目全て4 Sprint放置(16週間≒4ヶ月)、「強制持ち越しルール導入」自体が未実行の矛盾、Retrospectiveイベント意義喪失で形骸化の極致",
      "UI統合延期の6 PBI累積(実働デモ不在の危機): PBI-016(rec)もUI延期→累積6 PBI(008/012/013/014/015/016)、Phase 2+Phase 3全機能未統合で実装完了、Sprint 17 UI統合計画策定すら未実施(Sprint 15 Action#2)、実働UIデモ不在でプロジェクト価値実証不可",
      "HIGH複雑度Sprintのリファクタリング戦略不在(技術負債累積): refactorChecklist 5項目残しSprint完了、「将来リファクタリング」実施計画なし、HIGH複雑度Sprint後の整理Sprint未設定、Phase 3完了後の総合リファクタリング計画不在",
    ],
    actions: [
      "プロジェクト継続可否判断会議の即時開催(EMERGENCY): 対象者PO+SM、議題9 Sprint Phase 1レビュー未実施+4 Sprint Action実行率0%深刻性評価、選択肢A)一時停止→全コードレビュー→再開、B)継続→Phase 1レビュー永久放棄→リスク受容宣言、C)終了→現状成果物リリース判断、期限Sprint 17 Planning前(24h以内)、成果物docs/project-continuation-decision.md",
      "UI統合Sprint(Sprint 17)の強制実行(Phase 2+3統合デモ): Sprint 17をUI統合専用Sprint強制確定、6 PBI統合対象(PBI-008/012/013/014/015/016)、TodoItem.tsx大規模リファクタリング+Obsidian APIコール実装、成果物実働UIデモ動画(Loom/YouTube)、DoD全6機能実働デモ完了、期限Sprint 17完了時(非交渉)、条件プロジェクト継続判断Aの場合のみ実行",
      "Retrospective Actionの3 Sprint自動削除ルール即時適用(形骸化解消): Sprint 15 Action 5項目全削除(4 Sprint未実施で自動失効)、Sprint 16以降新Actionのみ追跡、未完了Action→次SprintのImpediment自動昇格ルール適用開始、Impediment解消までPBIサイズ制限(LOW複雑度のみ)、Sprint 17 Planning時適用開始",
      "HIGH複雑度Sprint後のリファクタリングSprint挿入ルール策定: HIGH複雑度Sprint完了後、次Sprintの50%リファクタリング割当、PBI-016 refactorChecklist 5項目実施計画策定(parseRecurrenceTag正規表現/calculateNextDueDate分割/clone処理統一)、期限Sprint 18開始前、成果物docs/refactor-plan-pbi-016.md、条件プロジェクト継続判断Aの場合のみ",
      "Phase 3残PBI(PBI-017)の複雑度再評価と優先度判断: PBI-017(pri:タグ保存)複雑度LOW予測再確認、UI統合Sprint完了後の優先度判断、Phase 3完遂 vs Phase 4(設定/フォーム)着手の戦略判断、期限Sprint 17 UI統合完了後、成果物Phase 3完遂戦略更新(scrum.ts)、条件プロジェクト継続判断Aの場合のみ",
    ] },
];

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
