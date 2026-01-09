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
  sprint: { number: 0, pbi: "", status: "not_started" as SprintStatus,
    subtasksCompleted: 0, subtasksTotal: 0, impediments: 0 },
};

// Product Goal
export const productGoal = {
  statement: "Obsidian内でtodo.txt形式のファイルを直感的に管理・表示する",
  owner: "@scrum-team-product-owner",
};

// Product Backlog (Order = Priority) - done PBIs compacted, see git history for details
export const productBacklog: ProductBacklogItem[] = [
  // Phase 1-4: COMPLETE (Sprint 1-20) - 20 PBIs done, see completedSprints for summary
  { id: "PBI-001", story: { role: "user", capability: ".txt/.todotxt専用ビュー", benefit: "適切UI表示" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-002", story: { role: "user", capability: "todo.txtパース", benefit: "構造化リスト" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-003", story: { role: "user", capability: "完了切替", benefit: "ワンクリック更新" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-004", story: { role: "user", capability: "新規作成", benefit: "簡単追加" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-005", story: { role: "user", capability: "編集", benefit: "内容修正" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-006", story: { role: "user", capability: "削除", benefit: "除去" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-007", story: { role: "user", capability: "ソート", benefit: "優先度順" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-008", story: { role: "user", capability: "優先度バッジ", benefit: "視覚識別" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-009", story: { role: "user", capability: "優先度フィルタ", benefit: "絞込" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-010", story: { role: "user", capability: "テキスト検索", benefit: "キーワード絞込" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-011", story: { role: "user", capability: "グループ化", benefit: "まとめ表示" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-012", story: { role: "user", capability: "due:表示", benefit: "期限確認" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-013", story: { role: "user", capability: "t:表示", benefit: "着手時期識別" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-014", story: { role: "user", capability: "[[Note]]リンク", benefit: "関連ノート把握" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-015", story: { role: "user", capability: "[text](url)リンク", benefit: "外部リソース把握" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-016", story: { role: "user", capability: "rec:繰り返し", benefit: "自動生成" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-017", story: { role: "user", capability: "pri:タグ保存", benefit: "優先度維持" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-018", story: { role: "user", capability: "設定画面", benefit: "カスタマイズ" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-019", story: { role: "user", capability: "フォーム入力", benefit: "構文不要" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-020", story: { role: "user", capability: "UI統合", benefit: "実働確認" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-021", story: { role: "dev", capability: "recurrence.tsリファクタ", benefit: "保守性向上" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  // Phase 5: リリース準備 (ready)
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
    ], dependencies: ["PBI-020"], status: "done",
    complexity: { functions: 0, estimatedTests: 0, externalDependencies: 0, score: "LOW", subtasks: 5 } },
  { id: "PBI-023", story: { role: "プロジェクト運営者", capability: "Product Roadmap 2026とリリース基準定義", benefit: "プロジェクトの方向性・優先順位・リリース判断明確化" }, acceptanceCriteria: [], dependencies: [], status: "done" },
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
  sprint: 0,
  pbi: "",
  goal: "",
  status: "not_started" as SprintStatus,
  subtasks: [],
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

// Completed Sprints (Phase 1: Sprint 1-7, Phase 2: Sprint 8-12, Phase 3: Sprint 13-17, Phase 4: Sprint 18-19, Phase 5: Sprint 20-23)
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
  { sprint: 21, pbi: "PBI-021", story: "recurrence.tsリファクタリング", verification: "passed", notes: "5st,438t(+0),MEDIUM,4refactor,1verification" },
  { sprint: 22, pbi: "PBI-023", story: "Product Roadmap 2026とリリース基準定義", verification: "passed", notes: "5st,438t(+0),LOW,3docs(roadmap/checklist/CHANGELOG),5structural" },
  { sprint: 23, pbi: "PBI-022", story: "READMEとドキュメント整備", verification: "passed", notes: "5st,438t(+0),LOW,5structural(README/user-guide/images/manifest/package)" },
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  { sprint: 22,
    workedWell: [
      "ドキュメント専用Sprint成功: 初のstructural subtasksのみSprint、TDDサイクルなし（テスト数438維持）、3重要ドキュメント作成（product-roadmap-2026.md/release-checklist.md/CHANGELOG.md）、Phase 5リリース準備明確化",
      "Sprint 21 Action#2完遂（2 Sprint継続項目）: Roadmap 2026完成、1.0.0機能スコープ定義、Phase 5-6計画策定（Sprint 21-30）、Phase 7-8 Post-1.0.0 Vision明示、Release Criteria 4項目確立",
      "リリース準備基盤確立: Release Checklist体系化（8セクション245チェック項目）、obsidian-releases PR手順文書化、Hotfixプロセス定義（v1.0.1緊急対応）、コミュニティプラグイン登録準備完了",
      "CHANGELOG標準化達成: Keep a Changelog形式採用、Phase 1-4変更履歴構造化（機能/技術改善/ドキュメント分類）、Sprint履歴との相互参照可能性確保、開発履歴の可視化実現",
      "プロジェクト終了判断基準明確化: Success Metrics定義（テストカバレッジ80%/ダウンロード100+/Stars 10+）、Risk Management体系化（技術/プロセスリスク）、Timeline明示（2026 Q1-Q4）、1.0.0リリース判断可能",
    ],
    toImprove: [
      "Phase 5残りPBI優先順位未決定: PBI-022（README整備）とPBI-024（デモ動画）ready状態継続、Sprint 21 Action#1（Phase 5優先順位明確化）部分完了のみ、Roadmap策定したが次Sprint選択基準未定",
      "PBI-022/PBI-024 Complexity精度: PBI-022 subtasks=5だがstructural（関数0/テスト0）、PBI-024 subtasks=4だがexternalDependencies=1（録画ツール）、ドキュメント/デモPBIのsubtasks設計最適化余地",
      "Action追跡自動化ルール未適用: Sprint 21 Action#5（Sprint 23判定予定）継続中、Sprint 20 Action#2/4が3 Sprint放置基準（Sprint 23時点）判定待ち、自動化ルール実行タイミング明確化必要",
      "CHANGELOG Unreleased管理不在: v1.0.0セクション存在するがUnreleased活用なし、Sprint単位の変更をUnreleasedに蓄積→リリース時v1.0.0へ移動フローなし、継続的CHANGELOG更新プロセス未定義",
      "completedSprints肥大化継続: Sprint 22追加で22要素（Sprint 21 Retro指摘継続）、git履歴参照ルール存在するがアクセス性改善なし",
    ],
    actions: [
      "Sprint 23 Planning前にPBI-022/024優先順位決定: リリース準備シーケンス最適化（README→Demo or Demo→README）、PBI-022（README 5 subtasks）とPBI-024（Demo 4 subtasks+録画）コスト比較、Phase 5完了条件（Release Criteria 4項目）達成への最短経路選択",
      "ドキュメントPBI subtasks設計基準策定: structural subtasksのスコープ定義（目安: 1 subtask=1ドキュメントセクション）、externalDependencies考慮（録画ツール/画像編集等）、Complexity scoreとsubtasks数の整合性検証ルール",
      "Action追跡自動化ルール実行（Sprint 23）: Sprint 20 Action#2（Roadmap）→Sprint 22完了（削除）、Sprint 20 Action#4（Demo動画）→Sprint 23判定（3 Sprint経過判定）、Sprint 21 Action全5項目→Sprint 23-24時点で3 Sprint基準適用",
      "CHANGELOG継続更新プロセス定義: Sprint完了時にUnreleasedセクション更新（AC達成内容記録）、Sprint Review時にCHANGELOG更新をDoD項目追加検討、v1.0.0リリース時にUnreleased→v1.0.0セクション移動",
      "PBI-025（manifest最終調整）subtask追加検討: Roadmap記載のPBI-025（manifest.json/versions.json）はBacklog未定義、Sprint 23-24でPBI-025 refinement実施、Release Criteria達成への明示的PBI追加",
    ] },
];

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
