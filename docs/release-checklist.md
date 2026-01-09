# Release Checklist - Obsidian Todo.txt Plugin

このドキュメントは、Obsidian Todo.txt Pluginをコミュニティプラグインとしてリリースするためのチェックリストです。

## 1. Pre-Release Checklist

### 1.1 Code Quality
- [ ] すべてのテストがパス (`pnpm vitest run`)
- [ ] リントエラーなし (`pnpm lint`)
- [ ] 型チェックエラーなし (`pnpm tsc --noEmit`)
- [ ] テストカバレッジ80%以上
- [ ] 既知の重大バグがないことを確認

### 1.2 Documentation
- [ ] README.md が最新である
  - [ ] プラグインの概要説明（日本語・英語）
  - [ ] インストール方法の記載
  - [ ] 基本的な使い方の記載
  - [ ] スクリーンショット/GIFの追加
  - [ ] todo.txt形式の簡易リファレンス
  - [ ] ライセンス情報の記載
- [ ] CHANGELOG.md が最新である
  - [ ] v1.0.0のリリースノート
  - [ ] Phase 1-4の変更履歴
  - [ ] Breaking changesの記載（該当する場合）
  - [ ] 既知の制限事項の記載
- [ ] CLAUDE.md が最新である

### 1.3 Manifest Files
- [ ] `manifest.json` の更新
  - [ ] `version`: "1.0.0"
  - [ ] `minAppVersion`: 適切なバージョン（例: "0.15.0"）
  - [ ] `name`: "Todo.txt"
  - [ ] `description`: 正確な説明文
  - [ ] `author`: 正確な作者情報
  - [ ] `authorUrl`: GitHubプロフィールURL
  - [ ] `isDesktopOnly`: false（モバイル対応の場合）
- [ ] `versions.json` の更新
  - [ ] "1.0.0"エントリの追加
  - [ ] minAppVersionとの整合性確認
- [ ] `package.json` の更新
  - [ ] `version`: "1.0.0"
  - [ ] `description`: manifest.jsonと一致
  - [ ] `author`: 正確な情報

### 1.4 Build & Test
- [ ] プロダクションビルド成功 (`pnpm build`)
- [ ] main.js のサイズ確認（大きすぎないか）
- [ ] Obsidianテストvaultでの動作確認
  - [ ] Windows
  - [ ] macOS
  - [ ] Linux（可能であれば）
  - [ ] モバイル（iOS/Android、該当する場合）

### 1.5 Legal & Compliance
- [ ] LICENSE ファイルが存在する（MIT推奨）
- [ ] 依存関係のライセンス確認
- [ ] プライバシーポリシー（ネットワーク通信がある場合）
- [ ] 第三者ライブラリのクレジット表記

## 2. GitHub Release

### 2.1 Git Tag
- [ ] `git tag -a 1.0.0 -m "Release v1.0.0"`
- [ ] `git push origin 1.0.0`

### 2.2 GitHub Release Page
- [ ] GitHubのReleasesページで新規リリース作成
- [ ] Tag: `1.0.0`
- [ ] Title: `v1.0.0 - Initial Release`
- [ ] 説明文: CHANGELOG.mdのv1.0.0セクションをコピー
- [ ] Assets追加
  - [ ] `main.js`
  - [ ] `manifest.json`
  - [ ] `styles.css`（存在する場合）

## 3. Obsidian Community Plugin Submission

### 3.1 obsidian-releases リポジトリへのPR

#### 3.1.1 事前準備
- [ ] obsidianmd/obsidian-releases をフォーク
- [ ] ローカルにクローン

#### 3.1.2 community-plugins.json の編集
`community-plugins.json` に以下のエントリを追加:

```json
{
  "id": "todotxt",
  "name": "Todo.txt",
  "author": "staticWagomU",
  "description": "Manage and display todo.txt format files in Obsidian with specialized view and task management capabilities.",
  "repo": "staticWagomU/obsidian-todotxt"
}
```

- [ ] `id`: ユニークで短い識別子（小文字、ハイフンのみ）
- [ ] `name`: プラグイン名（manifest.jsonと一致）
- [ ] `author`: 作者名（manifest.jsonと一致）
- [ ] `description`: 簡潔な説明（100文字以内推奨）
- [ ] `repo`: GitHubリポジトリ（owner/repo形式）

#### 3.1.3 PR作成
- [ ] ブランチ作成: `git checkout -b add-todotxt-plugin`
- [ ] 変更をコミット: `git commit -m "Add Todo.txt plugin"`
- [ ] プッシュ: `git push origin add-todotxt-plugin`
- [ ] obsidianmd/obsidian-releases へPR作成
- [ ] PR説明文に以下を記載:
  - [ ] プラグインの概要
  - [ ] 主要機能
  - [ ] リリースノートへのリンク
  - [ ] 動作確認環境

### 3.2 Plugin Guidelines準拠チェック

Obsidian公式の[Plugin Guidelines](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines)を確認:

#### 3.2.1 Code Quality
- [ ] TypeScript strict モード使用
- [ ] console.log の削除（デバッグ用途のみ、本番コードにはなし）
- [ ] エラーハンドリングの適切な実装
- [ ] メモリリークがないこと
- [ ] 不要な依存関係がないこと

#### 3.2.2 User Experience
- [ ] 設定UIが直感的である
- [ ] エラーメッセージがユーザーフレンドリー
- [ ] パフォーマンスが許容範囲内（大規模ファイルでも動作）
- [ ] モバイル対応（該当する場合）

#### 3.2.3 Security & Privacy
- [ ] ネットワーク通信なし（または明示的な同意取得）
- [ ] ユーザーデータの外部送信なし
- [ ] 安全なAPI使用
- [ ] XSS/インジェクション対策

#### 3.2.4 Compatibility
- [ ] Obsidian API の安定版使用
- [ ] 他のプラグインとの競合テスト
- [ ] minAppVersion の適切な設定

#### 3.2.5 Documentation
- [ ] README.mdが充実している
- [ ] 使用方法が明確
- [ ] トラブルシューティング情報

## 4. Post-Release Tasks

### 4.1 Announcement
- [ ] GitHub Discussionsで発表（該当する場合）
- [ ] Obsidian Forumで発表（該当する場合）
- [ ] Twitter/SNSで発表（該当する場合）

### 4.2 Monitoring
- [ ] GitHub Issuesの監視設定
- [ ] フィードバック収集チャネルの確認
- [ ] エラーレポートの確認

### 4.3 Support Preparation
- [ ] Issue テンプレートの作成
  - [ ] Bug report
  - [ ] Feature request
  - [ ] Question
- [ ] Contributing ガイドラインの作成（該当する場合）
- [ ] FAQ ドキュメントの準備

## 5. Verification Before PR Merge

### 5.1 Final Checks
- [ ] リポジトリがパブリックである
- [ ] GitHubリリースが公開されている
- [ ] main.js, manifest.json, styles.css が最新リリースに含まれている
- [ ] README.mdがGitHub上で正しく表示される
- [ ] LICENSE ファイルが存在する
- [ ] community-plugins.json のJSONフォーマットが正しい

### 5.2 Test Installation
- [ ] GitHubリリースからファイルをダウンロード
- [ ] Obsidian vault の `.obsidian/plugins/todotxt/` に配置
- [ ] Obsidianを再起動
- [ ] プラグインが正常に読み込まれる
- [ ] 基本機能が動作する

## 6. obsidian-releases PR Review対応

### 6.1 Review Process
- [ ] Obsidianチームからのレビューコメント確認
- [ ] 指摘事項の修正
- [ ] 修正後の再テスト
- [ ] レビュアーへの返信

### 6.2 Common Review Points
- [ ] プラグインIDの重複確認
- [ ] 説明文の明確さ
- [ ] リポジトリの公開設定
- [ ] リリースファイルの完全性
- [ ] ガイドライン準拠

### 6.3 Approval & Merge
- [ ] レビュー承認
- [ ] PRマージ
- [ ] コミュニティプラグインリストへの反映確認（数時間〜1日程度）

## 7. Post-Merge Verification

### 7.1 Community Plugin Verification
- [ ] Obsidian設定 > コミュニティプラグイン > 閲覧 で検索可能
- [ ] プラグイン情報が正しく表示される
- [ ] インストールが正常に動作する
- [ ] アップデートが正常に動作する

### 7.2 User Feedback
- [ ] 初期ユーザーからのフィードバック収集
- [ ] バグレポートの迅速対応
- [ ] 改善提案の記録

## 8. Hotfix Process (緊急バグ修正)

### 8.1 Hotfix Criteria
- [ ] 重大バグ（クラッシュ、データ損失）
- [ ] セキュリティ問題
- [ ] 広範囲に影響する不具合

### 8.2 Hotfix Steps
- [ ] バグ修正
- [ ] テスト
- [ ] バージョン番号を v1.0.1 に更新
- [ ] CHANGELOG.md に v1.0.1 セクション追加
- [ ] GitHubリリース作成
- [ ] obsidian-releases は自動更新（新規リリースを自動検出）

## Reference Links

- [Obsidian Plugin Guidelines](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines)
- [obsidian-releases Repository](https://github.com/obsidianmd/obsidian-releases)
- [Submit Your Plugin](https://docs.obsidian.md/Plugins/Releasing/Submit+your+plugin)
- [Obsidian Developer Docs](https://docs.obsidian.md/)
- [Obsidian API](https://github.com/obsidianmd/obsidian-api)

---

Last updated: 2026-01-09
Version: 1.0
