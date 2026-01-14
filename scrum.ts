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
  sprint: { number: 44, pbi: "PBI-044", status: "in_progress" as SprintStatus,
    subtasksCompleted: 0, subtasksTotal: 3, impediments: 0 },
  phase: { number: 10, status: "done", sprints: "43", pbis: "PBI-043", goal: "パーサー堅牢化完了（unified-test-cases.md準拠、740t達成、+114t）" },
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
    status: "done" as PBIStatus,
    complexity: { functions: 2, estimatedTests: 82, externalDependencies: 0, score: "HIGH", subtasks: 6 },
    refactorChecklist: ["パーサー関数の責務分離", "正規表現の最適化", "エラーメッセージの改善"],
    // Implementation Policies (7 items): 完了優先度=保持, 日付=フォーマットのみ, Unicode=許可, 空白=トリム, コメント=非対応, タグコロン=最初分割, エラー=パース継続
  },
  {
    id: "PBI-044",
    story: {
      role: "Obsidianユーザー",
      capability: "設定からtodo.txtとして扱うファイルパスを指定できる",
      benefit: "意図しないファイルがtodo.txtビューで開かれることを防ぎ、明示的に管理対象を制御できる",
    },
    acceptanceCriteria: [
      { criterion: "設定画面でファイルパス（複数可）を入力できるUIが存在する", verification: "pnpm build && 手動確認: 設定タブにファイルパス入力欄が表示される" },
      { criterion: "指定されたパスのファイルのみがtodo.txtビューで開かれる", verification: "pnpm vitest run -- -t 'file path setting'" },
      { criterion: "パスが未指定の場合は従来通り.txt/.todotxt拡張子で判定する", verification: "pnpm vitest run -- -t 'default extension'" },
      { criterion: "存在しないパスを指定した場合にエラーにならない", verification: "pnpm vitest run -- -t 'invalid path'" },
    ],
    dependencies: [],
    status: "ready" as PBIStatus,
    complexity: { functions: 4, estimatedTests: 6, externalDependencies: 0, score: "LOW", subtasks: 3 },
  },
  {
    id: "PBI-045",
    story: {
      role: "todo.txtユーザー",
      capability: "完了したタスクをdone.txtファイルにアーカイブできる",
      benefit: "メインのtodo.txtファイルをスリムに保ちつつ、完了履歴を保持できる",
    },
    acceptanceCriteria: [
      { criterion: "UIに「アーカイブ」ボタンが存在し、クリックで完了タスクをdone.txtに移動する", verification: "pnpm build && 手動確認: アーカイブボタンが機能する" },
      { criterion: "done.txtはtodo.txtと同じディレクトリに作成される", verification: "pnpm vitest run -- -t 'archive same directory'" },
      { criterion: "アーカイブ後、元ファイルから完了タスクが削除される", verification: "pnpm vitest run -- -t 'archive removes completed'" },
      { criterion: "done.txtが既に存在する場合は末尾に追記される", verification: "pnpm vitest run -- -t 'archive append'" },
      { criterion: "完了タスクがない場合はアーカイブボタンが無効化される", verification: "pnpm vitest run -- -t 'archive disabled'" },
    ],
    dependencies: [],
    status: "draft" as PBIStatus,
  },
  {
    id: "PBI-046",
    story: {
      role: "Obsidianユーザー",
      capability: "サイドパネルでtodo.txtタスクの一覧表示と簡易操作ができる",
      benefit: "メインエディタを開かずにタスクを俯瞰・追加できる",
    },
    acceptanceCriteria: [
      { criterion: "サイドパネル（Obsidian Leaf）にタスク一覧が表示される", verification: "pnpm build && 手動確認: サイドパネルにタスク一覧が表示される" },
      { criterion: "タスク追加ボタンがあり、クリックで新規タスクを追加できる", verification: "pnpm build && 手動確認: 追加ボタンでタスクが追加される" },
      { criterion: "サイドパネルのタスクをクリックすると該当todo.txtが開く", verification: "pnpm build && 手動確認: タスククリックでファイルが開く" },
      { criterion: "AI用タスク追加ボタンがサイドパネルに表示される", verification: "pnpm build && 手動確認: AIボタンがサイドパネルに存在する" },
      { criterion: "AI用タスク追加ボタンがtodo.txtメインビューにも表示される", verification: "pnpm build && 手動確認: AIボタンがメインビューに存在する" },
    ],
    dependencies: [],
    status: "draft" as PBIStatus,
  },
  {
    id: "PBI-047",
    story: {
      role: "todo.txtユーザー",
      capability: "自然言語でタスクを説明するとtodo.txt形式に変換して追加できる",
      benefit: "形式を覚えなくても自然な文章でタスクを追加できる",
    },
    acceptanceCriteria: [
      { criterion: "AI追加ボタンクリックで自然言語入力ダイアログが開く", verification: "pnpm build && 手動確認: ダイアログが開く" },
      { criterion: "入力された自然言語がtodo.txt形式に変換される（プロジェクト/コンテキスト/優先度/期限を自動抽出）", verification: "pnpm vitest run -- -t 'natural language to todotxt'" },
      { criterion: "変換結果をプレビュー表示し、編集・確認できる", verification: "pnpm build && 手動確認: プレビューが編集可能" },
      { criterion: "確認後にタスクがtodo.txtに追加される", verification: "pnpm build && 手動確認: タスクが追加される" },
      { criterion: "複数タスクを一括で変換・追加できる（改行/箇条書き区切り）", verification: "pnpm vitest run -- -t 'multiple tasks'" },
      { criterion: "OpenRouterのAPIキー・モデル設定が可能", verification: "pnpm build && 手動確認: 設定画面にOpenRouter設定がある" },
      { criterion: "カスタムコンテキストマッピングが設定可能", verification: "pnpm vitest run -- -t 'custom context'" },
      { criterion: "APIエラー時に設定に従い自動リトライする", verification: "pnpm vitest run -- -t 'retry'" },
    ],
    dependencies: ["PBI-046"],
    status: "draft" as PBIStatus,
    // Design: docs/design/PBI-047-design.md (based on todonoeai specification)
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
  sprint: 44,
  pbi: "PBI-044",
  goal: "設定ベースのファイルパス管理を実現し、ユーザーが明示的にtodo.txt管理対象を制御できる",
  status: "in_progress" as SprintStatus,
  subtasks: [
    {
      test: "settings.tsにtodotxtFilePathsプロパティのテストを記述、デフォルト空配列を検証",
      implementation: "TodotxtPluginSettingsインターフェースにtodotxtFilePaths: string[]を追加、DEFAULT_SETTINGSに空配列を設定",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
    {
      test: "指定パスマッチング・デフォルト拡張子判定・存在しないパス処理のテストを記述（3テストケース）",
      implementation: "ファイルパスが設定配列に含まれるか判定する関数を実装、未指定時は.txt/.todotxt拡張子で判定",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
    {
      test: "設定画面でファイルパス入力欄が存在するテストを記述（UI要素検証）",
      implementation: "SettingTab.tsにテキストエリア追加、複数パス入力（改行区切り）をサポート、保存/読み込み処理実装",
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

// Completed Sprints - Phase 1-9 compacted, see git history for details
export const completedSprints: CompletedSprint[] = [
  // Phase 1-7 (Sprint 1-34): 基本機能+ドキュメント+UI実装完了、554t達成
  // Phase 8 (Sprint 35-39): フォームUI強化完了、626t達成(+72t)
  // Phase 9 (Sprint 40-42): UIデザイン刷新完了（Apple-likeモダンデザイン）、626t維持
  // Phase 10 (Sprint 43): パーサー堅牢化完了（unified-test-cases.md準拠）、740t達成(+114t)
  { sprint: 43, pbi: "PBI-043", story: "パーサー堅牢化（エッジケース対応）", verification: "passed", notes: "740t(+114t),70エッジケーステスト追加,プロジェクト/コンテキスト前スペース必須化,タグ最初コロン分割対応,Phase 10完遂" },
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  // Sprint 42: Phase 9完遂、REFACTOR率50%達成、CSS 214→513行 - see git history
  { sprint: 43,
    workedWell: [
      "TDD厳守: 626t→740t(+114t,18%増)、70エッジケーステスト追加",
      "RED-GREEN-REFACTORサイクル徹底: プロジェクト/コンテキスト前スペース必須化・タグ最初コロン分割の2件修正",
      "unified-test-cases.md完全準拠: 82件見積→70件実装（既存テストで基本パターンカバー済）",
      "実装ポリシー7項目明文化（implementationPolicies）",
      "Phase 10完遂: パーサー堅牢化を1 Sprintで達成",
    ],
    toImprove: [
      "Subtask 1/2でRED失敗せず（既存実装が正確）",
      "見積もり乖離（82→70件）、既存テスト重複分析不足",
      "REFACTORフェーズ不実施（改善機会損失）",
      "Sprint 42 Action未消化（5件残存）",
    ],
    actions: [
      "テスト記述テンプレート導入",
      "既存テストとの差分分析プロセス確立",
      "REFACTORチェックリスト策定",
      "Phase 11方向性決定（技術的負債/新機能/パフォーマンス）",
      "Sprint 42 Action残件優先順位付け",
    ] },
];

// Action Management (Sprint 43完了、rate 50% at KPI min)
export const actionManagement = {
  kpi: { min: 50, healthy: 70, excellent: 90 },
  tracking: { total: 64, executed: 32, rate: 50, remaining: 32 },
};

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
