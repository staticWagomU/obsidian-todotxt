# PBI-005 Refinement Notes: タスク編集

## User Story
**As an** Obsidianユーザー
**I can** タスク編集
**So that** 内容修正

## Refined Acceptance Criteria

### AC1: 既存タスクの説明文・優先度・プロジェクト・コンテキストを編集できる
- **Verification**: `pnpm vitest run -t 'edit task properties'`
- **Expected test cases**: 5-7 tests
  - 説明文のみ編集
  - 優先度のみ編集 (A → B, なし → A, A → なし)
  - プロジェクト追加・変更・削除
  - コンテキスト追加・変更・削除
  - 複数プロパティ同時編集

### AC2: 編集時に完了状態・作成日・完了日を保持する
- **Verification**: `pnpm vitest run -t 'preserve task metadata on edit'`
- **Expected test cases**: 4-6 tests
  - 未完了タスクの作成日保持
  - 完了タスクの完了日・作成日保持
  - 完了状態（x マーク）保持
  - タグ（due:, t:, rec:）保持
  - エッジケース: 作成日なしタスクの編集
  - エッジケース: 不正な日付形式の保持

### AC3: 編集したタスクをファイルの正しい行位置に保存できる
- **Verification**: `pnpm vitest run -t 'update task at correct line'`
- **Expected test cases**: 5-7 tests
  - 先頭行タスク更新
  - 中間行タスク更新
  - 末尾行タスク更新
  - 複数行ファイルでの特定行更新
  - エッジケース: 1行のみのファイル
  - エッジケース: 空行を含むファイル
  - エッジケース: 行番号が範囲外の場合のエラー処理

### AC4: 編集後のタスクをtodo.txt形式で正しくシリアライズできる
- **Verification**: `pnpm vitest run -t 'serialize edited task'`
- **Expected test cases**: 3-4 tests
  - serializeTodo関数の再利用確認（Sprint 3実装済）
  - 編集後の完了タスクフォーマット検証
  - 編集後の未完了タスクフォーマット検証
  - プロジェクト・コンテキスト順序保持

### AC5: View層でタスク編集後の表示を更新できる (統合テスト)
- **Verification**: `pnpm vitest run -t 'update view after task edit'`
- **Expected test cases**: 4-5 tests
  - editTask関数での編集・保存統合
  - View層でのファイル読み込み→編集→再表示フロー
  - 編集前後のタスクリスト整合性
  - エラー時のロールバック（該当行が存在しない場合）
  - エッジケース: 同時編集競合（ファイル変更検出）

## Sprint 4 Retrospective Actions Applied

### 1. サブタスク計画精度向上
- **各サブタスクの具体的なテストケース数を見積もり**
- AC1: 5-7 tests (editTask関数の基本機能)
- AC2: 4-6 tests (メタデータ保持ロジック)
- AC3: 5-7 tests (ファイル更新ロジック)
- AC4: 3-4 tests (既存関数再利用)
- AC5: 4-5 tests (統合テスト)
- **Total estimate**: 21-29 tests (前回Sprint 4: 20 tests)

### 2. エッジケース事前洗い出し
**ファイル操作系**
- 1行のみのファイル編集
- 空行を含むファイル編集
- 行番号範囲外エラー
- ファイル同時編集競合

**データ保持系**
- 作成日なしタスクの編集
- 不正な日付形式の保持
- 完了タスクの完了日保持
- タグ（due:, t:, rec:）保持

**編集操作系**
- 優先度削除（A → なし）
- プロジェクト削除
- コンテキスト削除
- 説明文空白化（エラー扱いとするか要検討）

### 3. 統合テストスコープ明確化
- **AC5の統合テストはReact UI実装なしで完了**
- 対象範囲: editTask関数 + ファイル更新 + View層データフロー
- React UIコンポーネント（EditDialog等）は別PBI（PBI-019: 構造化フォーム）で実装
- 統合テストはモック化されたView層でのデータ整合性検証に限定

## Subtask Plan Estimation (Planning時の参考)

### Subtask 1: editTask関数の実装
- **Type**: behavioral
- **Tests**: 5-7 tests
- **Description**: 既存タスクのプロパティを編集する関数

### Subtask 2: メタデータ保持ロジックの実装
- **Type**: behavioral
- **Tests**: 4-6 tests
- **Description**: 編集時に完了状態・日付を保持

### Subtask 3: updateTaskAtLine関数の実装
- **Type**: behavioral
- **Tests**: 5-7 tests
- **Description**: ファイルの特定行を更新

### Subtask 4: serializeTodo統合テスト
- **Type**: structural (既存関数再利用)
- **Tests**: 3-4 tests
- **Description**: Sprint 3で実装済みのserializeTodoとの統合検証

### Subtask 5: View層統合テスト
- **Type**: behavioral
- **Tests**: 4-5 tests
- **Description**: editAndUpdateTask統合関数 + View層データフロー検証

## Dependencies
- **PBI-002**: Parser (done) - Todo型定義、parseTodo関数
- **PBI-003**: serializeTodo関数 (done) - AC4で再利用

## Definition of Ready Checklist
- [x] AI can complete without human input
- [x] User story has role/capability/benefit
- [x] At least 3 acceptance criteria with verification (5項目)
- [x] Dependencies resolved or not blocking (PBI-002, PBI-003 done)
- [x] Sprint 4 retrospective actions applied
- [x] Test case estimates provided
- [x] Edge cases identified
- [x] Integration test scope clarified

## Status: READY ✓
