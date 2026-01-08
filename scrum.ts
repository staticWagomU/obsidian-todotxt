/**
 * AI-Agentic Scrum Dashboard
 *
 * This file is the single source of truth for all Scrum artifacts.
 * All agents read from and write to this file.
 *
 * Rules:
 * 1. Git as History: No timestamps. Git tracks when changes were made.
 * 2. Order is Priority: Items higher in arrays have higher priority.
 * 3. 1 Sprint = 1 PBI: Each Sprint delivers exactly one Product Backlog Item.
 */

// =============================================================================
// Type Definitions
// =============================================================================

type PBIStatus = "draft" | "refining" | "ready";
type SprintStatus = "not_started" | "in_progress" | "done" | "blocked";
type SubtaskStatus = "pending" | "red" | "green" | "refactoring" | "completed";
type SubtaskType = "behavioral" | "structural";
type CommitPhase = "red" | "green" | "refactor";
type ImpedimentSeverity = "low" | "medium" | "high" | "critical";
type ImpedimentStatus = "new" | "investigating" | "escalated" | "resolved";

interface AcceptanceCriterion {
  criterion: string;
  verification: string;
}

interface UserStory {
  role: string;
  capability: string;
  benefit: string;
}

interface ProductBacklogItem {
  id: string;
  story: UserStory;
  acceptanceCriteria: AcceptanceCriterion[];
  dependencies: string[];
  status: PBIStatus;
}

interface Commit {
  phase: CommitPhase;
  message: string;
}

interface Subtask {
  test: string;
  implementation: string;
  type: SubtaskType;
  status: SubtaskStatus;
  commits: Commit[];
}

interface Impediment {
  id: string;
  reporter: string;
  description: string;
  impact: string;
  severity: ImpedimentSeverity;
  affectedItems: string[];
  resolutionAttempts: { attempt: string; result: string }[];
  status: ImpedimentStatus;
  escalatedTo: string | null;
  resolution: string | null;
}

interface CompletedSprint {
  sprint: number;
  pbi: string;
  story: string;
  verification: "passed" | "failed";
  notes: string;
}

interface Retrospective {
  sprint: number;
  workedWell: string[];
  toImprove: string[];
  actions: string[];
}

interface SuccessMetric {
  metric: string;
  target: string;
}

interface DoDCheck {
  name: string;
  run: string;
}

// =============================================================================
// Quick Status
// =============================================================================

export const quickStatus = {
  sprint: {
    number: 0,
    pbi: null as string | null,
    status: "not_started" as SprintStatus,
    subtasksCompleted: 0,
    subtasksTotal: 0,
    impediments: 0,
  },
};

// =============================================================================
// 1. Product Backlog
// =============================================================================

export const productGoal = {
  statement:
    "Obsidian内でtodo.txt形式のファイルを直感的に管理・表示し、プレーンテキストの利点を活かしたタスク管理体験を提供する",
  successMetrics: [
    { metric: "Phase 1〜3の全必須機能が実装完了", target: "100%" },
    { metric: "todo.txt公式フォーマット仕様への準拠度", target: "100%" },
    { metric: "タスク操作のレスポンス時間", target: "200ms以下" },
    { metric: "パーサーのテストカバレッジ", target: "90%以上" },
  ] as SuccessMetric[],
  owner: "@scrum-team-product-owner",
};

export const productBacklog: ProductBacklogItem[] = [
  // ==========================================================================
  // Phase 1: MVP（最小限の実用製品）
  // ==========================================================================
  {
    id: "PBI-001",
    story: {
      role: "Obsidianユーザー",
      capability: ".txt/.todotxtファイルを専用ビューで開く",
      benefit: "todo.txt形式のファイルを認識し、適切なUIで表示できる",
    },
    acceptanceCriteria: [
      {
        criterion: ".txt拡張子のファイルを専用ビューで開ける",
        verification: "pnpm vitest run --grep 'txt extension'",
      },
      {
        criterion: ".todotxt拡張子のファイルを専用ビューで開ける",
        verification: "pnpm vitest run --grep 'todotxt extension'",
      },
      {
        criterion: "TextFileViewを継承したカスタムビューが登録される",
        verification: "pnpm vitest run --grep 'TextFileView'",
      },
    ],
    dependencies: [],
    status: "ready",
  },
  {
    id: "PBI-002",
    story: {
      role: "Obsidianユーザー",
      capability: "todo.txt形式のファイルをパースしてタスク一覧として表示する",
      benefit: "テキストファイルの内容を構造化されたリストで確認できる",
    },
    acceptanceCriteria: [
      {
        criterion: "完了マーク(x)をパースできる",
        verification: "npx vitest run --grep 'parse completion'",
      },
      {
        criterion: "優先度(A-Z)をパースできる",
        verification: "npx vitest run --grep 'parse priority'",
      },
      {
        criterion: "作成日・完了日をパースできる",
        verification: "npx vitest run --grep 'parse date'",
      },
      {
        criterion: "プロジェクト(+project)をパースできる",
        verification: "npx vitest run --grep 'parse project'",
      },
      {
        criterion: "コンテキスト(@context)をパースできる",
        verification: "npx vitest run --grep 'parse context'",
      },
      {
        criterion: "タグ(key:value)をパースできる",
        verification: "npx vitest run --grep 'parse tag'",
      },
    ],
    dependencies: ["PBI-001"],
    status: "draft",
  },
  {
    id: "PBI-003",
    story: {
      role: "Obsidianユーザー",
      capability: "タスクの完了/未完了をチェックボックスで切り替える",
      benefit: "ワンクリックでタスクの状態を更新できる",
    },
    acceptanceCriteria: [
      {
        criterion: "未完了タスクのチェックボックスをクリックすると完了になる",
        verification: "npx vitest run --grep 'toggle completion'",
      },
      {
        criterion: "完了時に完了日が自動で付与される",
        verification: "npx vitest run --grep 'completion date auto'",
      },
      {
        criterion: "完了タスクのチェックを外すと未完了に戻る",
        verification: "npx vitest run --grep 'toggle uncomplete'",
      },
      {
        criterion: "変更がファイルに保存される",
        verification: "npx vitest run --grep 'save on toggle'",
      },
    ],
    dependencies: ["PBI-002"],
    status: "draft",
  },
  {
    id: "PBI-004",
    story: {
      role: "Obsidianユーザー",
      capability: "新規タスクを作成する",
      benefit: "新しいタスクを簡単に追加できる",
    },
    acceptanceCriteria: [
      {
        criterion: "追加ボタンで新規タスク作成ダイアログが開く",
        verification: "npx vitest run --grep 'open create dialog'",
      },
      {
        criterion: "作成日が自動で付与される",
        verification: "npx vitest run --grep 'create date auto'",
      },
      {
        criterion: "タスクがファイルに追加される",
        verification: "npx vitest run --grep 'append task to file'",
      },
    ],
    dependencies: ["PBI-002"],
    status: "draft",
  },
  {
    id: "PBI-005",
    story: {
      role: "Obsidianユーザー",
      capability: "既存タスクを編集する",
      benefit: "タスクの内容を修正できる",
    },
    acceptanceCriteria: [
      {
        criterion: "タスク行クリックで編集ダイアログが開く",
        verification: "npx vitest run --grep 'open edit dialog'",
      },
      {
        criterion: "編集内容がファイルに保存される",
        verification: "npx vitest run --grep 'save edited task'",
      },
      {
        criterion: "元のタスク行が更新される",
        verification: "npx vitest run --grep 'update task line'",
      },
    ],
    dependencies: ["PBI-002"],
    status: "draft",
  },
  {
    id: "PBI-006",
    story: {
      role: "Obsidianユーザー",
      capability: "タスクを削除する",
      benefit: "不要なタスクを取り除ける",
    },
    acceptanceCriteria: [
      {
        criterion: "削除ボタンで確認ダイアログが表示される",
        verification: "npx vitest run --grep 'delete confirmation'",
      },
      {
        criterion: "確認後にタスクがファイルから削除される",
        verification: "npx vitest run --grep 'remove task from file'",
      },
    ],
    dependencies: ["PBI-002"],
    status: "draft",
  },
  {
    id: "PBI-007",
    story: {
      role: "Obsidianユーザー",
      capability: "タスクを適切な順序でソートして表示する",
      benefit: "未完了タスクが先頭に、優先度順で整理された一覧を見られる",
    },
    acceptanceCriteria: [
      {
        criterion: "未完了タスクが完了タスクより上に表示される",
        verification: "npx vitest run --grep 'sort incomplete first'",
      },
      {
        criterion: "優先度(A)が優先度(B)より上に表示される",
        verification: "npx vitest run --grep 'sort by priority'",
      },
      {
        criterion: "同じ優先度内はテキスト順でソートされる",
        verification: "npx vitest run --grep 'sort by text'",
      },
    ],
    dependencies: ["PBI-002"],
    status: "draft",
  },

  // ==========================================================================
  // Phase 2: フィルタリング & UI改善
  // ==========================================================================
  {
    id: "PBI-008",
    story: {
      role: "Obsidianユーザー",
      capability: "優先度に応じた色分けバッジでタスクを表示する",
      benefit: "重要なタスクを視覚的に識別できる",
    },
    acceptanceCriteria: [
      {
        criterion: "優先度(A)が赤色で表示される",
        verification: "npx vitest run --grep 'priority A style'",
      },
      {
        criterion: "優先度(B)がオレンジ色で表示される",
        verification: "npx vitest run --grep 'priority B style'",
      },
      {
        criterion: "優先度(C)が黄色で表示される",
        verification: "npx vitest run --grep 'priority C style'",
      },
    ],
    dependencies: ["PBI-002"],
    status: "draft",
  },
  {
    id: "PBI-009",
    story: {
      role: "Obsidianユーザー",
      capability: "優先度でタスクをフィルタリングする",
      benefit: "特定の優先度以上のタスクだけを表示できる",
    },
    acceptanceCriteria: [
      {
        criterion: "優先度フィルタドロップダウンが表示される",
        verification: "npx vitest run --grep 'priority filter dropdown'",
      },
      {
        criterion: "選択した優先度以上のタスクのみ表示される",
        verification: "npx vitest run --grep 'filter by priority'",
      },
    ],
    dependencies: ["PBI-007"],
    status: "draft",
  },
  {
    id: "PBI-010",
    story: {
      role: "Obsidianユーザー",
      capability: "テキスト検索でタスクを絞り込む",
      benefit: "特定のキーワードを含むタスクを素早く見つけられる",
    },
    acceptanceCriteria: [
      {
        criterion: "検索ボックスが表示される",
        verification: "npx vitest run --grep 'search box'",
      },
      {
        criterion: "入力テキストを含むタスクのみ表示される",
        verification: "npx vitest run --grep 'filter by search'",
      },
    ],
    dependencies: ["PBI-007"],
    status: "draft",
  },
  {
    id: "PBI-011",
    story: {
      role: "Obsidianユーザー",
      capability: "プロジェクトまたはコンテキストでタスクをグループ化する",
      benefit: "関連するタスクをまとめて確認できる",
    },
    acceptanceCriteria: [
      {
        criterion: "グループ方式選択ドロップダウンが表示される",
        verification: "npx vitest run --grep 'grouping dropdown'",
      },
      {
        criterion: "プロジェクトでグループ化できる",
        verification: "npx vitest run --grep 'group by project'",
      },
      {
        criterion: "コンテキストでグループ化できる",
        verification: "npx vitest run --grep 'group by context'",
      },
      {
        criterion: "タグなしタスクはデフォルトグループに表示される",
        verification: "npx vitest run --grep 'default group'",
      },
    ],
    dependencies: ["PBI-007"],
    status: "draft",
  },
  {
    id: "PBI-012",
    story: {
      role: "Obsidianユーザー",
      capability: "期限(due:)タグを視覚的に表示する",
      benefit: "タスクの期限を一目で確認できる",
    },
    acceptanceCriteria: [
      {
        criterion: "due:タグの日付がタスク行に表示される",
        verification: "npx vitest run --grep 'display due date'",
      },
      {
        criterion: "過去の期限は赤色でハイライトされる",
        verification: "npx vitest run --grep 'overdue highlight'",
      },
      {
        criterion: "間近の期限（3日以内）はオレンジでハイライトされる",
        verification: "npx vitest run --grep 'upcoming highlight'",
      },
    ],
    dependencies: ["PBI-002"],
    status: "draft",
  },

  // ==========================================================================
  // Phase 3: 拡張機能 + 設定
  // ==========================================================================
  {
    id: "PBI-013",
    story: {
      role: "Obsidianユーザー",
      capability: "しきい値日(t:)以前のタスクをグレーアウトする",
      benefit: "まだ着手すべきでないタスクを視覚的に区別できる",
    },
    acceptanceCriteria: [
      {
        criterion: "t:タグが今日以降のタスクはグレーアウトされる",
        verification: "npx vitest run --grep 'threshold grayout'",
      },
      {
        criterion: "t:タグが今日より前のタスクは通常表示される",
        verification: "npx vitest run --grep 'threshold normal'",
      },
    ],
    dependencies: ["PBI-002"],
    status: "draft",
  },
  {
    id: "PBI-014",
    story: {
      role: "Obsidianユーザー",
      capability: "Obsidian内部リンク([[Note]])をクリックして遷移する",
      benefit: "関連するノートに素早くアクセスできる",
    },
    acceptanceCriteria: [
      {
        criterion: "[[Note]]形式がリンクとしてパースされる",
        verification: "npx vitest run --grep 'parse internal link'",
      },
      {
        criterion: "リンクをクリックするとノートが開く",
        verification: "npx vitest run --grep 'internal link navigation'",
      },
    ],
    dependencies: ["PBI-002"],
    status: "draft",
  },
  {
    id: "PBI-015",
    story: {
      role: "Obsidianユーザー",
      capability: "外部リンク([text](url))をクリックしてブラウザで開く",
      benefit: "関連するWebページにアクセスできる",
    },
    acceptanceCriteria: [
      {
        criterion: "[text](url)形式がリンクとしてパースされる",
        verification: "npx vitest run --grep 'parse external link'",
      },
      {
        criterion: "リンクをクリックするとブラウザが開く",
        verification: "npx vitest run --grep 'external link navigation'",
      },
    ],
    dependencies: ["PBI-002"],
    status: "draft",
  },
  {
    id: "PBI-016",
    story: {
      role: "Obsidianユーザー",
      capability:
        "繰り返しタスク(rec:)を完了すると次のタスクが自動生成される",
      benefit: "定期的なタスクを手動で再作成する手間が省ける",
    },
    acceptanceCriteria: [
      {
        criterion: "rec:+7dで完了日から7日後の期限でタスクが生成される",
        verification: "npx vitest run --grep 'recurrence from completion'",
      },
      {
        criterion: "rec:7dで期限から7日後の期限でタスクが生成される",
        verification: "npx vitest run --grep 'recurrence from due'",
      },
      {
        criterion: "生成されたタスクがファイルに追加される",
        verification: "npx vitest run --grep 'append recurring task'",
      },
    ],
    dependencies: ["PBI-003"],
    status: "draft",
  },
  {
    id: "PBI-017",
    story: {
      role: "Obsidianユーザー",
      capability: "完了時に優先度をpri:タグで保存する",
      benefit: "繰り返しタスクや復元時に元の優先度を参照できる",
    },
    acceptanceCriteria: [
      {
        criterion: "優先度付きタスク完了時にpri:タグが付与される",
        verification: "npx vitest run --grep 'save priority on complete'",
      },
      {
        criterion: "元の(A)が削除されpri:Aが追加される",
        verification: "npx vitest run --grep 'priority to pri tag'",
      },
    ],
    dependencies: ["PBI-003"],
    status: "draft",
  },
  {
    id: "PBI-018",
    story: {
      role: "Obsidianユーザー",
      capability: "プラグインの動作を設定画面でカスタマイズする",
      benefit: "自分の好みに合わせてプラグインを調整できる",
    },
    acceptanceCriteria: [
      {
        criterion: "設定タブがObsidian設定に表示される",
        verification: "npx vitest run --grep 'settings tab'",
      },
      {
        criterion: "デフォルト優先度フィルタを設定できる",
        verification: "npx vitest run --grep 'default priority filter'",
      },
      {
        criterion: "デフォルトグルーピングを設定できる",
        verification: "npx vitest run --grep 'default grouping'",
      },
      {
        criterion: "デフォルトグループ名を設定できる",
        verification: "npx vitest run --grep 'default group name'",
      },
    ],
    dependencies: [],
    status: "draft",
  },
  {
    id: "PBI-019",
    story: {
      role: "Obsidianユーザー",
      capability: "構造化されたフォームでタスクを入力する",
      benefit: "todo.txt形式を覚えなくても正確にタスクを作成できる",
    },
    acceptanceCriteria: [
      {
        criterion: "タイトル入力フィールドがある",
        verification: "npx vitest run --grep 'form title field'",
      },
      {
        criterion: "優先度選択ドロップダウンがある",
        verification: "npx vitest run --grep 'form priority dropdown'",
      },
      {
        criterion: "期限日のデートピッカーがある",
        verification: "npx vitest run --grep 'form date picker'",
      },
      {
        criterion: "プロジェクトのコンボボックスがある",
        verification: "npx vitest run --grep 'form project combobox'",
      },
      {
        criterion: "コンテキストのコンボボックスがある",
        verification: "npx vitest run --grep 'form context combobox'",
      },
      {
        criterion: "todo.txt形式のリアルタイムプレビューがある",
        verification: "npx vitest run --grep 'form preview'",
      },
    ],
    dependencies: ["PBI-004", "PBI-005"],
    status: "draft",
  },
];

export const definitionOfReady = {
  criteria: [
    {
      criterion: "AI can complete this story without human input",
      required: true,
      note: "If human input needed, split or keep as refining",
    },
    {
      criterion: "User story has role, capability, and benefit",
      required: true,
    },
    {
      criterion: "At least 3 acceptance criteria with verification commands",
      required: true,
    },
    {
      criterion: "Dependencies are resolved or not blocking",
      required: true,
    },
  ],
};

// =============================================================================
// 2. Current Sprint
// =============================================================================

export const currentSprint = {
  number: 0,
  pbiId: null as string | null,
  story: null as string | null,
  status: "not_started" as SprintStatus,
  subtasks: [] as Subtask[],
  notes: "No sprint started yet. Run Sprint Planning to begin.",
};

// =============================================================================
// 3. Impediment Registry
// =============================================================================

export const impediments = {
  active: [] as Impediment[],
  resolved: [] as Impediment[],
};

// =============================================================================
// 4. Definition of Done
// =============================================================================

export const definitionOfDone = {
  checks: [
    { name: "Tests pass", run: "npx vitest run" },
    { name: "Lint clean", run: "npm run lint" },
    { name: "Types valid", run: "npx tsc --noEmit" },
    { name: "Build succeeds", run: "npm run build" },
  ] as DoDCheck[],
};

// =============================================================================
// 5. Completed Sprints
// =============================================================================

export const completedSprints: CompletedSprint[] = [];

// =============================================================================
// 6. Retrospective Log
// =============================================================================

export const retrospectives: Retrospective[] = [];

// =============================================================================
// 7. Agents
// =============================================================================

export const agents = {
  productOwner: "@scrum-team-product-owner",
  scrumMaster: "@scrum-team-scrum-master",
  developer: "@scrum-team-developer",
};

export const events = {
  planning: "@scrum-event-sprint-planning",
  review: "@scrum-event-sprint-review",
  retrospective: "@scrum-event-sprint-retrospective",
  refinement: "@scrum-event-backlog-refinement",
};
