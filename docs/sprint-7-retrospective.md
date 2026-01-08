# Sprint 7 Retrospective

**Date**: 2026-01-08
**Sprint**: 7
**PBI**: PBI-007 (ソート表示)
**Result**: SUCCESS - Phase 1 MVP Complete

---

## Sprint Summary

### Key Metrics
- **Subtasks Completed**: 3/3 (100%)
- **Commits**: 7 total (3 Red + 3 Green + 1 Refactor)
- **Tests Added**: 12 new tests (total now 132)
- **Estimation Accuracy**: 100% (12 estimated = 12 actual)
- **Refactor Commits**: 1 (first since Sprint 3)

### Sprint 6 Actions Applied
1. ✅ **Refactorチェックリスト導入**: 4観点チェック実施、型安全性改善コミット作成
2. ✅ **PBI複雑度評価基準の明確化**: 関数1/テスト12/外部依存0 → LOW → 3サブタスク
3. ⏳ **Phase完了時のテクニカルレビュー**: Sprint 7でPhase 1完了、次で実施予定

### Milestone Achievement
🎉 **Phase 1 MVP Complete**: PBI-001～007の全7つのPBI完了
- ファイルビュー (PBI-001)
- パーサー (PBI-002)
- 完了切替 (PBI-003)
- タスク作成 (PBI-004)
- タスク編集 (PBI-005)
- タスク削除 (PBI-006)
- ソート表示 (PBI-007)

---

## What Worked Well (うまくいったこと)

### 1. Sprint 6 Actionsの完璧な適用
- **Refactorチェックリスト4観点**の実施
  - コード重複: なし
  - 型安全性: 改善余地あり → explicit immutability checkコミット作成
  - 関数分割: 適切
  - 命名: 明確
- **PBI複雑度評価基準**による正確な見積もり
  - 関数数: 1 (sortTodos)
  - テストケース数: 12 (見積) = 12 (実測)
  - 外部依存: 0
  - 複雑度スコア: LOW → 3サブタスク

### 2. Phase 1 MVP完成達成
- PBI-001からPBI-007まで7つのPBI全てを完了
- todo.txt基本機能が完全に揃った
  - 表示: 専用ビューで.txt/.todotxtファイルを開く
  - パース: todo.txt形式を構造化データに変換
  - 完了切替: チェックボックスでワンクリック更新
  - 作成: 新規タスクの追加
  - 編集: 既存タスクの修正
  - 削除: 不要タスクの除去
  - ソート: 優先度順の一覧表示

### 3. Refactorフェーズの復活
- Sprint 4以降初めてrefactorコミットが発生
- 型安全性改善: explicit immutability check実施
- `[...incompleteTasks].sort()` と `[...completedTasks].sort()` で明示的なイミュータブル性を確保

### 4. 見積もり精度の継続的向上
- テストケース数: 12見積 = 12実測 (精度100%)
- サブタスク構成: 3サブタスク (4テスト/5テスト/3テスト)
- 単純なPBIに対する最適な粒度を実現

---

## To Improve (改善点)

### 1. Phase 1全体のテクニカルレビュー未実施
- **課題**: Sprint 6で計画した「Phase完了時のテクニカルレビュー」が未実施
- **影響**: Phase 2移行前のリファクタリング機会を逃す可能性
- **具体例**:
  - コード重複の有無
  - 型安全性の統一性
  - テストカバレッジの偏り
  - パフォーマンスボトルネック

### 2. Refactorコミットの発生頻度
- **課題**: Sprint 3以降でRefactorコミット発生率1/5 (20%)
- **現状**: チェックリスト導入でSprint 7は改善したが、継続的な実施が課題
- **データ**:
  - Sprint 3: 1 Refactorコミット ✅
  - Sprint 4: 0 Refactorコミット ❌
  - Sprint 5: 0 Refactorコミット ❌
  - Sprint 6: 0 Refactorコミット ❌
  - Sprint 7: 1 Refactorコミット ✅

### 3. Phase 2 PBIの準備不足
- **課題**: Phase 2の8つのPBI (PBI-008～019) が全て"draft"ステータス
- **影響**: 次Sprint開始前にBacklog Refinementが必要
- **必要な作業**:
  - acceptance criteriaの詳細化
  - 複雑度評価の追加
  - 依存関係の再確認

### 4. 複雑度評価基準の適用範囲
- **課題**: Sprint 7でLOW複雑度PBIの評価精度が証明されたが、MEDIUM/HIGH複雑度PBIの評価基準は未検証
- **現状**: LOW複雑度のみ定義済み
  - LOW: 関数1/テスト12/外部依存0 → 3サブタスク
- **未定義**: MEDIUM/HIGH複雑度の基準

---

## Actions (アクションアイテム)

### 1. Phase 1テクニカルレビューの実施
**実施タイミング**: Sprint 8開始前
**対象**: PBI-001～007の全実装コード
**レビュー観点**:
- コード重複の検出と削減
- 型安全性の統一と向上
- テストカバレッジの確認と補強
- パフォーマンスボトルネックの特定

**成果物**: 必要に応じてリファクタリングPBIを作成

### 2. Refactorチェックリストの定着化
**実施ルール**: 全SprintでGreenフェーズ完了後に必須実施
**チェック観点**:
1. コード重複
2. 型安全性
3. 関数分割
4. 命名

**記録方法**: チェックリスト結果をSprint Notesに記録
- 改善余地あり → 必ずRefactorコミットを作成
- 改善余地なし → その旨を明記

### 3. Phase 2 Backlog Refinement実施
**対象**: PBI-008～012の5つを"ready"ステータスに引き上げ
**作業内容**:
- 各PBIに複雑度評価を追加
  - 関数数
  - テストケース数
  - 外部依存
- 依存関係の再確認
- acceptance criteriaの詳細化

**優先順位**:
1. PBI-008: 優先度色分けバッジ (UI強化)
2. PBI-009: 優先度フィルタ (依存: PBI-007)
3. PBI-010: テキスト検索 (依存: PBI-007)
4. PBI-011: グループ化 (依存: PBI-007)
5. PBI-012: due:表示 (依存: PBI-002)

### 4. 複雑度評価基準の拡張
**定義すべき基準**:

| 複雑度 | 関数数 | テストケース数 | 外部依存 | サブタスク数 |
|--------|--------|----------------|----------|--------------|
| LOW    | 1      | 10-20          | 0        | 3-4          |
| MEDIUM | 2-3    | 20-40          | 1-2      | 5-7          |
| HIGH   | 4+     | 40+            | 3+       | 8-10         |

**検証方法**: Phase 2で実際のPBIに適用して精度を検証

---

## Sprint 7 Highlights

### Commits
1. `test: add Subtask 1 - sort incomplete before completed (RED)`
2. `feat: implement Subtask 1 - sort incomplete before completed (GREEN)`
3. `test: add Subtask 2 - sort by priority (RED)`
4. `feat: implement Subtask 2 - sort by priority (GREEN)`
5. `test: add Subtask 3 - immutability and integration (RED/GREEN)`
6. `feat: improve Subtask 3 - explicit immutability (GREEN)`
7. `refactor: improve type safety in sortTodos with explicit immutability check`

### Test Distribution
- Subtask 1: 4 tests (未完了優先)
- Subtask 2: 5 tests (優先度ソート)
- Subtask 3: 3 tests (イミュータビリティ)
- **Total**: 12 tests

### Implementation
- File: `src/lib/sort.ts`
- Function: `sortTodos(todos: Todo[]): Todo[]`
- Logic:
  1. 完了/未完了でタスクを分離
  2. 各グループ内で優先度順にソート
  3. 同優先度内ではテキスト辞書順にソート
  4. 未完了タスク → 完了タスクの順で結合

---

## Next Sprint Focus

### Immediate Actions (Sprint 8開始前)
1. Phase 1テクニカルレビュー実施
2. Phase 2 Backlog Refinement (PBI-008～012)
3. 複雑度評価基準の拡張定義

### Sprint 8 Candidate PBIs
- PBI-008: 優先度色分けバッジ (UI強化、MEDIUM複雑度の可能性)
- PBI-009: 優先度フィルタ (PBI-007依存)
- PBI-010: テキスト検索 (PBI-007依存)

### Phase 2 Goals
- フィルタリング機能の実装 (PBI-009, PBI-010, PBI-011)
- UI強化 (PBI-008)
- 期限管理 (PBI-012)

---

## Lessons Learned

### プロセス改善の成果
- **Refactorチェックリスト**: Sprint 6で導入 → Sprint 7で初の成果
- **複雑度評価基準**: 見積もり精度100%を達成
- **サブタスク柔軟化**: 3サブタスクで効率的に完了

### 継続すべき点
- TDD Red-Green-Refactorサイクルの徹底
- テストケース数の事前見積もり
- 受け入れ基準の明確化

### 次フェーズへの期待
- Phase 2でMEDIUM/HIGH複雑度PBIに挑戦
- UI実装を含むPBIでの学び
- Refactorコミット発生率の向上 (目標: 50%以上)

---

**Retrospective Facilitated by**: @scrum-team-scrum-master
**Date**: 2026-01-08
