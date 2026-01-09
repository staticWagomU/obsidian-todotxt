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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  sprint: { number: 20, pbi: "PBI-019", status: "in_progress" as SprintStatus,
    subtasksCompleted: 7, subtasksTotal: 7, impediments: 0 },
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
    ], dependencies: ["PBI-008", "PBI-012", "PBI-013", "PBI-014", "PBI-015", "PBI-016", "PBI-017"], status: "done",
    complexity: { functions: 8, estimatedTests: 50, externalDependencies: 4, score: "HIGH", subtasks: 10 } },
  { id: "PBI-018", story: {
      role: "Obsidianユーザー",
      capability: "プラグイン設定画面でtodo.txtビューの表示動作をカスタマイズする",
      benefit: "個人の作業スタイルに合わせて、デフォルトのソート順・フィルタ・表示形式を設定し、毎回手動で調整する手間を省ける"
    }, acceptanceCriteria: [
      { criterion: "設定タブ登録: ObsidianのSettings画面に「Todo.txt」プラグイン設定タブが表示され、設定項目にアクセスできる", verification: "pnpm vitest run -t 'settings tab registration'" },
      { criterion: "デフォルトソート設定: ソート順(未完了優先/優先度順/作成日順/辞書順)をドロップダウンで選択でき、選択した設定が永続化される", verification: "pnpm vitest run -t 'default sort setting'" },
      { criterion: "デフォルトグループ化設定: グループ化(なし/プロジェクト/コンテキスト)をドロップダウンで選択でき、選択した設定が永続化される", verification: "pnpm vitest run -t 'default grouping setting'" },
      { criterion: "完了タスク表示設定: 完了タスクの表示/非表示をトグルで切り替え可能で、選択した設定が永続化される", verification: "pnpm vitest run -t 'completed tasks visibility setting'" },
      { criterion: "設定の永続化と読み込み: 設定変更がloadData/saveDataで永続化され、プラグイン再起動後も設定が保持される", verification: "pnpm vitest run -t 'settings persistence'" },
    ], dependencies: [], status: "done",
    complexity: { functions: 3, estimatedTests: 25, externalDependencies: 1, score: "MEDIUM", subtasks: 5 } },
  { id: "PBI-019", story: {
      role: "Obsidianユーザー",
      capability: "todo.txt形式を意識せず、フォーム入力でタスクを作成・編集する",
      benefit: "todo.txt形式の構文を覚えなくても、UIフォームで優先度・日付・プロジェクト・コンテキスト・タグを入力でき、フォーマットエラーを防げる"
    }, acceptanceCriteria: [
      { criterion: "フォームベース作成: 優先度ドロップダウン(A-Z/なし)、作成日・期限日付ピッカー、プロジェクト/コンテキスト入力欄、タグkey:value入力欄を持つ作成フォームが表示される", verification: "pnpm vitest run -t 'task creation form fields'" },
      { criterion: "フォームベース編集: 既存タスクの編集時、現在の優先度・日付・プロジェクト・コンテキスト・タグがフォームに自動入力され、編集後にtodo.txt形式で保存される", verification: "pnpm vitest run -t 'task edit form prefill'" },
      { criterion: "日付ピッカー統合: 作成日・期限(due:)・しきい値(t:)日付をカレンダーUIで選択でき、YYYY-MM-DD形式に自動変換される", verification: "pnpm vitest run -t 'date picker integration'" },
      { criterion: "プロジェクト/コンテキスト補完: 既存のtodo.txtファイルから+project/@contextを抽出し、入力時にサジェスト(オートコンプリート)する", verification: "pnpm vitest run -t 'project context autocomplete'" },
      { criterion: "フォーム検証とエラー表示: 必須項目(説明文)の未入力、無効な日付形式などのエラーをリアルタイムで表示し、保存ボタンを無効化する", verification: "pnpm vitest run -t 'form validation errors'" },
    ], dependencies: ["PBI-004", "PBI-005"], status: "ready",
    complexity: { functions: 6, estimatedTests: 35, externalDependencies: 2, score: "HIGH", subtasks: 7 } },
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
  number: 20,
  pbiId: "PBI-019",
  story: "構造化フォーム",
  status: "in_progress" as SprintStatus,
  goal: "todo.txt形式の構文知識不要で、UIフォームから直感的にタスクを作成・編集できる",
  subtasks: [
    {
      test: "説明文必須検証、無効日付形式エラー表示、保存ボタン無効化をテスト",
      implementation: "TaskFormDialog.tsx基本構造、バリデーションロジック、エラー表示UI実装",
      type: "behavioral" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [
        { phase: "red" as CommitPhase, message: "test(form): フォームバリデーション失敗テスト追加" },
        { phase: "green" as CommitPhase, message: "feat(form): フォームバリデーションロジック実装" }
      ]
    },
    {
      test: "優先度A-Z/なし選択、選択値反映、todo.txt形式変換をテスト",
      implementation: "優先度ドロップダウンコンポーネント、Todo.priority変換実装",
      type: "behavioral" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [
        { phase: "red" as CommitPhase, message: "test(form): 優先度オプション生成・バリデーション失敗テスト追加" },
        { phase: "green" as CommitPhase, message: "feat(form): 優先度オプション生成・バリデーションロジック実装" }
      ]
    },
    {
      test: "作成日・due・t:日付選択、YYYY-MM-DD形式変換、カレンダーUIをテスト",
      implementation: "日付ピッカーコンポーネント、Date↔YYYY-MM-DD変換ユーティリティ実装",
      type: "behavioral" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [
        { phase: "red" as CommitPhase, message: "test(form): 日付変換ユーティリティ失敗テスト追加" },
        { phase: "green" as CommitPhase, message: "feat(form): 日付変換ユーティリティ実装" }
      ]
    },
    {
      test: "既存+project/@context抽出、入力時サジェスト、複数値対応をテスト",
      implementation: "オートコンプリートコンポーネント、既存タスクからの抽出ロジック実装",
      type: "behavioral" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [
        { phase: "red" as CommitPhase, message: "test(form): プロジェクト/コンテキスト抽出失敗テスト追加" },
        { phase: "green" as CommitPhase, message: "feat(form): プロジェクト/コンテキスト抽出ロジック実装" }
      ]
    },
    {
      test: "key:value形式入力、タグ追加/削除、Todo.tags変換をテスト",
      implementation: "タグ入力コンポーネント(key:valueペア管理)実装",
      type: "behavioral" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [
        { phase: "red" as CommitPhase, message: "test(form): タグ操作ロジック失敗テスト追加" },
        { phase: "green" as CommitPhase, message: "feat(form): タグ操作ロジック実装" }
      ]
    },
    {
      test: "新規作成ダイアログ表示、フォーム→todo.txt変換、ファイル保存をテスト",
      implementation: "TodosView.tsxへの作成ボタン統合、createTask連携実装",
      type: "behavioral" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [
        { phase: "red" as CommitPhase, message: "test(form): フォームデータ→Todo変換失敗テスト追加" },
        { phase: "green" as CommitPhase, message: "feat(form): フォームデータ→Todo変換ロジック実装" }
      ]
    },
    {
      test: "既存タスク編集時の自動入力、todo.txt→フォーム変換、更新保存をテスト",
      implementation: "TodoItem.tsxへの編集ボタン統合、updateTask連携実装",
      type: "behavioral" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [
        { phase: "red" as CommitPhase, message: "test(form): Todo→フォームデータ変換失敗テスト追加" },
        { phase: "green" as CommitPhase, message: "feat(form): Todo→フォームデータ変換ロジック実装" }
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

// Completed Sprints (Phase 1: Sprint 1-7, Phase 2: Sprint 8-12, Phase 3: Sprint 13-17, Phase 4: Sprint 18-19)
export const completedSprints: CompletedSprint[] = [
  { sprint: 1, pbi: "PBI-001", story: ".txt/.todotxt専用ビュー", verification: "passed", notes: "3st" },
  { sprint: 2, pbi: "PBI-002", story: "todo.txtパース", verification: "passed", notes: "6st,30t" },
  { sprint: 3, pbi: "PBI-003", story: "完了切替", verification: "passed", notes: "5st,57t" },
  { sprint: 4, pbi: "PBI-004", story: "新規タスク作成", verification: "passed", notes: "5st,77t" },
  { sprint: 5, pbi: "PBI-005", story: "タスク編集", verification: "passed", notes: "5st,102t" },
  { sprint: 6, pbi: "PBI-006", story: "タスク削除", verification: "passed", notes: "4st,120t" },
  { sprint: 7, pbi: "PBI-007", story: "ソート表示", verification: "passed", notes: "3st,132t,Phase1完" },
  { sprint: 8, pbi: "PBI-008", story: "優先度色分けバッジ", verification: "passed", notes: "4st,153t(+21)" },
  { sprint: 9, pbi: "PBI-009", story: "優先度フィルタ", verification: "passed", notes: "4st,164t(+11)" },
  { sprint: 10, pbi: "PBI-010", story: "テキスト検索", verification: "passed", notes: "4st,175t(+11)" },
  { sprint: 11, pbi: "PBI-011", story: "グループ化", verification: "passed", notes: "6st,183t(+8),MEDIUM" },
  { sprint: 12, pbi: "PBI-012", story: "due:表示", verification: "passed", notes: "4st,209t(+26),Phase2完" },
  { sprint: 13, pbi: "PBI-013", story: "t:グレーアウト", verification: "passed", notes: "3st,237t(+28)" },
  { sprint: 14, pbi: "PBI-014", story: "[[Note]]内部リンク", verification: "passed", notes: "3st,265t(+28)" },
  { sprint: 15, pbi: "PBI-015", story: "[text](url)外部リンク", verification: "passed", notes: "3st,292t(+27)" },
  { sprint: 16, pbi: "PBI-016", story: "rec:繰り返しタスク", verification: "passed", notes: "6st,331t(+39),HIGH" },
  { sprint: 17, pbi: "PBI-017", story: "pri:タグ保存", verification: "passed", notes: "3st,331t,Phase3完" },
  { sprint: 18, pbi: "PBI-020", story: "UI統合メガSprint", verification: "passed", notes: "10st,353t(+22),HIGH,7機能統合" },
  { sprint: 19, pbi: "PBI-018", story: "設定画面", verification: "passed", notes: "5st,367t(+14),MEDIUM,3設定プロパティ+UI" },
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  { sprint: 19,
    workedWell: [
      "Action実行率40%達成: Sprint 17の20%→倍増、継続的改善サイクル定着兆候、Refinement/追跡制度の2項目実施",
      "MEDIUM複雑度クリーン完遂: 5サブタスク、14新規テスト、RED 4+GREEN 6の典型的TDDサイクル、DoD全項目合格",
      "設定画面3プロパティ実装: defaultSort/defaultGrouping/showCompletedの3設定永続化、SettingsTab統合、Obsidian API活用",
      "コミット効率安定化: 12コミット(RED 4+GREEN 6+fix 2)、PBI-018 MEDIUM複雑度の標準的コミット粒度",
      "Phase 4進捗50%達成: PBI-020(UI統合)+PBI-018(設定画面)の2/2完了、残PBI-019(フォーム入力)のみ",
    ],
    toImprove: [
      "Action実行率40%停滞: 5項目中3項目未実施(リファクタ計画/Roadmap/Demo動画)、Sprint 18の100%→40%へ急降下",
      "Phase 4残1 PBI: PBI-019(フォームUI)のみ、HIGH複雑度7サブタスク、Phase完了まで1 Sprint必要",
      "リファクタリング計画3 Sprint放置: PBI-016 refactorChecklist 5項目(Sprint 16作成)→Sprint 17-18-19未着手、負債蓄積",
      "Product Roadmap不在継続: 1.0.0定義欠如2 Sprint継続、プロジェクト終了判断基準空白",
    ],
    actions: [
      "Phase 4完了: PBI-019(フォームUI)実施、Sprint 20でPhase 4完遂、MVP+拡張機能完成",
      "Roadmap 2026即時作成: Sprint 20 Planning前にdocs/product-roadmap-2026.md作成、1.0.0定義+Phase 5以降計画",
      "リファクタリング専用Sprint: Sprint 21でPBI-016 refactorChecklist 5項目実施、技術負債清算",
      "Action追跡制度厳格化: 3 Sprint未実施Action自動削除ルール適用、Sprint 22でSprint 19未実施Action(#2/#3/#5)削除判定",
      "Demo動画即時作成: PBI-019完了時にdocs/demo-sprint-20.md作成、フォームUI実働デモ標準化",
    ] },
];

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
