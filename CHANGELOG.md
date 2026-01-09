# Changelog

All notable changes to the Obsidian Todo.txt Plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### v1.0.0 Release Candidate

1.0.0リリースに向けた準備が進行中です。

## [1.0.0] - TBD

### Summary

Obsidian Todo.txt Pluginの初回リリースです。todo.txt形式のファイルをObsidian内で管理・表示できる専用ビューとタスク管理機能を提供します。

### Key Features

#### Phase 1: MVP (Sprint 1-7)
基本的なtodo.txt管理機能を実装しました。

- **専用ビュー**: .txt/.todotxt ファイル専用のビューを実装（TextFileView継承）
- **todo.txtパース**: todo.txt形式の完全パース対応
  - 完了マーク (`x`)
  - 優先度 (`(A)` - `(Z)`)
  - 日付（作成日、完了日）
  - プロジェクト (`+project`)
  - コンテキスト (`@context`)
  - タグ (`key:value`)
- **完了切替**: チェックボックスクリックで完了/未完了を切替、完了日を自動設定
- **新規タスク作成**: 「Add Task」ボタンから新規タスクを追加
- **タスク編集**: インライン編集機能（テキストフィールド表示）
- **タスク削除**: 削除ボタンによるタスク削除
- **ソート表示**: 優先度・日付による自動ソート

#### Phase 2: フィルタリング&UI拡張 (Sprint 8-12)
表示機能とフィルタリング機能を大幅に拡張しました。

- **優先度色分けバッジ**: 優先度に応じたカラーコーディング
  - (A) = 赤
  - (B) = 黄
  - (C) = 緑
  - (D-Z) = 青
- **優先度フィルタ**: ドロップダウンメニューによる優先度フィルタリング
- **テキスト検索**: リアルタイム全文検索機能
- **グループ化**: 以下の条件でタスクをグループ表示
  - プロジェクト (`+project`)
  - コンテキスト (`@context`)
  - 優先度
- **due:表示**: 期限タグ (`due:YYYY-MM-DD`) の視覚的表示と期限管理

#### Phase 3: 拡張機能 (Sprint 13-17)
todo.txt形式の高度な機能とObsidian統合を実装しました。

- **t:グレーアウト**: threshold日付 (`t:YYYY-MM-DD`) によるタスクの視覚的区別
  - threshold日前のタスクはグレーアウト表示
  - 「いつかやる」タスクの管理を支援
- **[[Note]]内部リンク**: Obsidian内部リンクのクリック可能表示
  - Wikilink形式 (`[[Note]]`) をクリック可能に
  - Obsidianのノート間連携をサポート
- **[text](url)外部リンク**: Markdown形式の外部リンク対応
  - 外部URLへのリンクをクリック可能に表示
- **rec:繰り返しタスク**: 繰り返しタグ (`rec:+1d`, `rec:+1w` など) による自動生成
  - 完了時に次回タスクを自動作成
  - 日次・週次・月次タスクの管理を効率化
- **pri:タグ保存**: `pri:A` タグと `(A)` 優先度の相互変換
  - 完了時に優先度情報を保持
  - 繰り返しタスクでの優先度維持

#### Phase 4: UI統合 (Sprint 18-20)
UIの統合と洗練を行い、使いやすさを向上させました。

- **UI統合**: 7機能の統合動作検証（メガSprint）
  - 完了切替、編集、削除、ソート、フィルタ、グループ化、検索の相互作用を検証
  - シームレスなユーザー体験を実現
- **設定画面**: プラグイン設定UIの実装
  - デフォルトソート順の設定
  - フィルタ設定の保存
  - グループ化設定のカスタマイズ
- **構造化フォーム**: 新規作成・編集時の構造化入力フォーム
  - 優先度、日付、プロジェクト、コンテキスト、タグを個別に入力
  - todo.txt形式への変換を自動化

### Technical Improvements

#### Phase 5: リファクタリング (Sprint 21)
- **recurrence.tsリファクタリング**: 繰り返しタスク処理のコード品質向上
  - テストカバレッジ向上
  - 可読性・保守性の改善

### Documentation

#### Phase 5: ドキュメント整備 (Sprint 22-25)
- **Product Roadmap 2026**: 1.0.0機能スコープとリリース基準の定義
- **Release Checklist**: コミュニティプラグイン登録手順とチェックリスト
- **CHANGELOG.md**: Phase 1-4の変更履歴とv1.0.0リリースノート

### Known Limitations

- モバイル対応は現在テスト中です
- 大規模ファイル（1000タスク以上）でのパフォーマンスは今後最適化予定です
- 一部のtodo.txt拡張機能（例: `h:1` hidden タグ）は未対応です

### Breaking Changes

初回リリースのため該当なし。

### Migration Guide

初回リリースのため該当なし。

## Development History

### Sprint 1-7: Phase 1 MVP
- Sprint 1: PBI-001 - .txt/.todotxt専用ビュー
- Sprint 2: PBI-002 - todo.txtパース
- Sprint 3: PBI-003 - 完了切替
- Sprint 4: PBI-004 - 新規タスク作成
- Sprint 5: PBI-005 - タスク編集
- Sprint 6: PBI-006 - タスク削除
- Sprint 7: PBI-007 - ソート表示

### Sprint 8-12: Phase 2 フィルタリング&UI拡張
- Sprint 8: PBI-008 - 優先度色分けバッジ
- Sprint 9: PBI-009 - 優先度フィルタ
- Sprint 10: PBI-010 - テキスト検索
- Sprint 11: PBI-011 - グループ化
- Sprint 12: PBI-012 - due:表示

### Sprint 13-17: Phase 3 拡張機能
- Sprint 13: PBI-013 - t:グレーアウト
- Sprint 14: PBI-014 - [[Note]]内部リンク
- Sprint 15: PBI-015 - [text](url)外部リンク
- Sprint 16: PBI-016 - rec:繰り返しタスク
- Sprint 17: PBI-017 - pri:タグ保存

### Sprint 18-20: Phase 4 UI統合
- Sprint 18: PBI-020 - UI統合メガSprint
- Sprint 19: PBI-018 - 設定画面
- Sprint 20: PBI-019 - 構造化フォーム

### Sprint 21: Phase 5 リファクタリング
- Sprint 21: PBI-021 - recurrence.tsリファクタリング

### Sprint 22-25: Phase 5 ドキュメント整備・リリース準備
- Sprint 22: PBI-023 - Product Roadmap 2026とリリース基準定義
- Sprint 23-25: TBD

## Future Releases

### v1.0.1 - Patch Release (Planned)
初期フィードバックに基づくバグ修正とマイナー改善。

### v1.1.0 - Feature Release (Planned)
- カレンダービュー統合
- タグオートコンプリート
- 一括編集機能

詳細は `docs/product-roadmap-2026.md` を参照してください。

---

Last updated: 2026-01-09
