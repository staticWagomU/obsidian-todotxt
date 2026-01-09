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
  sprint: { number: 18, pbi: "PBI-020", status: "in_progress" as SprintStatus,
    subtasksCompleted: 0, subtasksTotal: 10, impediments: 0 },
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
      { criterion: "完了時に優先度→pri:タグ変換: (A)のタスクを完了すると、(A)が削除されpri:Aタグが追加される", verification: "pnpm vitest run -t '(A)のタスクを完了すると、(A)が削除されpri:Aタグが追加される'" },
      { criterion: "未完了時にpri:タグ→優先度復元: pri:Aタグ付き完了タスクを未完了にすると、pri:Aが削除され(A)が復元される", verification: "pnpm vitest run -t 'pri:Aタグ付き完了タスクを未完了にすると、pri:Aが削除され(A)が復元される'" },
      { criterion: "優先度なしタスクはpri:タグ追加しない: 優先度なしタスクを完了してもpri:タグは追加されない", verification: "pnpm vitest run -t '優先度なしタスクを完了してもpri:タグは追加されない'" },
      { criterion: "description内のpri:タグ保持: 説明文に含まれるpri:Aなどの文字列を誤検出せず、tagsオブジェクトのpri:のみ処理", verification: "pnpm vitest run -t '説明文中のpri:文字列を誤検出しない'" },
    ], dependencies: ["PBI-003"], status: "done",
    complexity: { functions: 2, estimatedTests: 18, externalDependencies: 0, score: "LOW", subtasks: 3 } },
  // Phase 4: UI統合 (Sprint 18)
  { id: "PBI-020", story: { role: "Obsidianユーザー", capability: "7つの拡張機能(優先度バッジ/due表示/threshold表示/内部リンク/外部リンク/繰り返しタスク/pri:タグ)がTodoItem.tsxに統合された実働デモ", benefit: "プラグインの実際の動作を確認し、todo.txt形式の実用的な管理が可能になる" }, acceptanceCriteria: [
      { criterion: "UI統合(Phase 2完全統合): PBI-008(優先度バッジ)、PBI-012(due表示)の2機能をTodoItem.tsxに統合し、視覚的フィードバックを実現", verification: "pnpm vitest run -t 'TodoItem.*priority badge|TodoItem.*due'" },
      { criterion: "UI統合(Phase 3前半統合): PBI-013(threshold表示)、PBI-014(内部リンク)、PBI-015(外部リンク)の3機能をTodoItem.tsxに統合し、リンクのクリック可能UI実現", verification: "pnpm vitest run -t 'TodoItem.*threshold|TodoItem.*internal.*link|TodoItem.*external.*link'" },
      { criterion: "UI統合(Phase 3後半統合+実働検証): PBI-016(rec:繰り返し)、PBI-017(pri:タグ)の2機能をTodoItem.tsxに統合し、完了トグル時の動作を実働確認", verification: "pnpm vitest run -t 'TodoItem.*recurrence|TodoItem.*pri:' && pnpm build" },
      { criterion: "Obsidian API統合(実働プラグイン実現): TodoItem.tsx内でObsidian APIを使用し、内部リンク(this.app.workspace.openLinkText)と外部リンク(window.open)のクリックハンドラ実装", verification: "pnpm tsc --noEmit && pnpm build" },
      { criterion: "7機能実働デモ動画作成(成果物確認): Obsidian vault内で7機能すべてが動作するデモ動画を撮影し、docs/demo-sprint-18.mdにリンク配置", verification: "ls docs/demo-sprint-18.md" },
    ], dependencies: ["PBI-008", "PBI-012", "PBI-013", "PBI-014", "PBI-015", "PBI-016", "PBI-017"], status: "ready",
    complexity: { functions: 8, estimatedTests: 50, externalDependencies: 4, score: "HIGH", subtasks: 10 } },
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
  number: 18,
  pbiId: "PBI-020",
  story: "Phase 2+3の7機能をTodoItem.tsxに統合し、Obsidian API連携による実働デモを達成する",
  status: "in_progress" as SprintStatus,
  goal: "Phase 2+3の7機能(優先度バッジ/due表示/threshold表示/内部リンク/外部リンク/rec:繰り返し/pri:タグ)をTodoItem.tsxに統合し、Obsidian API連携による実働デモを達成する",
  subtasks: [
    // Phase 2統合(AC1): 優先度バッジ + due表示
    {
      test: "PBI-008統合 - TodoItem.tsxで優先度(A)が赤色バッジ、(B)が橙色バッジ、(C)が黄色バッジ、優先度なしがバッジ非表示となることをテスト",
      implementation: "src/ui/TodoItem.test.tsx: 優先度バッジのスタイル検証テスト追加(priority A→赤, B→橙, C→黄, なし→非表示)",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: []
    },
    {
      test: "PBI-012統合 - TodoItem.tsxでdue:が期限切れ(過去)時に赤色、本日時にオレンジ色、未来時に通常表示となることをテスト",
      implementation: "src/ui/TodoItem.test.tsx: due表示のスタイル検証テスト追加(overdue→赤, today→橙, future→通常)",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: []
    },
    {
      test: "上記2サブタスクのテストをパス",
      implementation: "src/ui/TodoItem.tsx: getPriorityBadgeStyle/getDueDateStatusヘルパー関数追加、優先度バッジとdue表示のスタイル適用実装",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: []
    },
    // Phase 3前半統合(AC2): threshold + 内部リンク + 外部リンク
    {
      test: "PBI-013統合 - TodoItem.tsxでt:(threshold)が未来時にグレーアウト、本日/過去時に通常表示となることをテスト",
      implementation: "src/ui/TodoItem.test.tsx: threshold表示のスタイル検証テスト追加(future→グレーアウト, today/past→通常)",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: []
    },
    {
      test: "PBI-014統合 - TodoItem.tsx内で[[Note]]形式の内部リンククリック時にObsidian APIのopenLinkTextが呼ばれることをテスト",
      implementation: "src/ui/TodoItem.test.tsx: 内部リンククリックハンドラのモックテスト追加(app.workspace.openLinkText呼び出し検証)",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: []
    },
    {
      test: "PBI-015統合 - TodoItem.tsx内で[text](url)形式の外部リンククリック時にwindow.openが呼ばれることをテスト",
      implementation: "src/ui/TodoItem.test.tsx: 外部リンククリックハンドラのモックテスト追加(window.open呼び出し検証)",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: []
    },
    // Phase 3後半統合(AC3): rec: + pri:
    {
      test: "PBI-016統合 - TodoItem.tsxでrec:タグ付きタスクの完了トグル時に新タスク生成され、元タスクが完了状態になることをテスト",
      implementation: "src/ui/TodoItem.test.tsx: rec:タグ付き完了トグルのテスト追加(toggleCompletion→新タスク生成検証)",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: []
    },
    {
      test: "PBI-017統合 - TodoItem.tsxで(A)タスク完了時にpri:A追加、pri:A付き完了タスク未完了時に(A)復元されることをテスト",
      implementation: "src/ui/TodoItem.test.tsx: pri:タグ完了トグルのテスト追加 + src/ui/TodoItem.tsx: Phase 3前半(threshold/内部リンク/外部リンク)とPhase 3後半(rec:/pri:)の統合実装",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: []
    },
    // Obsidian API統合(AC4): 実働プラグイン実現
    {
      test: "上記Subtask 5-6のテストをパス",
      implementation: "src/ui/TodoItem.tsx: 内部リンククリックハンドラ(this.app.workspace.openLinkText)と外部リンククリックハンドラ(window.open)実装、Obsidian API型定義の統合",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: []
    },
    // 成果物デモ(AC5): 7機能実働確認
    {
      test: "`ls docs/demo-sprint-18.md`でデモドキュメント存在確認",
      implementation: "docs/demo-sprint-18.md: Obsidian vault内で7機能(優先度バッジ/due/threshold/内部リンク/外部リンク/rec:/pri:)すべての動作デモ動画リンク配置、各機能の動作スクリーンショット添付",
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
  { sprint: 17, pbi: "PBI-017", story: "pri:タグ保存 - 優先度復元", verification: "passed", notes: "3サブタスク完了、331テスト(既存テスト更新のみ、新規追加なし)、6コミット(RED 2 + GREEN 2 + TEST 1 + CHORE 1)。DoD全項目合格。AC全4項目達成。Refactor率0%(LOW複雑度、シンプルな実装)" },
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  { sprint: 17,
    workedWell: [
      "Phase 3完遂達成(Sprint 13-17、5 PBI完了): PBI-013(t:)→014([[]])→015([url])→016(rec:)→017(pri:)連続完遂、拡張機能フェーズ完全達成、Phase 1 MVP(Sprint 1-7)→Phase 2 UI(Sprint 8-12)→Phase 3拡張(Sprint 13-17)の3フェーズ構造完成、todo.txt形式の主要拡張機能網羅",
      "LOW複雑度Sprintの安定遂行(HIGH後の円滑復帰): Sprint 16 HIGH(6サブタスク/39テスト/13コミット)→Sprint 17 LOW(3サブタスク/既存テスト更新/6コミット)へスムーズ移行、複雑度に応じた作業量調整の成功、HIGH複雑度後の回復Sprintとして機能",
      "toggleCompletion統合パターンの完全成熟(Phase 3標準確立): PBI-013(threshold)→016(recurrence)→017(priority)で3回目の統合パターン適用、完了/未完了トグル時の状態変換ロジック統一、priority→pri:タグ変換/復元処理の既存パターン継承、統合テスト品質保証の定型化",
      "テスト数331維持(既存テスト更新戦略): 新規テスト追加なしで既存テストケース更新のみ(pri:タグ挙動反映)、テスト資産の保守と拡張のバランス、回帰テスト自動実行でデグレ防止、テストスイート成熟度の証明",
      "Sprint 15予測の高精度実証(複雑度見積能力): Sprint 15 Action#5「PBI-017 LOW予測」が完全的中(3サブタスク/LOW複雑度)、Phase 3残PBI見積の正確性、2 Sprint先の複雑度予測成功、計画精度の向上",
    ],
    toImprove: [
      "Sprint 16 Action実行率0%継続(5連続0%、プロセス崩壊の決定的証拠): Sprint 13→14→15→16→17で5連続Action実行率0%達成、全5項目が5 Sprint放置(20週間≒5ヶ月)、EMERGENCY Action(プロジェクト継続判断)すら未実施の重大プロセス違反、Retrospectiveイベント完全無意味化の確定",
      "UI統合延期の7 PBI累積(Phase 2+3全機能未統合): PBI-017(pri:)もUI延期→累積7 PBI(008/012/013/014/015/016/017)、Phase 3完遂時点で実働デモ皆無、TodoItem.tsx統合負債の危険水準突破(7機能一括統合の高リスク)、プロジェクト価値実証完全不可の危機的状況",
      "Retrospective Action形骸化の確定(改善サイクル死亡宣告): 5 Sprint連続0%で「未実施」から「実施不能」へ状態遷移、Action実行の意思・能力・体制すべて欠如確定、3 Sprint自動削除ルール自体が未適用の無限ループ、プロセス改善機能の完全停止宣言",
      "Phase 3完遂後の戦略不在(次Phase判断の空白): Phase 3完了後の方向性未決定(Phase 4着手 vs UI統合優先 vs リファクタリング実施)、PBI-018(設定画面)/PBI-019(構造化フォーム)のReady状態未達成(draft維持)、Product Backlog優先順位の再評価不在、プロジェクトビジョンの不明瞭化",
    ],
    actions: [
      "Retrospective Action制度の完全廃止宣言(形骸化の公式承認): 5 Sprint連続0%実行で改善サイクル機能不全確定、Action項目記載の継続=虚偽記録の継続、形骸化を認め制度廃止を明示的決定、代替策なし(改善プロセス放棄の承認)、retrospectives配列actions項目削除検討、記録日Sprint 18 Planning時",
      "UI統合メガSprint(Sprint 18)の7 PBI一括統合実施: 7 PBI統合対象(PBI-008/012/013/014/015/016/017)、TodoItem.tsx全面書き換え+Obsidian API統合実装、成果物7機能実働デモ動画、DoD全7機能統合完了+実働確認、期限Sprint 18完了時、Phase 2+3統合負債の一括清算",
      "Phase 4 PBI(PBI-018/019)のBacklog Refinement実施: PBI-018(設定画面)Ready化=User Story詳細化+AC具体化+依存関係明示+複雑度見積、PBI-019(構造化フォーム)Ready化=同上、Phase 4着手可否判断の材料整備、期限Sprint 18 UI統合完了後、成果物scrum.ts PBI更新(draft→refining→ready)",
      "Phase 1-3総合リファクタリング計画の策定(技術負債棚卸): 対象Phase 1(Sprint 1-7)/Phase 2(Sprint 8-12)/Phase 3(Sprint 13-17)全実装コード、refactorChecklist統合(PBI-016含む)、優先順位付けと実施Sprint割当、成果物docs/refactor-plan-phase-1-3.md、期限Sprint 19開始前、条件UI統合完了後",
      "Product Goal再定義とRoadmap策定(プロジェクト方向性明確化): 現Product Goal「Obsidian内でtodo.txt管理・表示」達成度評価、Phase 4(設定/フォーム) vs Phase 5(新機能)検討、Release 1.0.0判断基準策定、成果物docs/product-roadmap-2026.md、期限Sprint 18 Retrospective前、Product Ownerとの協議必須",
    ] },
];

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
