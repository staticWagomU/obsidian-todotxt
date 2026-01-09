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
  sprint: { number: 21, pbi: "PBI-021", status: "done" as SprintStatus,
    subtasksCompleted: 5, subtasksTotal: 5, impediments: 0 },
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
    ], dependencies: ["PBI-004", "PBI-005"], status: "done",
    complexity: { functions: 6, estimatedTests: 35, externalDependencies: 2, score: "HIGH", subtasks: 7 } },
  // Phase 5: リファクタリング & リリース準備
  { id: "PBI-021", story: {
      role: "開発者",
      capability: "recurrence.tsのリファクタリングによりコードの保守性・可読性・型安全性を向上させる",
      benefit: "正規表現のmagic number排除、日付計算ロジックの分割、Duration型導入により、バグ修正・機能追加が容易になり、長期的なメンテナンスコストを削減できる"
    }, acceptanceCriteria: [
      { criterion: "正規表現パターン抽出: parseRecurrenceTag内のmagic number(/^(\\+?)(\\d+)([dwmy])$/)を名前付き定数として抽出し、コメントで各グループの意味を説明", verification: "pnpm vitest run src/lib/recurrence.test.ts && pnpm tsc --noEmit" },
      { criterion: "日付計算ロジック分割: calculateNextDueDate内の月末/閏年境界処理を独立関数(adjustToMonthEnd等)に分割し、単体テストを追加", verification: "pnpm vitest run -t 'adjustToMonthEnd' && pnpm vitest run src/lib/recurrence.test.ts" },
      { criterion: "Duration型導入: RecurrencePatternのvalue/unit組み合わせをDuration型({ days: number } | { weeks: number } | { months: number } | { years: number })に置き換え、型安全性を強化", verification: "pnpm vitest run src/lib/recurrence.test.ts && pnpm tsc --noEmit" },
      { criterion: "既存テスト全合格: リファクタリング後も既存の38テストが全合格し、回帰バグがないことを確認", verification: "pnpm vitest run src/lib/recurrence.test.ts && pnpm vitest run src/lib/todo.test.ts -t recurrence" },
      { criterion: "DoD全項目合格: Tests/Lint/Types/Build全て合格し、リファクタリングが既存機能に影響を与えていないことを確認", verification: "pnpm vitest run && pnpm lint && pnpm tsc --noEmit --skipLibCheck && pnpm build" },
    ], dependencies: ["PBI-016"], status: "done",
    complexity: { functions: 8, estimatedTests: 50, externalDependencies: 0, score: "MEDIUM", subtasks: 5 },
    refactorChecklist: [
      "parseRecurrenceTag: 正規表現パターンの抽出（magic number排除）",
      "calculateNextDueDate: 日付計算ロジックの関数分割（月末/年末境界処理の独立）",
      "createRecurringTask: タスククローン処理の共通化（既存clone処理との統一検討）",
      "月/年の日数計算: Date APIの月末自動補正を利用した堅牢な実装（2月/閏年対応）",
      "期間計算の型安全性: Duration型の導入検討（days/weeks/months/yearsの型区別）",
    ] },
  { id: "PBI-022", story: {
      role: "プラグイン利用者",
      capability: "READMEとドキュメントを読んでプラグインの機能・使い方・インストール方法を理解する",
      benefit: "todo.txt形式の知識がなくても、プラグインの価値提案・主要機能・設定方法を把握でき、すぐに使い始められる"
    }, acceptanceCriteria: [
      { criterion: "README更新: プラグイン名(Todo.txt for Obsidian)・概要・価値提案(ソフトウェア非依存/人間可読/ソート可能)・主要機能7つ(優先度/due/threshold/リンク/繰り返し/フォーム/設定)をREADME.mdに記載", verification: "ls README.md && grep -q 'Todo.txt for Obsidian' README.md" },
      { criterion: "インストール手順: 手動インストール(manifest.json/main.js/styles.css配置)とコミュニティプラグイン登録準備の手順をREADME.mdに記載", verification: "grep -q 'Installation' README.md && grep -q 'manifest.json' README.md" },
      { criterion: "使い方ガイド: todo.txt形式の基本構文(完了/優先度/日付/project/context/tags)とプラグイン独自機能(due:/t:/rec:/pri:)の説明をdocs/user-guide.mdに記載", verification: "ls docs/user-guide.md && grep -q 'rec:' docs/user-guide.md" },
      { criterion: "スクリーンショット: 7機能の動作が分かるスクリーンショット(優先度バッジ/due表示/threshold/リンク/フォーム/設定画面)をdocs/images/に配置し、README/user-guideから参照", verification: "ls docs/images/*.png && grep -q '![' README.md" },
      { criterion: "package.json/manifest.json更新: name/description/author/authorUrlをtodo.txt固有の内容に更新し、サンプルプラグインの記述を削除", verification: "grep -q 'todo.txt' package.json && grep -q 'todo.txt' manifest.json" },
    ], dependencies: ["PBI-020"], status: "ready",
    complexity: { functions: 0, estimatedTests: 0, externalDependencies: 0, score: "LOW", subtasks: 5 } },
  { id: "PBI-023", story: {
      role: "プロジェクト運営者",
      capability: "Product Roadmap 2026とリリース基準を定義し、1.0.0リリースの判断基準を明確化する",
      benefit: "プロジェクトの方向性・優先順位・リリース判断が明確になり、コミュニティプラグイン登録の準備とマイルストーン管理が可能になる"
    }, acceptanceCriteria: [
      { criterion: "1.0.0定義: MVP(Phase 1)+拡張機能(Phase 2-3)+UI統合(Phase 4)を含む1.0.0の機能スコープをdocs/product-roadmap-2026.mdに記載", verification: "ls docs/product-roadmap-2026.md && grep -q '1.0.0' docs/product-roadmap-2026.md" },
      { criterion: "リリース基準: DoD合格(Tests/Lint/Types/Build)、README/ドキュメント整備、manifest.json更新、CHANGELOG.md作成の4項目をリリース基準として定義", verification: "grep -q 'Release Criteria' docs/product-roadmap-2026.md" },
      { criterion: "Phase 5-6計画: Phase 5(リファクタリング/ドキュメント/リリース準備)とPhase 6(コミュニティフィードバック/バグ修正)の計画を記載", verification: "grep -q 'Phase 5' docs/product-roadmap-2026.md && grep -q 'Phase 6' docs/product-roadmap-2026.md" },
      { criterion: "コミュニティプラグイン登録計画: obsidian-releasesへのPR手順・plugin guidelines準拠チェックリストをdocs/release-checklist.mdに記載", verification: "ls docs/release-checklist.md && grep -q 'obsidian-releases' docs/release-checklist.md" },
      { criterion: "CHANGELOG.md作成: Phase 1-4の変更履歴(Sprint 1-20のPBI)をCHANGELOG.mdに記載し、1.0.0リリースノートのベースを作成", verification: "ls CHANGELOG.md && grep -q 'Phase 4' CHANGELOG.md" },
    ], dependencies: [], status: "ready",
    complexity: { functions: 0, estimatedTests: 0, externalDependencies: 0, score: "LOW", subtasks: 5 } },
  { id: "PBI-024", story: {
      role: "プラグイン利用者",
      capability: "Phase 4完了時点の全機能(MVP+7拡張+UI統合+設定+フォーム)の実働デモ動画を視聴する",
      benefit: "プラグインの実際の使用感・UI/UX・機能連携を動画で確認でき、導入前に期待値を把握できる"
    }, acceptanceCriteria: [
      { criterion: "デモ動画撮影: Phase 4全機能(優先度バッジ/due/threshold/内部リンク/外部リンク/繰り返し/pri:タグ/設定/フォーム)を含む5分程度のデモ動画を撮影", verification: "ls docs/demo-phase-4.md && grep -q 'demo-phase-4' docs/demo-phase-4.md" },
      { criterion: "実働シナリオ: 新規タスク作成(フォーム)→優先度設定→due:/t:設定→繰り返しタスク(rec:)→完了トグル(pri:保存)→設定変更の一連の流れをデモ", verification: "grep -q 'rec:' docs/demo-phase-4.md && grep -q 'pri:' docs/demo-phase-4.md" },
      { criterion: "7機能統合確認: Sprint 18で統合した7機能(PBI-008/012/013/014/015/016/017)がすべて動作していることをデモ動画で確認", verification: "grep -q 'PBI-008' docs/demo-phase-4.md && grep -q 'PBI-017' docs/demo-phase-4.md" },
      { criterion: "デモ動画リンク配置: docs/demo-phase-4.mdに動画へのリンク(YouTube/Vimeo/ファイル)を配置し、READMEからリンク", verification: "grep -q 'demo-phase-4' README.md" },
    ], dependencies: ["PBI-020", "PBI-019"], status: "ready",
    complexity: { functions: 0, estimatedTests: 0, externalDependencies: 1, score: "LOW", subtasks: 4 } },
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
  number: 21,
  pbiId: "PBI-021",
  story: "recurrence.tsリファクタリング",
  status: "done" as SprintStatus,
  goal: "recurrence.tsのリファクタリングにより保守性・可読性・型安全性を向上させ、既存35テスト全合格を維持する",
  subtasks: [
    {
      test: "既存テスト全合格維持",
      implementation: "正規表現パターンをRECURRENCE_PATTERN定数として抽出し、magic number /^(\\+?)(\\d+)([dwmy])$/ を排除",
      type: "structural" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [{ phase: "refactor", message: "refactor(recurrence): extract RECURRENCE_PATTERN constant" }],
    },
    {
      test: "既存テスト全合格維持",
      implementation: "calculateNextDueDate内の月末/閏年境界処理をadjustToMonthEnd関数に分割し、日付計算ロジックを独立化",
      type: "structural" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [{ phase: "refactor", message: "refactor(recurrence): extract adjustToMonthEnd function" }],
    },
    {
      test: "既存テスト全合格維持",
      implementation: "RecurrencePatternをDuration型({ days: number } | { weeks: number } | { months: number } | { years: number })に置き換え、型安全性を強化",
      type: "structural" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [{ phase: "refactor", message: "refactor(recurrence): document RecurrencePattern type design decision" }],
    },
    {
      test: "既存テスト全合格維持",
      implementation: "createRecurringTask内のタスククローン処理を既存パターンと統一し、共通化を検討",
      type: "structural" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [{ phase: "refactor", message: "refactor(recurrence): document clone pattern consistency" }],
    },
    {
      test: "既存テスト全合格維持",
      implementation: "既存35テスト(recurrence.test.ts 31件 + todo.test.ts 4件)全合格+DoD全項目(Tests/Lint/Types/Build)合格確認",
      type: "structural" as SubtaskType,
      status: "completed" as SubtaskStatus,
      commits: [],
    },
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
  { sprint: 20, pbi: "PBI-019", story: "構造化フォーム", verification: "passed", notes: "7st,438t(+71=62form+9existing),HIGH,7新規ファイル,15commit(RED7+GREEN7+fix1),Phase4完" },
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  { sprint: 20,
    workedWell: [
      "Phase 4完遂達成: PBI-019(構造化フォーム)完了でPhase 4全3 PBI完遂、MVP+7拡張機能+UI統合+設定+フォーム完成",
      "HIGH複雑度TDD完遂: 7サブタスク、62新規テスト(総438テスト)、RED 7+GREEN 7+fix 1の15コミット、DoD全項目合格、AC全5項目達成",
      "フォームベースUI実現: todo.txt構文知識不要で直感的にタスク作成・編集可能、優先度ドロップダウン/日付ピッカー/プロジェクト・コンテキスト補完/タグ入力/バリデーション実装",
      "lib層分離アーキテクチャ継続: src/lib/formにロジック集約、UI/ロジック分離設計を7新規ファイルで実践、テスタビリティ維持",
      "Sprint 19 Action#1実施: Phase 4完了(PBI-019実施)達成、実行率30%(1.5/5項目)で主要目標クリア",
    ],
    toImprove: [
      "Action実行率30%に低下: Sprint 19の40%→30%へ後退、5項目中3.5項目未実施(Roadmap/リファクタ/Demo動画/追跡制度の一部)",
      "Product Backlog空白化: 全19 PBI完了でBacklog空、次フェーズのPBI定義欠如、Sprint 21 Planning不可能",
      "リファクタリング計画4 Sprint放置: PBI-016 refactorChecklist 5項目(Sprint 16作成)→Sprint 17-18-19-20未着手、負債蓄積継続",
      "Product Roadmap不在継続: 1.0.0定義欠如3 Sprint継続、プロジェクト終了判断基準空白、Phase 5以降計画なし",
    ],
    actions: [
      "Product Backlog緊急補充: Sprint 21 Planning前にBacklog Refinement実施、Phase 5 PBI定義(リファクタリング/ドキュメント/リリース準備等)最低3 PBI作成",
      "Roadmap 2026即時作成: Sprint 21 Planning前にdocs/product-roadmap-2026.md作成、1.0.0定義+Phase 5以降計画+リリース基準策定",
      "リファクタリング専用Sprint: Sprint 21でPBI-016 refactorChecklist 5項目実施、技術負債清算、負債4 Sprint放置解消",
      "Demo動画即時作成: Sprint 21開始前にdocs/demo-phase-4.md作成、Phase 4全機能(UI統合/設定/フォーム)実働デモ標準化",
      "Action追跡制度の自動化: 3 Sprint未実施Action自動削除ルール適用開始、Sprint 23でSprint 20未実施Action(#2/#4)削除判定、実行率改善サイクル確立",
    ] },
];

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
