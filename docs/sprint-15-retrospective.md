# Sprint 15 Retrospective - PBI-015 [text](url)外部リンク

**Sprint期間**: Sprint 15
**PBI**: PBI-015 - 説明文中の[text](url)形式のMarkdown外部リンクをパース・検出
**実施日**: 2026-01-09

## Sprint 15 Metrics

- **PBI**: PBI-015 - [text](url)形式のMarkdown外部リンクパース
- **Subtasks**: 3/3 completed
- **Commits**: 8 (RED 3 + GREEN 3 + FIX 1 + CHORE 1)
- **Refactor Rate**: 0% (LOW complexity, simple implementation)
- **Tests Added**: +27テスト (265→292)
- **DoD**: 全項目合格
- **AC**: 全4項目達成

## What Worked Well (うまくいったこと)

### 1. Link抽出モジュールファミリーの完成(内部+外部)
- PBI-014(内部リンク) → PBI-015(外部リンク)の連続実装
- extractInternalLinks/extractExternalLinksのAPIデザイン一貫性
- 統一されたリンク抽出パターン確立(正規表現+matchAll+ループ)

### 2. PBI-014パターン再利用の成功(実装継承)
- 正規表現マッチング共通パターン継承
- シンプルな実装維持
- 28テスト(Sprint 14) → 27テスト(Sprint 15)の高密度カバレッジ水準維持
- 学習曲線の短縮

### 3. 2連続Refactor率0%の複雑度ベース正当化(Sprint 14-15)
- LOW複雑度Sprint連続でRefactor率0%達成
- 「シンプルな実装はリファクタリング不要」原則の再実証
- Sprint 14で確立した複雑度別基準(LOW 0-20%)の実践

### 4. 多様なURLスキーム対応(汎用性実現)
- https/http/ftp/file/mailto等6スキーム対応テスト
- 単一正規表現[^)]+パターンで汎用性実現
- Markdown標準準拠
- スキーム特定ロジック不要のシンプル設計

### 5. FIX+CHOREフェーズの明示的記録(リアルフロー)
- 8コミット構成(RED 3 + GREEN 3 + FIX 1 + CHORE 1)
- 従来のRED/GREEN/REFACTORに加えFIX/CHORE導入
- テスト修正/整理作業の可視化
- リアルな開発フローの正直な記録

## Areas for Improvement (改善が必要なこと)

### 1. Phase 1テクニカルレビューの8 Sprint未実施(BLOCKER継続)
- Sprint 14「Sprint 15 BLOCKER指定」Action未達成
- Sprint 8開始から8 Sprint経過(約2.5ヶ月相当)
- 技術的負債の危機的累積
- プロセス信頼性の崩壊リスク
- 即座の解消なしにプロジェクト継続不可

### 2. Retrospective Action実行率0%の3 Sprint継続(完全形骸化)
- Sprint 13→14→15で3連続Action実行率0%
- 5項目全てが3 Sprint放置状態
- Retrospective完全形骸化
- 改善サイクルの機能停止
- プロセス意義の喪失

### 3. UI実装延期の5 PBI累積(Phase 2+Phase 3)
- PBI-012(due), PBI-013(threshold), PBI-014(内部リンク), PBI-015(外部リンク) + PBI-008(優先度バッジ)でUI延期
- Phase 2完全未統合のままPhase 3進行
- 統合複雑性の危険水準到達(5 PBI一括統合リスク)

### 4. Link系機能のUI統合戦略不在(設計負債)
- 内部リンク+外部リンクの統合ビジョン不明
- Obsidian APIコール戦略未定(app.workspace.openLinkText等)
- TodoItem.tsx拡張の複雑度予測不可
- Phase 3完遂の見通し不良

## Actions for Sprint 16 (次Sprintのアクション)

### 1. Phase 1テクニカルレビューのSprint 16完全BLOCKER化(開始禁止) 🚫
**Priority**: CRITICAL
- Sprint 16 Planning一切不可条件設定
- 8 Sprint延期の即座解消最優先
- 対象: Sprint 1-7全実装コードレビュー(todo.ts/parser.ts/sort.ts/filter.ts/group.ts)
- 期限: Sprint 16 Planning前完了必須(非交渉)
- 未完了時はプロジェクト一時停止検討

### 2. UI統合Sprintの緊急挿入(Phase 2+3統合)
**Priority**: HIGH
- Sprint 17をUI統合専用Sprintとして確定
- 5 PBI統合対象(PBI-008/012/013/014/015)
- TodoItem.tsx大規模リファクタリング実施
- Obsidian APIコール実装(openLinkText/setMarkdownView/window.open)
- 成果物: 実働UIデモ
- 期限: Sprint 16中にUI統合計画策定完了

### 3. Retrospective Actionの強制持ち越しルール導入(形骸化防止)
**Priority**: HIGH
- 未完了Actionは次SprintのImpedimentに自動昇格
- Impediment解消までPBIサイズ制限(LOW複雑度のみ)
- 3 Sprint未実施Action自動削除ルール
- Sprint 16 Planningで適用開始
- Action追跡の強制力付与

### 4. Link系UI統合パターンの事前設計(技術検証)
**Priority**: MEDIUM
- 内部リンク: Obsidian app.workspace.openLinkText()コール
- 外部リンク: window.open()またはObsidian openExternal
- 共通コンポーネント: LinkRenderer.tsxの設計
- 成果物: docs/link-ui-integration-design.md
- 期限: Phase 1レビュー完了後、UI統合Sprint前

### 5. Phase 3残PBI複雑度の事前見積(リスク評価)
**Priority**: MEDIUM
- PBI-016(rec:繰り返し): 予測HIGH(日付計算+タスク生成)
- PBI-017(pri:タグ): 予測LOW(タグ変換のみ)
- Phase 3完了前のリスク評価
- UI統合Sprint後の優先度再評価
- Phase完遂戦略の再構築

## Previous Sprint 14 Actions Review (前Sprintアクションのレビュー)

| Action | Status | Notes |
|--------|--------|-------|
| Phase 1テクニカルレビューの即時実施(Sprint 15 BLOCKER指定) | ❌ NOT DONE | 8 Sprint経過。Sprint 16で完全BLOCKER化 |
| UI実装ロードマップの緊急策定 | ❌ NOT DONE | UI累積5 PBI。Sprint 17 UI統合Sprint確定 |
| Retrospective Action追跡プロセスの導入 | ❌ NOT DONE | 3 Sprint形骸化。強制ルール導入へ |
| Refactor率目標の複雑度別基準化 | ✅ DONE | Sprint 15で0%正当化実践 |
| Phase 3パターンライブラリの体系化検討 | 🔄 IN PROGRESS | Link系パターン確立 |

**Action実行率**: 1/5 = 20% (3 Sprint連続低迷から微回復)

## Key Insights (重要な気づき)

### Technical
1. **Link抽出パターンの統一性**: 内部リンク([[]])と外部リンク([text](url))で一貫したAPI設計を実現
2. **正規表現の汎用性**: [^)]+パターンで全URLスキームに対応、スキーム判定不要
3. **FIX/CHOREの可視化**: TDDサイクルに加え、修正・整理作業も明示的に記録

### Process
1. **BLOCKER継続の深刻化**: 8 Sprint延期でプロセス信頼性崩壊寸前
2. **Retrospective形骸化**: 3 Sprint連続0%実行率で改善サイクル機能停止
3. **UI統合負債の累積**: 5 PBI統合リスクが危険水準

## Metrics Summary (メトリクスサマリー)

- **Velocity**: 3 Subtasks/Sprint (安定)
- **Test Growth**: +27 tests (高密度カバレッジ維持)
- **Refactor Rate**: 0% (LOW複雑度正当化)
- **Action Execution**: 20% (3 Sprint低迷から微回復)
- **Technical Debt**: CRITICAL (Phase 1レビュー8 Sprint延期)

## Next Steps (次のステップ)

1. **IMMEDIATE**: Phase 1テクニカルレビュー実施(Sprint 16 Planning前完了必須)
2. **Sprint 16**: UI統合計画策定 + 低複雑度PBI実装
3. **Sprint 17**: UI統合Sprint実施(5 PBI統合)
4. **Sprint 18+**: Phase 3残PBI(rec:/pri:)実装

---

**Retrospective実施者**: @scrum-team-scrum-master
**記録日時**: 2026-01-09
**次回Retrospective**: Sprint 16完了後
