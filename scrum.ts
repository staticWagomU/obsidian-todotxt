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
  sprint: { number: 25, pbi: "PBI-025", status: "in_progress" as SprintStatus,
    subtasksCompleted: 0, subtasksTotal: 5, impediments: 0 },
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
  // Phase 5: COMPLETE (Sprint 21-24) - リリース準備完了、see completedSprints for summary
  { id: "PBI-022", story: { role: "user", capability: "READMEドキュメント", benefit: "機能理解" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-023", story: { role: "dev", capability: "Roadmap定義", benefit: "方向性明確化" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  { id: "PBI-024", story: { role: "user", capability: "デモシナリオ", benefit: "使い方理解" }, acceptanceCriteria: [], dependencies: [], status: "done" },
  // Phase 6: UI実装 (ready)
  { id: "PBI-025", story: {
      role: "プラグイン利用者",
      capability: "todo.txtファイルを開いたときにタスクリストがビューに表示される",
      benefit: "ファイル内容を視覚的に確認でき、タスク管理を開始できる"
    }, acceptanceCriteria: [
      { criterion: "基本描画: setViewData()でthis.contentElにタスクリストをHTML要素として描画する", verification: "grep -q 'contentEl' src/view.ts && pnpm build" },
      { criterion: "タスク表示: parseTodoTxt()でパースした各タスクのdescriptionがリスト形式で表示される", verification: "grep -q 'parseTodoTxt' src/view.ts && grep -q 'description' src/view.ts" },
      { criterion: "完了状態: 完了タスク(x )にはチェックマークまたは取り消し線で視覚的区別がある", verification: "grep -q 'completed' src/view.ts" },
      { criterion: "空ファイル対応: 空のtodo.txtを開いても例外が発生せず、空のリストが表示される", verification: "pnpm vitest run src/view.test.ts" },
      { criterion: "再描画: setViewData()が呼ばれるたびにcontentElがクリア・再描画され、最新状態が反映される", verification: "grep -q 'empty\\|clear' src/view.ts" },
    ], dependencies: [], status: "ready",
    complexity: { functions: 2, estimatedTests: 5, externalDependencies: 0, score: "MEDIUM", subtasks: 5 } },
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
  sprint: 25,
  pbi: "PBI-025",
  goal: "todo.txtファイルを開いたときにタスクリストがビューに表示される基本UI描画を実現する",
  status: "in_progress" as SprintStatus,
  subtasks: [
    {
      test: "空のtodo.txtファイル読み込み時、contentElが空のリスト要素を描画し、例外が発生しないことをテストする",
      implementation: "setViewData()でthis.contentElをempty()でクリアし、空配列に対してcreateEl()でulタグを生成する",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
    {
      test: "1行のタスク「Buy milk」を含むファイル読み込み時、contentElにliタグで「Buy milk」が表示されることをテストする",
      implementation: "parseTodoTxt()で取得したtodos配列をループし、各todo.descriptionをcreateEl('li')で描画する",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
    {
      test: "完了タスク「x Buy milk」読み込み時、liタグにtext-decorationスタイル（取り消し線）が適用されることをテストする",
      implementation: "todo.completedフラグをチェックし、true時にliタグにclass='completed'を追加、CSSで.completed{text-decoration:line-through}を定義する",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
    {
      test: "複数タスク含むファイル読み込み時、setViewData()を2回呼び出しても古いliタグが残らず最新のタスクリストのみ表示されることをテストする",
      implementation: "setViewData()の最初でthis.contentEl.empty()を呼び出し、既存のDOM要素をクリアしてから再描画する",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
    {
      test: "優先度付きタスク「(A) Buy milk」読み込み時、liタグに優先度バッジspan要素が表示されることをテストする",
      implementation: "todo.priorityが存在する場合、createEl('span')で優先度バッジを生成しliタグに追加する（class='priority priority-{A-Z}'）",
      type: "behavioral" as SubtaskType,
      status: "pending" as SubtaskStatus,
      commits: [],
    },
  ],
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

// Completed Sprints (Phase 1: Sprint 1-7, Phase 2: Sprint 8-12, Phase 3: Sprint 13-17, Phase 4: Sprint 18-19, Phase 5: Sprint 20-24)
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
  { sprint: 24, pbi: "PBI-024", story: "Phase 4デモシナリオ", verification: "passed", notes: "4st,438t(+0),LOW,4structural(demo-phase-4/scenario/7features/README)" },
];

// Retrospectives (最新のみ保持、過去はgit履歴参照)
export const retrospectives: Retrospective[] = [
  { sprint: 24,
    workedWell: [
      "Phase 5完遂達成: Sprint 21-24（4連続Sprint）でPhase 5全PBI完了、PBI-021リファクタ→PBI-023 Roadmap→PBI-022 README→PBI-024デモシナリオ、リリース準備基盤確立、1.0.0到達条件整備完了",
      "Refinementスコープ変更判断成功: PBI-024当初「デモ動画撮影」→AI実行不可判明→「デモシナリオドキュメント」変更、externalDependencies（録画ツール/編集スキル）リスク回避、Definition of Ready違反防止、適切な範囲定義実現",
      "デモシナリオドキュメント高品質: docs/demo-phase-4.md（473行）、実働シナリオ（8ステップ詳細手順）+7機能統合説明+期待動作検証、Phase 4全機能網羅（PBI-008/012/013/014/015/016/017/018/019）、利用者視点の機能理解促進",
      "4連続structural subtasks成功: Sprint 21-24全てTDDサイクルなし、テスト数438維持（4 Sprint連続）、ドキュメント専用Sprint効率化パターン確立、behavioral/structural subtask分離設計成功",
      "README統合完遂: demo-phase-4.mdリンク追加、価値提案+主要機能7つ+インストール+デモシナリオの完全体系、利用者が機能理解→導入→実践の一連フロー実現、コミュニティプラグイン登録準備完了",
    ],
    toImprove: [
      "Sprint 23 Action#2未実行: Action追跡自動化ルール実行結果反映未実施、Sprint 20/21/22完了Action削除処理なし、retrospectives肥大化防止ルール未適用、Action追跡メンテナンス継続課題",
      "CHANGELOG更新ルール未適用: Sprint 23 Action#4定義（Sprint完了時Unreleased更新）、Sprint 24で適用せず、Phase 5完遂の重要マイルストーンがCHANGELOG未反映、リリースノート品質低下リスク",
      "1.0.0リリース最終チェック未実施: Release Criteria 4項目（README✅/CHANGELOG✅/DoD✅/manifest.json✅）の最終検証なし、Sprint 23 Action#5（1.0.0リリース最終準備確認）未実行、リリース判定基準達成確認必要",
      "次Sprint不明確: Phase 5完遂後の方向性未定義、PBI-025以降のBacklog refinement未実施、1.0.0リリース実施タイミング不明、Phase 6計画なし、Sprint 25目標設定必要",
      "completedSprints肥大化継続: Sprint 24追加で24要素、4 Sprint連続改善なし（Sprint 21-24）、git履歴参照ルール形骸化、アクセス性改善なし、構造的課題放置",
    ],
    actions: [
      "1.0.0リリース最終検証実施: Release Criteria 4項目全確認（README✅/CHANGELOG✅検証、DoD常時✅確認、manifest.json最終チェック）、Phase 5完遂をCHANGELOG Unreleased反映、リリース判定会議開催",
      "Phase 6計画策定: Product Roadmap 2026のv1.1.0機能（カレンダービュー/タグオートコンプリート/一括編集）優先順位決定、PBI-025以降Backlog refinement、1.0.0リリース後の開発方針明確化",
      "Action追跡自動化実行: Sprint 20/21/22完了Action削除、Sprint 23 Action#1（PBI-024完了）削除、Sprint 23 Action#4（CHANGELOG更新）継続、retrospectives肥大化防止ルール適用開始",
      "CHANGELOG Unreleased更新: Phase 5完遂（PBI-021/022/023/024）をUnreleasedセクション記載、Sprint 21-24ドキュメント整備内容追加、v1.0.0リリース準備完了マーク、Sprint Review時更新ルール再定義",
      "Sprint 25 Planning準備: 1.0.0リリース実施 or Phase 6開始判断、manifest.json最終調整（PBI-025相当）必要性確認、コミュニティプラグイン登録準備チェックリスト実行、次Sprint目標明確化",
    ] },
];

// Agents & Events
export const agents = { productOwner: "@scrum-team-product-owner", scrumMaster: "@scrum-team-scrum-master", developer: "@scrum-team-developer" };
export const events = { planning: "@scrum-event-sprint-planning", review: "@scrum-event-sprint-review", retrospective: "@scrum-event-sprint-retrospective", refinement: "@scrum-event-backlog-refinement" };
