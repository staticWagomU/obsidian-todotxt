# Proposal: `ct:` Extension Field for todo.txt

**Status**: Draft
**Author**: wagomu
**Created**: 2026-03-17
**Version**: 0.1.0

---

## 1. Abstract

本提案は、todo.txt形式に完了時刻（Completion Time）を記録するための拡張タグ `ct:` を定義する。

todo.txt標準仕様では完了日（`YYYY-MM-DD`）を記録できるが、時刻の記録手段がない。日次の作業ログ分析やポモドーロ的なワークフローにおいて「いつ終わったか」の時刻情報は有用であり、標準の `key:value` タグ拡張として最小限の仕様で実現する。

---

## 2. Motivation

### 2.1 課題

- todo.txt標準の完了日は日付のみ（`YYYY-MM-DD`）。同じ日に複数タスクを完了した場合、完了順序が失われる
- タスクの所要時間を推定するには、完了時刻が必要（作成日時 + 完了日時 → 経過時間）
- 日次レビューやタイムトラッキングの用途で、時刻の粒度が求められる場面がある

### 2.2 設計目標

1. **todo.txt哲学への準拠** — プレーンテキストで人間が読める
2. **最小限の仕様** — 既存のパーサーに影響を与えない `key:value` タグとして実装
3. **冗長性の排除** — 日付は標準の `completionDate` に委ね、時刻のみを保持
4. **実装の容易さ** — 任意のプログラミング言語で簡潔にパース可能

---

## 3. Specification

### 3.1 タグ名

```
ct
```

- **意味**: Completion Time（完了時刻）
- **命名根拠**: 既存の `t:`（threshold）に対する `ct:`（completion time）として直感的。2文字のタグ名はtodo.txtの慣例に沿う（`t:`, `h:` 等）

### 3.2 値のフォーマット

```
ct:HH:MM
```

| 要素 | 説明 | 範囲 |
|------|------|------|
| `HH` | 時（24時間制、ゼロ埋め） | `00` - `23` |
| `:` | 区切り文字 | 固定 |
| `MM` | 分（ゼロ埋め） | `00` - `59` |

**正規表現**:

```
ct:([01]\d|2[0-3]):[0-5]\d
```

### 3.3 秒の扱い

秒は**含めない**。理由:

1. タスク管理において秒単位の精度は実用上不要
2. フォーマットの簡潔さを維持（`HH:MM` = 5文字）
3. 人間が手入力する場合の負担を軽減

### 3.4 タイムゾーン

タイムゾーン情報は**含めない**。理由:

1. todo.txt標準の `completionDate` にもタイムゾーン情報はない
2. タスク管理はローカルタイムで運用するのが一般的
3. シンプルさの維持

アプリケーションは**ローカルタイム（ユーザーのシステム時刻）**で `ct:` を記録すること。

### 3.5 配置ルール

`ct:` は todo.txt の description 部分に他のタグと同様に配置する。

```
x 2026-03-17 2026-03-15 レポートを書く +work @pc due:2026-03-17 ct:14:30
^            ^           ^              ^     ^   ^              ^
完了マーク   完了日      作成日         説明文  project context tag  ct:タグ
```

配置位置に制約はないが、慣例として**行末の他のタグに続けて配置**することを推奨する。

---

## 4. Semantics

### 4.1 ライフサイクル

`ct:` タグは `completionDate` と同一のライフサイクルを持つ。

| イベント | completionDate | ct: | 説明 |
|----------|---------------|-----|------|
| タスク完了 | 設定される | 設定される | 同時に記録 |
| タスク未完了に戻す | 削除される | 削除される | 同時に削除 |
| タスク作成 | なし | なし | 未完了タスクには付与しない |
| タスク編集 | 変化なし | 変化なし | 完了時刻は編集対象としない |

### 4.2 完了状態との整合性

| 状態 | 有効な組み合わせ |
|------|-----------------|
| `x` あり + `completionDate` あり + `ct:` あり | 有効（推奨） |
| `x` あり + `completionDate` あり + `ct:` なし | 有効（`ct:` は任意） |
| `x` なし + `ct:` あり | **無効** — 未完了タスクに `ct:` があってはならない |
| `x` あり + `completionDate` なし + `ct:` あり | **無効** — 日付なしに時刻のみは意味をなさない |

### 4.3 `ct:` の任意性

`ct:` タグの付与は**任意（OPTIONAL）**である。

- 完了時に `ct:` を付与するかどうかはアプリケーションの設定に委ねる
- `ct:` がない完了タスクは従来どおり有効
- パーサーは `ct:` の有無にかかわらず正常に動作すること

---

## 5. Examples

### 5.1 基本的な使用例

```
# 未完了タスク（ct: なし）
(A) 2026-03-15 レポートを書く +work @pc due:2026-03-17

# 完了タスク（ct: あり）
x 2026-03-17 2026-03-15 レポートを書く +work @pc due:2026-03-17 ct:14:30

# 完了タスク（ct: なし — 従来互換）
x 2026-03-17 2026-03-15 レポートを書く +work @pc due:2026-03-17
```

### 5.2 時刻のバリエーション

```
x 2026-03-17 朝一の作業 ct:06:00
x 2026-03-17 午前中のタスク ct:11:45
x 2026-03-17 午後のタスク ct:15:30
x 2026-03-17 深夜作業 ct:23:59
x 2026-03-17 日付変わった直後 ct:00:05
```

### 5.3 他のタグとの共存

```
x 2026-03-17 2026-03-10 定期レポート +reporting @pc due:2026-03-17 rec:1w ct:09:15
x 2026-03-17 2026-03-16 (B) 緊急対応 +ops @phone pri:B ct:22:10
```

### 5.4 無効な例

```
# NG: 未完了タスクにct:
(A) 2026-03-15 タスク ct:14:30

# NG: 秒を含む
x 2026-03-17 タスク ct:14:30:00

# NG: 12時間制
x 2026-03-17 タスク ct:2:30PM

# NG: ゼロ埋めなし
x 2026-03-17 タスク ct:9:05

# NG: 範囲外
x 2026-03-17 タスク ct:25:00
x 2026-03-17 タスク ct:14:60
```

---

## 6. Implementation Guide

### 6.1 パース

`ct:` は標準の `key:value` タグとしてパースする。既存の todo.txt パーサーが `key:value` 形式をサポートしている場合、追加のパースロジックは不要。

**バリデーション**（疑似コード）:

```
function isValidCompletionTime(value):
    match value against /^([01]\d|2[0-3]):[0-5]\d$/
    return matched
```

### 6.2 完了操作

タスクを完了にする際の処理フロー:

```
function completeTask(task):
    task.completed = true
    task.completionDate = today()           // YYYY-MM-DD
    task.tags["ct"] = formatTime(now())     // HH:MM
    return task
```

### 6.3 未完了に戻す操作

```
function uncompleteTask(task):
    task.completed = false
    task.completionDate = null
    delete task.tags["ct"]
    return task
```

### 6.4 シリアライズ

タスクをテキストに変換する際、`ct:` は他のタグと同様に description 末尾に出力する。

```
function serialize(task):
    parts = []
    if task.completed:
        parts.append("x")
        parts.append(task.completionDate)
    if task.priority:
        parts.append("(" + task.priority + ")")
    if task.creationDate:
        parts.append(task.creationDate)
    parts.append(task.description)    // ct: は tags として description 内に含まれる
    return join(parts, " ")
```

### 6.5 ソート

`ct:` を用いたソートを実装する場合、`completionDate` + `ct:` を結合して時系列順にソートする。

```
function completionDateTime(task):
    if task.completionDate and task.tags["ct"]:
        return task.completionDate + "T" + task.tags["ct"]
    else if task.completionDate:
        return task.completionDate + "T00:00"    // 時刻なしは0時扱い
    else:
        return null
```

---

## 7. Interoperability

### 7.1 既存ツールとの互換性

`ct:` は標準の `key:value` タグ形式に従うため、既存の todo.txt ツールとの互換性は高い。

| ツール | 動作 |
|--------|------|
| `ct:` 非対応パーサー | `ct:14:30` を通常のタグとして保持（データ消失なし） |
| テキストエディタ | `ct:14:30` はプレーンテキストとして表示（可読性あり） |
| `ct:` 対応アプリ | 完了時刻として解釈・活用 |

### 7.2 データ移行

- `ct:` 非対応ツール → 対応ツール: 既存の完了タスクに `ct:` がないだけで問題なし（`ct:` は任意）
- `ct:` 対応ツール → 非対応ツール: `ct:` は不明なタグとして保持され、データは失われない

---

## 8. Rejected Alternatives

検討したが採用しなかった代替案を記録する。

### 8.1 `done:HH:MM`

- **却下理由**: `done.txt`（完了タスクのアーカイブファイル）の概念と名前が衝突し、混乱を招く

### 8.2 `completed_at:YYYY-MM-DDTHH:MM:SS`

- **却下理由**: `completionDate` と日付が重複する。todo.txt の簡潔さに反する。タグ名が長い

### 8.3 `ct:HH:MM:SS`（秒を含む）

- **却下理由**: タスク管理に秒単位の精度は不要。フォーマットが冗長になる

### 8.4 completionDate 自体を ISO 8601 拡張（`YYYY-MM-DDTHH:MM`）

- **却下理由**: todo.txt 標準のパーサーが `YYYY-MM-DD` を前提としており、破壊的変更になる。行頭の固定フィールドを変更するのは影響範囲が大きすぎる

### 8.5 `ft:HH:MM`（Finished Time）

- **却下理由**: `ct:` のほうが `completionDate` との対応関係が明確。`f` から始まるタグは将来的に他の用途と競合する可能性がある

---

## 9. Future Considerations

本提案のスコープ外だが、将来的に検討し得る拡張を記録する。

### 9.1 開始時刻タグ `st:HH:MM`（Start Time）

完了時刻と組み合わせて所要時間を算出するための開始時刻。`ct:` と同様のフォーマットで `st:` として定義する可能性がある。

```
x 2026-03-17 2026-03-17 レポートを書く st:13:00 ct:14:30
# → 所要時間 1時間30分
```

### 9.2 経過時間タグ `elapsed:DURATION`

ISO 8601 Duration 形式で所要時間を直接記録する案。`st:` + `ct:` から算出する方法と、直接記録する方法のどちらが適切かは今後の検討事項。

```
x 2026-03-17 タスク ct:14:30 elapsed:PT1H30M
```

---

## 10. References

- [todo.txt format specification](https://github.com/todotxt/todo.txt)
- [todo.txt add-ons: key:value tags](https://github.com/todotxt/todo.txt#add-on-file-format-definitions)
- [ISO 8601 Time format](https://en.wikipedia.org/wiki/ISO_8601#Times)

---

## Changelog

| Version | Date | Description |
|---------|------|-------------|
| 0.1.0 | 2026-03-17 | Initial draft |
