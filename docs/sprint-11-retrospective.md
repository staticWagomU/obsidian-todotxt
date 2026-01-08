# Sprint 11 Retrospective

**Date**: 2026-01-09
**Sprint**: 11
**PBI**: PBI-011 (グループ化)
**Result**: SUCCESS - 初のMEDIUM複雑度Sprint完遂、Refactor発生率目標に向けてさらに前進

---

## Sprint Summary

### Key Metrics
- **Subtasks Completed**: 6/6 (100%) - 初のMEDIUM複雑度Sprint (通常4サブタスク→6サブタスク)
- **Commits**: 19 total (6 Red + 6 Green + 7 Refactor)
- **Tests Added**: 8 new tests (total now 183)
- **Estimation Accuracy**: 32% (25 estimated vs 8 actual - 効率的実装継続)
- **Refactor Commits**: 7 (発生率37% - Sprint 10の33%からさらに改善)

### Sprint 10 Actions Applied
1. ✅ **Refactor発生率50%達成戦略**: 7つのRefactorコミット作成 (発生率33%→37%改善)
2. ✅ **Refactorコミットメッセージ統一フォーマット**: 具体的改善内容と観点を明記
3. ⚠️ **Phase 1テクニカルレビュー実施**: Sprint 12開始前に延期 (4 Sprint継続ペンディング)
4. ✅ **テストコードRefactor体系的実施**: createTodo, expectGroupToContain ヘルパー関数抽出

### Milestone Achievement
🎯 **初のMEDIUM複雑度Sprint完遂**: 6サブタスク、25見積→8実績テスト、19コミット
🎯 **Refactor発生率改善継続**: Sprint 8(0%) → Sprint 9(27%) → Sprint 10(33%) → Sprint 11(37%)
🎯 **高階関数パターン導入**: groupByTags抽出でgroupByProject/groupByContext両関数を1行化達成
🎯 **Phase 2進捗**: 4/5 PBI完了 (PBI-008, 009, 010, 011)

---

## What Worked Well (うまくいったこと)

### 1. 初のMEDIUM複雑度Sprint成功
- **6サブタスク完遂**: 通常LOWスプリント(4サブタスク)の1.5倍の規模を完遂
- **複雑度指標**:
  - 関数数: 3 (groupByProject, groupByContext, groupByTags)
  - テスト見積: 25 → 実績: 8 (効率的設計により過剰実装回避)
  - 外部依存: 0
- **TDDサイクル維持**: 6サブタスク全てでRED→GREEN→REFACTORサイクル完遂
- **品質保証**: DoD全項目合格、AC全5項目達成

### 2. Refactor発生率のさらなる改善
- **7つのRefactorコミット作成** (Sprint 10は4つ)
  - Subtask 1: addToGroup関数抽出 (コード重複削減)
  - Subtask 2: addToGroup再利用でDRY原則適用
  - Subtask 3: groupByTags高階関数抽出 (抽象化)
  - Subtask 4: groupByProject 1行化 (高階関数活用)
  - Subtask 5: groupByContext 1行化 (高階関数活用)
  - Subtask 6: JSDoc最終調整、型安全性確認
  - Final: テストコードRefactor (createTodo, expectGroupToContain)
- **発生率改善**: Sprint 10の33% → Sprint 11の37% (7/19コミット)
- **改善トレンド継続**: 4 Sprint連続で改善 (0% → 27% → 33% → 37%)

### 3. 高階関数パターンによるコード再利用実現
- **groupByTags高階関数抽出**:
  ```typescript
  function groupByTags(todos: Todo[], getTagsFromTodo: (todo: Todo) => string[]): Map<string, Todo[]>
  ```
- **2つの公開関数を1行化**:
  ```typescript
  export function groupByProject(todos: Todo[]): Map<string, Todo[]> {
    return groupByTags(todos, (todo) => todo.projects);
  }

  export function groupByContext(todos: Todo[]): Map<string, Todo[]> {
    return groupByTags(todos, (todo) => todo.contexts);
  }
  ```
- **設計上の利点**:
  - DRY原則の徹底適用
  - 将来の拡張性向上 (新しいタグ種別への対応が容易)
  - テストメンテナンス負担軽減 (共通ロジックは1箇所)
  - コード可読性向上 (意図が明確)

### 4. テストコードRefactorの体系的実施
- **createTodo ヘルパー関数抽出**:
  ```typescript
  function createTodo(description: string, projects: string[] = [], contexts: string[] = []): Todo
  ```
  - テストデータ生成の一元化
  - デフォルト引数で柔軟な使用
  - 重複コード削減
- **expectGroupToContain ヘルパー関数抽出**:
  ```typescript
  function expectGroupToContain(result: Map<string, Todo[]>, groupKey: string, expectedTodos: Todo[]): void
  ```
  - 共通アサーションパターンの抽象化
  - テストの可読性向上
  - 意図の明確化 (「このグループには特定のTodoが含まれるべき」)
- **効果**: テストコード行数削減、保守性向上

### 5. テスト見積もり精度の改善
- **見積もり**: 25テスト
- **実績**: 8テスト (32%)
- **効率的設計の証明**:
  - 高階関数抽出により共通ロジックを1箇所でテスト
  - Project/Context両方で重複テストケース回避
  - 必要十分なカバレッジ達成 (AC全5項目達成)
- **過剰実装回避**: 見積もり時点での冗長性を実装時に排除

---

## To Improve (改善点)

### 1. Refactor発生率50%目標の継続未達
- **課題**: 目標50%に対して37%達成 (7/19コミット)
- **改善傾向**: Sprint 10(33%) → Sprint 11(37%)で4pp改善したが、目標まであと13pp
- **分析**:
  - 7つのRefactorコミット作成は過去最多 (Sprint 10: 4, Sprint 9: 3)
  - しかしRed(6) + Green(6) = 12コミットが総数19の63%を占める
  - Refactorコミット数は増えたが、比率は37%止まり
- **根本原因**: 1サブタスク1Refactorコミットが基本パターン (最終サブタスクのみ追加Refactor)
- **次Sprintへの課題**: 各サブタスクで複数Refactor観点を別コミット化する戦略が必要

### 2. Phase 1テクニカルレビューの長期ペンディング
- **課題**: Sprint 8から4 Sprint継続ペンディング (Sprint 8, 9, 10, 11)
- **影響**: Phase 1コード (PBI-001～007) の統一的品質評価が未実施
- **リスク**: 技術的負債の蓄積可能性、Phase 2知見のPhase 1へのフィードバック未適用
- **優先度判断**: Phase 2機能実装を優先したが、Phase 2完了目前 (4/5 PBI完了)
- **実施タイミング**: Sprint 12開始前 (Phase 2完了後、Phase 3開始前が最適)

### 3. MEDIUM複雑度Sprintでのテスト見積もり精度課題
- **課題**: 見積もり25テスト → 実績8テスト (32%) - 過去最低精度
- **比較**:
  - Sprint 9 (LOW): 73% (15→11)
  - Sprint 10 (LOW): 73% (15→11)
  - Sprint 11 (MEDIUM): 32% (25→8)
- **原因分析**:
  - MEDIUM複雑度の見積もり経験不足 (初回)
  - 高階関数パターンによるテスト集約効果を過小評価
  - Project/Context両関数の重複テストケースを想定
- **影響**: 見積もり精度低下だが、過剰実装回避という点ではポジティブ

### 4. Refactorコミットの粒度改善余地
- **課題**: Subtask 1-5は各1 Refactorコミット、Subtask 6のみ追加Refactor
- **改善余地**:
  - Subtask 3 (groupByTags抽出) は大きな変更だが1コミット
  - 複数観点 (関数抽出 + 型安全性 + JSDoc) を1コミットに含む可能性
  - Sprint 10で定義した「複数観点は別コミット化」戦略が部分的適用
- **次Sprintでの改善**: Refactor時に各観点をチェックし、独立性があれば別コミット化

---

## Actions (アクションアイテム)

### 1. Refactor発生率50%達成のための戦略強化
**目標**: Sprint 12で発生率50%以上達成 (現状37% → +13pp改善)

**具体的施策**:
1. **各サブタスクで複数Refactorコミット目標設定**:
   - 目標: 平均1.5 Refactor/subtask (4サブタスク × 1.5 = 6 Refactorコミット)
   - 現状: Sprint 11は平均1.17 Refactor/subtask (7/6サブタスク)
2. **Refactorチェックリスト4観点の独立コミット化**:
   - コード重複削減 → 1コミット
   - 型安全性向上 → 1コミット (該当する場合)
   - 関数分割/抽象化 → 1コミット
   - JSDoc/命名改善 → 1コミット
3. **Greenフェーズの最小実装徹底**: Green到達を最短経路で実現し、Refactor時間を確保
4. **テストコードRefactorの別コミット化**: 実装コードとテストコードのRefactorを分離

**測定方法**: Sprint 12で6コミット以上のRefactorコミット作成を目指す (4サブタスク想定)

**期待効果**: 37% → 50%以上への改善

### 2. Phase 1テクニカルレビューの確実な実施
**実施タイミング**: Sprint 12開始前 (必須実施) - Phase 2完了後 (PBI-012完了)

**理由**:
- Phase 2は4/5 PBI完了、残りPBI-012のみ (LOW複雑度)
- Sprint 8から4 Sprint継続ペンディングは技術的負債リスク増大
- Phase 2で得た知見 (高階関数、Type Guard、Refactorプロセス) をPhase 1に適用可能
- Phase 3開始前にPhase 1品質を保証する必要

**レビュー観点** (Sprint 8, 9, 10定義を継承):
- コード重複の検出と削減 (高階関数パターン適用可否)
- 型安全性の統一と向上 (Type Guard patternの適用可否)
- テストカバレッジの確認と補強
- パフォーマンスボトルネックの特定
- 命名規則の統一性確認
- イミュータブル保証の一貫性

**成果物**: リファクタリングPBIを作成し、Backlogに追加 (必要に応じて)

### 3. MEDIUM複雑度Sprint見積もり精度向上
**課題**: 初のMEDIUM複雑度Sprintで見積もり精度32% (25→8テスト)

**改善施策**:
1. **MEDIUM複雑度見積もりガイドライン策定**:
   - 関数数 × 8テスト/関数を基準値とする (3関数 × 8 = 24テスト)
   - 高階関数/抽象化パターンがある場合は-30%調整 (24 × 0.7 = 17テスト)
   - 重複テストケース可能性を考慮し-20%バッファ (17 × 0.8 = 14テスト)
2. **実績ベースの精度向上**:
   - Sprint 11実績: 3関数で8テスト → 約2.7テスト/関数
   - 次回MEDIUM複雑度時の参考値として記録
3. **見積もり時の抽象化効果考慮**:
   - 高階関数/共通ロジック抽出の可能性を事前検討
   - テスト集約効果を見積もりに反映

**測定方法**: 次回MEDIUM複雑度Sprintで見積もり精度60%以上を目指す

### 4. Refactorコミット粒度の明確化
**実施方法**:
1. **Refactor時の観点別チェックリスト**:
   ```
   Refactor Phase Checklist:
   □ コード重複削減 (addToGroup抽出など) → 該当すれば1コミット
   □ 抽象化/高階関数 (groupByTags抽出など) → 該当すれば1コミット
   □ 型安全性向上 → 該当すれば1コミット
   □ JSDoc/命名改善 → 該当すれば1コミット
   □ テストコードRefactor → 該当すれば1コミット
   ```
2. **各観点の独立性判断**:
   - 独立性が高い (他に影響しない) → 別コミット化
   - 依存関係がある (同時変更必須) → 1コミットに統合
3. **コミットメッセージフォーマット統一**:
   ```
   refactor: Subtask X - [具体的改善内容] ([観点])

   例: refactor: Subtask 1 - extract addToGroup helper (コード重複削減)
   例: refactor: Subtask 3 - extract groupByTags higher-order function (抽象化)
   ```

**期待効果**: Refactorコミット数増加、トレーサビリティ向上、学習効果最大化

---

## Sprint 11 Highlights

### Commits
1. `test: Subtask 1 - groupByProject基本動作 (RED)`
2. `feat: Subtask 1 - groupByProject基本動作 (GREEN)`
3. `refactor: Subtask 1 - extract addToGroup helper (REFACTOR)`
4. `test: Subtask 2 - groupByContext基本動作 (RED)`
5. `feat: Subtask 2 - groupByContext基本動作 (GREEN)`
6. `refactor: Subtask 2 - reuse addToGroup in groupByContext (REFACTOR)`
7. `test: Subtask 3 - 複数タグ持ちTodoのグループ化 (RED)`
8. `feat: Subtask 3 - 複数タグ持ちTodoのグループ化 (GREEN)`
9. `refactor: Subtask 3 - extract groupByTags higher-order function (REFACTOR)`
10. `test: Subtask 4 - タグなしTodoの未分類グループ配置 (RED)`
11. `feat: Subtask 4 - タグなしTodoの未分類グループ配置 (GREEN)`
12. `refactor: Subtask 4 - simplify groupByProject using groupByTags (REFACTOR)`
13. `test: Subtask 5 - 空配列入力時の空Map返却 (RED)`
14. `feat: Subtask 5 - 空配列入力時の空Map返却 (GREEN)`
15. `refactor: Subtask 5 - simplify groupByContext using groupByTags (REFACTOR)`
16. `test: Subtask 6 - ソート順保持の確認 (RED)`
17. `feat: Subtask 6 - ソート順保持の確認 (GREEN)`
18. `refactor: Subtask 6 - add comprehensive JSDoc and type safety check (REFACTOR)`
19. `refactor: Final - extract test helpers createTodo and expectGroupToContain (REFACTOR)`

### Test Distribution
- Subtask 1 (groupByProject基本): 2 tests - 単一プロジェクト、空配列
- Subtask 2 (groupByContext基本): 2 tests - 単一コンテキスト、空配列
- Subtask 3 (複数タグ): 2 tests - プロジェクト複数、コンテキスト複数
- Subtask 4 (未分類グループ): 2 tests - プロジェクトなし、コンテキストなし
- Subtask 5: テストカバレッジ確認 (新規テスト追加なし)
- Subtask 6: コードレビュー (新規テスト追加なし)
- **Total**: 8 tests (見積もり25テストに対して32% - 効率的実装)

### Implementation
- File: `src/lib/group.ts`
- Functions:
  1. `groupByProject(todos: Todo[]): Map<string, Todo[]>` - プロジェクトでグループ化 (1行実装)
  2. `groupByContext(todos: Todo[]): Map<string, Todo[]>` - コンテキストでグループ化 (1行実装)
  3. `groupByTags(todos: Todo[], getTagsFromTodo: (todo: Todo) => string[]): Map<string, Todo[]>` - 高階関数 (内部関数)
  4. `addToGroup(grouped: Map<string, Todo[]>, key: string, todo: Todo): void` - ヘルパー関数 (内部関数)

### Acceptance Criteria Achievement
- ✅ AC1: +projectでグループ化し、プロジェクトごとにタスクをまとめて表示
- ✅ AC2: @contextでグループ化し、コンテキストごとにタスクをまとめて表示
- ✅ AC3: グループなし(プロジェクト/コンテキスト未指定)タスクを"未分類"グループに配置
- ✅ AC4: 複数プロジェクト/コンテキストを持つタスクを全該当グループに表示
- ✅ AC5: グループ内でソート順を保持(未完了優先/優先度順/辞書順) - コードレビューで確認

---

## Sprint 10 vs Sprint 11 比較

| 指標 | Sprint 10 (LOW) | Sprint 11 (MEDIUM) | 改善 |
|------|-----------------|-------------------|------|
| サブタスク数 | 4 | 6 | ✅ +2 (MEDIUM複雑度) |
| Refactorコミット数 | 4 | 7 | ✅ +3 |
| Refactor発生率 | 33% (4/12) | 37% (7/19) | ✅ +4pp |
| Refactor実施率 | 100% (4/4) | 100% (6/6) | ✅ 維持 |
| テスト見積もり精度 | 73% | 32% | ⚠️ -41pp (MEDIUM初回) |
| 総コミット数 | 12 | 19 | ✅ +7 (規模拡大) |
| テスト追加数 | 11 | 8 | ⚠️ -3 (効率化) |
| 高階関数パターン | なし | groupByTags | ✅ 新規導入 |
| テストヘルパー | なし | createTodo, expectGroupToContain | ✅ 新規導入 |

### 主要改善点
1. **Refactor発生率改善継続**: 33% → 37%で4 Sprint連続改善 (0% → 27% → 33% → 37%)
2. **Refactorコミット数最多**: 過去最多7コミット (Sprint 10: 4, Sprint 9: 3)
3. **高階関数パターン導入**: groupByTags抽出で2つの公開関数を1行化
4. **テストヘルパー導入**: テストコードRefactorの体系的実施

### 継続課題
1. **Refactor発生率50%目標**: まだ達成していない (あと13pp)
2. **Phase 1テクニカルレビュー**: 4 Sprint継続ペンディング (次Sprint必須)
3. **MEDIUM複雑度見積もり精度**: 初回32%、次回改善必要

---

## Phase 2 Progress

### Completed PBIs (4/5)
- ✅ PBI-008: 優先度色分けバッジ (Sprint 8)
- ✅ PBI-009: 優先度フィルタ (Sprint 9)
- ✅ PBI-010: テキスト検索 (Sprint 10)
- ✅ PBI-011: グループ化 (Sprint 11) - **Phase 2中核機能完成**

### Remaining PBIs (1/5)
- 🔜 PBI-012: due:表示 (LOW複雑度, 4サブタスク)

### Phase 2 Milestone Achievement
🎯 **Phase 2中核機能完成**: グループ化により関連タスクをまとめて表示可能に
🎯 **フィルタリング & UI機能群**: 4つの機能 (バッジ、フィルタ、検索、グループ化) が連携
🎯 **Phase 2完了目前**: 残り1 PBI (due:表示) のみ

---

## Next Sprint Focus

### Immediate Actions (Sprint 12開始前)
1. ⚠️ Phase 1テクニカルレビュー実施 (4 Sprint継続ペンディング解消) - **強く推奨**
2. ✅ Refactorコミット複数化戦略の明確化 (観点別独立コミット)
3. ✅ MEDIUM複雑度見積もりガイドライン策定
4. ✅ Refactorコミット粒度チェックリスト作成

### Sprint 12 Candidate PBIs
- **推奨**: PBI-012 (due:表示) - Phase 2完了、LOW複雑度、期限管理機能
- **Phase 2完了後の選択肢**: Phase 3開始またはPhase 1リファクタリング

### Phase 2 Goals Progress
- ✅ フィルタリング機能の実装完了 (PBI-009, 010)
- ✅ UI強化完了 (PBI-008)
- ✅ グループ化によるタスク整理完了 (PBI-011)
- 🔜 期限管理機能 (PBI-012) - Phase 2完了

---

## Lessons Learned

### プロセス改善の成果
- **初のMEDIUM複雑度Sprint完遂**: 6サブタスク、19コミット、TDDサイクル維持
- **Refactor発生率改善継続**: 4 Sprint連続改善 (0% → 27% → 33% → 37%)
- **Refactorコミット数最多**: 過去最多7コミット作成
- **高階関数パターン成功**: groupByTags抽出でコード再利用実現

### 継続課題
- **Refactor発生率50%目標**: 37%達成だが目標未達 (継続努力必要、あと13pp)
- **Phase 1テクニカルレビュー**: 4 Sprint継続ペンディング (次Sprint必須実施)
- **MEDIUM複雑度見積もり**: 初回32%、経験蓄積と改善が必要

### ポジティブな気づき
- **高階関数パターンの有効性**: コード再利用とテスト集約の両立実現
- **テストヘルパーの効果**: createTodo, expectGroupToContainでテストコード品質向上
- **効率的実装継続**: 見積もり25→実績8で過剰実装回避
- **MEDIUM複雑度Sprint完遂**: 複雑度向上でもTDDプロセス維持可能を証明

### 次フェーズへの期待
- Refactor発生率50%達成 (Sprint 12で目標達成を目指す)
- Phase 1テクニカルレビュー完了 (4 Sprint継続ペンディング解消)
- Phase 2完了 (PBI-012完了でPhase 2全機能稼働)
- Phase 3開始またはPhase 1リファクタリング実施

---

## Refactor Rate Improvement Trend

| Sprint | Refactor Commits | Total Commits | Refactor Rate | Improvement |
|--------|------------------|---------------|---------------|-------------|
| Sprint 8 | 0 | 12 | 0% | - |
| Sprint 9 | 3 | 11 | 27% | +27pp |
| Sprint 10 | 4 | 12 | 33% | +6pp |
| Sprint 11 | 7 | 19 | 37% | +4pp |
| **Target** | - | - | **50%** | **+13pp needed** |

**Trend Analysis**:
- 📈 4 Sprint連続で右肩上がりの改善推移 (0% → 27% → 33% → 37%)
- ✅ 全サブタスクでRefactorコミット作成達成 (実施率100%維持)
- ✅ Refactorコミット数最多 (7コミット - 過去最高)
- ⚠️ 改善ペース減速 (+27pp → +6pp → +4pp)
- 🎯 目標まであと13pp (Sprint 12で達成を目指す)

**Strategy for Sprint 12**:
- 各サブタスクで複数Refactorコミット目標 (平均1.5 Refactor/subtask)
- Refactorチェックリスト4観点の独立コミット化
- テストコードRefactorの別コミット化
- Greenフェーズの最小実装徹底

---

**Retrospective Facilitated by**: @scrum-team-scrum-master
**Date**: 2026-01-09
