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
  sprint: { number: null, pbi: null, status: "not_started" as SprintStatus,
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
    ], dependencies: ["PBI-020"], status: "ready",
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
export const currentSprint = null;

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

// Completed Sprints (Phase 1: Sprint 1-7, Phase 2: Sprint 8-12, Phase 3: Sprint 13-17, Phase 4: Sprint 18-19, Phase 5: Sprint 20-22)
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
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  { sprint: 21,
    workedWell: [
      "リファクタリング専用Sprint初実施成功: Sprint 20 Action#3実行、4 Sprint放置技術負債(PBI-016 refactorChecklist)解消、RED/GREENなしのstructural subtasksのみ構成",
      "設計判断の文書化実践: Duration型導入検討→現行設計維持の意思決定、判断根拠をJSDocに記録、'なぜその設計にしなかったか'の文書化によるナレッジ共有実現",
      "Action実行率改善継続: Sprint 20 Action 5項目中2項目完了(#1 Backlog補充4 PBI定義、#3リファクタリング専用Sprint実施)、計画的負債解消実践",
      "保守性・可読性・型安全性向上達成: 正規表現パターン定数化(magic number排除)、日付計算ロジック分割(複雑度削減)、JSDoc設計根拠明示化",
      "既存機能完全保護: 5サブタスク全完了、既存35テスト全合格維持、DoD全項目PASSED(4 refactor+1 verification)、AC全5項目達成、回帰バグゼロ",
    ],
    toImprove: [
      "Action未完了項目の2 Sprint継続: Action#2(Roadmap 2026)、Action#4(Demo動画)がPBI-023/024 ready状態継続、Action#5(追跡自動化)具体的進展なし",
      "リファクタリング専用Sprintの位置づけ不明確: Sprint 21実施したが今後方針未策定、PBI-021以外技術負債(他モジュール)計画なし、refactorChecklist体系的管理不在",
      "Phase 5全体計画の不在: PBI-021完了、次Phase 5タスク(PBI-022/023/024)優先順位未明確化、リリース準備プロセス(ドキュメント/デモ/Roadmap)実施順序未定義",
      "git履歴肥大化懸念: completedSprints配列21要素、retrospectives配列1要素(最新のみ)、過去Retrospectiveはgit履歴参照だがアクセス性低下",
    ],
    actions: [
      "Phase 5優先順位明確化: Sprint 22 Planning前にPBI-022/023/024実施優先順位定義、リリース準備の最適シーケンス策定(ドキュメント→Roadmap→Demo等)",
      "Roadmap 2026完遂(2 Sprint継続): Sprint 22でPBI-023実施、1.0.0定義+Phase 5以降計画+リリース基準策定完了、プロジェクト終了判断基準確立",
      "Demo動画作成完遂(2 Sprint継続): Sprint 22またはSprint 23でPBI-024実施、Phase 4全機能実働デモ標準化、利用者価値提案可視化",
      "技術負債管理プロセス確立: refactorChecklist体系的管理ルール策定、各PBI refactorChecklist項目優先順位判定基準定義、放置期間許容値設定(例: 3 Sprint)",
      "Action追跡自動化ルール適用(Sprint 23判定): Sprint 23でSprint 20未完了Action(#2/#4)3 Sprint経過判定実施、削除/継続意思決定、実行率改善サイクル確立",
    ] },
];

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
