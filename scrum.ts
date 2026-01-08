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
  sprint: { number: 17, pbi: null as string | null, status: "not_started" as SprintStatus,
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
  number: 16,
  pbiId: "PBI-016",
  story: "rec:タグによる繰り返しタスク自動生成で、完了時に次回タスクを自動作成する",
  status: "in_progress" as SprintStatus,
  subtasks: [
    {
      test: "parseRecurrenceTag: rec:1d, rec:+1w, rec:3m, rec:1y形式をパースし、数値・期間(d/w/m/y)・strict/non-strict(+)を抽出する",
      implementation: "src/lib/recurrence.ts: parseRecurrenceTag関数を実装。正規表現で(+)?(d+)([dwmy])をマッチし、{value: number, unit: 'd'|'w'|'m'|'y', strict: boolean}型を返す。不正形式はnullを返す。",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: []
    },
    {
      test: "calculateNextDueDate (non-strict): 完了日(今日)を基準に日/週/月/年を加算し、次回due:日付を計算する",
      implementation: "src/lib/recurrence.ts: calculateNextDueDate関数にnon-strictモード実装。baseDate + (value * unit)の日付計算。月/年は月末自動補正利用(Date API)。",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: []
    },
    {
      test: "calculateNextDueDate (strict): 現在のdue:を基準に日/週/月/年を加算し、次回due:日付を計算する(+モード)",
      implementation: "src/lib/recurrence.ts: calculateNextDueDate関数にstrictモード実装。strict=trueの場合、currentDueDate基準で計算。非strict時はcompletionDate基準。",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: []
    },
    {
      test: "preserveThresholdInterval: 元タスクのt:とdue:の間隔(日数)を計算し、新タスクの次回due:から同間隔でt:を逆算設定する",
      implementation: "src/lib/recurrence.ts: preserveThresholdInterval関数を実装。originalThreshold/originalDueから間隔計算(due - threshold)。newDue - intervalでnewThresholdを算出。",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: []
    },
    {
      test: "createRecurringTask: 完了タスクからrec:に基づき新タスク作成。due:/t:更新、作成日=今日、completed=false、pri:タグ削除を実施",
      implementation: "src/lib/recurrence.ts: createRecurringTask関数を実装。元タスククローン → due:/t:更新(calculateNextDueDate/preserveThresholdInterval使用) → createdDate=今日 → completed=false → tags配列からpri:削除 → 新Todoオブジェクト返却。",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: []
    },
    {
      test: "toggleCompletion統合: toggleCompletionでrec:タグ検出時、元タスク完了+新タスク生成の両方を実行し、ファイル更新する",
      implementation: "src/lib/todo.ts: toggleCompletion関数内にrec:検出ロジック追加。rec:存在時、createRecurringTask呼出 → 新タスクを配列末尾追加 → ファイル更新。統合テスト実施。",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: []
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
  { sprint: 15,
    workedWell: [
      "Link抽出モジュールファミリーの完成(内部+外部): PBI-014(内部リンク) → PBI-015(外部リンク)の連続実装、extractInternalLinks/extractExternalLinksのAPIデザイン一貫性、統一されたリンク抽出パターン確立(正規表現+matchAll+ループ)",
      "PBI-014パターン再利用の成功(実装継承): 正規表現マッチング共通パターン継承、シンプルな実装維持、28テスト(Sprint 14) → 27テスト(Sprint 15)の高密度カバレッジ水準維持、学習曲線の短縮",
      "2連続Refactor率0%の複雑度ベース正当化(Sprint 14-15): LOW複雑度Sprint連続でRefactor率0%達成、「シンプルな実装はリファクタリング不要」原則の再実証、Sprint 14で確立した複雑度別基準(LOW 0-20%)の実践",
      "多様なURLスキーム対応(汎用性実現): https/http/ftp/file/mailto等6スキーム対応テスト、単一正規表現[^)]+パターンで汎用性実現、Markdown標準準拠、スキーム特定ロジック不要のシンプル設計",
      "FIX+CHOREフェーズの明示的記録(リアルフロー): 8コミット構成(RED 3 + GREEN 3 + FIX 1 + CHORE 1)、従来のRED/GREEN/REFACTORに加えFIX/CHORE導入、テスト修正/整理作業の可視化、リアルな開発フローの正直な記録",
    ],
    toImprove: [
      "Phase 1テクニカルレビューの8 Sprint未実施(BLOCKER継続): Sprint 14「Sprint 15 BLOCKER指定」Action未達成、Sprint 8開始から8 Sprint経過(約2.5ヶ月相当)、技術的負債の危機的累積、プロセス信頼性の崩壊リスク、即座の解消なしにプロジェクト継続不可",
      "Retrospective Action実行率0%の3 Sprint継続(完全形骸化): Sprint 13→14→15で3連続Action実行率0%、5項目全てが3 Sprint放置状態、Retrospective完全形骸化、改善サイクルの機能停止、プロセス意義の喪失",
      "UI実装延期の5 PBI累積(Phase 2+Phase 3): PBI-012(due), PBI-013(threshold), PBI-014(内部リンク), PBI-015(外部リンク) + PBI-008(優先度バッジ)でUI延期、Phase 2完全未統合のままPhase 3進行、統合複雑性の危険水準到達(5 PBI一括統合リスク)",
      "Link系機能のUI統合戦略不在(設計負債): 内部リンク+外部リンクの統合ビジョン不明、Obsidian APIコール戦略未定(app.workspace.openLinkText等)、TodoItem.tsx拡張の複雑度予測不可、Phase 3完遂の見通し不良",
    ],
    actions: [
      "Phase 1テクニカルレビューのSprint 16完全BLOCKER化(開始禁止): Sprint 16 Planning一切不可条件設定、8 Sprint延期の即座解消最優先、対象: Sprint 1-7全実装コードレビュー(todo.ts/parser.ts/sort.ts/filter.ts/group.ts)、期限: Sprint 16 Planning前完了必須(非交渉)、未完了時はプロジェクト一時停止検討",
      "UI統合Sprintの緊急挿入(Phase 2+3統合): Sprint 17をUI統合専用Sprintとして確定、5 PBI統合対象(PBI-008/012/013/014/015)、TodoItem.tsx大規模リファクタリング実施、Obsidian APIコール実装(openLinkText/setMarkdownView/window.open)、成果物: 実働UIデモ、期限: Sprint 16中にUI統合計画策定完了",
      "Retrospective Actionの強制持ち越しルール導入(形骸化防止): 未完了Actionは次SprintのImpedimentに自動昇格、Impediment解消までPBIサイズ制限(LOW複雑度のみ)、3 Sprint未実施Action自動削除ルール、Sprint 16 Planningで適用開始、Action追跡の強制力付与",
      "Link系UI統合パターンの事前設計(技術検証): 内部リンク: Obsidian app.workspace.openLinkText()コール、外部リンク: window.open()またはObsidian openExternal、共通コンポーネント: LinkRenderer.tsxの設計、成果物: docs/link-ui-integration-design.md、期限: Phase 1レビュー完了後、UI統合Sprint前",
      "Phase 3残PBI複雑度の事前見積(リスク評価): PBI-016(rec:繰り返し): 予測HIGH(日付計算+タスク生成)、PBI-017(pri:タグ): 予測LOW(タグ変換のみ)、Phase 3完了前のリスク評価、UI統合Sprint後の優先度再評価、Phase完遂戦略の再構築",
    ] },
];

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
