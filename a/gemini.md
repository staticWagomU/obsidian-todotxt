プロのQAエンジニアとして、`todo.txt` パーサーの堅牢性と正確性を保証するためのテスト設計を行います。

このフォーマットは一見シンプルですが、「位置依存の要素（日付、優先度）」と「位置非依存の要素（タグ、コンテキスト）」が混在しているため、境界値や組み合わせのテストが非常に重要です。

---

### 1. todo.txt 仕様の整理（テストの前提）

テストケースを設計する前に、期待値を確定させるためのパースルール（仕様）を定義します。

* **基本構造:** `x (Priority) YYYY-MM-DD YYYY-MM-DD Body text +project @context key:value`
* **ルール:**
1. **完了マーク (`x`):** 行頭にあり、直後に半角スペースが必要。
2. **優先度 (`(A)-(Z)`):** 行頭（完了マークがある場合はその直後）にあり、大文字英字1文字、直後に半角スペースが必要。
3. **日付:**
* 日付が1つだけ: 「作成日」とみなす。
* 日付が2つある: 1つ目が「完了日」、2つ目が「作成日」とみなす（完了マークがある場合のみ有効）。
* フォーマットは `YYYY-MM-DD` 固定。


4. **プロジェクト (`+`) / コンテキスト (`@`):** 本文中のどこにあってもよい。記号の直後は空白であってはならない。
5. **メタデータ (`key:value`):** 本文中のどこにあってもよい。スペースを含まない文字列。



---

### 2. テストケース一覧

期待結果は検証しやすいよう、構造化データ（JSON風の擬似コード）で記述します。

#### 2.1. 基本パターン（正常系）

| ID | カテゴリ | 入力 | 期待結果 |
| --- | --- | --- | --- |
| **B-01** | 基本 | `Simple task` | `{"text": "Simple task"}` |
| **B-02** | 優先度 | `(A) Priority task` | `{"priority": "A", "text": "Priority task"}` |
| **B-03** | 作成日 | `2024-01-15 Created task` | `{"created": "2024-01-15", "text": "Created task"}` |
| **B-04** | 完了 | `x Completed task` | `{"completed": true, "text": "Completed task"}` |
| **B-05** | プロジェクト | `Task for +MobileApp` | `{"text": "Task for +MobileApp", "projects": ["MobileApp"]}` |
| **B-06** | コンテキスト | `Call mom @phone` | `{"text": "Call mom @phone", "contexts": ["phone"]}` |
| **B-07** | メタデータ | `Buy milk due:2024-01-20` | `{"text": "Buy milk due:2024-01-20", "tags": {"due": "2024-01-20"}}` |

#### 2.2. 複数要素の組み合わせ

| ID | カテゴリ | 入力 | 期待結果 |
| --- | --- | --- | --- |
| **C-01** | フル構成 | `(A) 2024-01-15 Measure performance +Server @aws` | `{"priority": "A", "created": "2024-01-15", "text": "Measure performance +Server @aws", "projects": ["Server"], "contexts": ["aws"]}` |
| **C-02** | 完了フル構成 | `x (B) 2024-01-16 2024-01-01 Closed ticket +Support` | `{"completed": true, "priority": "B", "completedDate": "2024-01-16", "created": "2024-01-01", "text": "Closed ticket +Support", "projects": ["Support"]}` |
| **C-03** | 複数タグ | `Update docs +v1 +v2 @api @public` | `{"projects": ["v1", "v2"], "contexts": ["api", "public"]}` |

#### 2.3. エッジケース：優先度・完了マーク

| ID | カテゴリ | 入力 | 期待結果 |
| --- | --- | --- | --- |
| **E-P-01** | 小文字優先度 | `(a) Invalid priority` | `{"text": "(a) Invalid priority", "priority": null}` (仕様上は大文字のみ) |
| **E-P-02** | 途中出現 | `Check (A) later` | `{"text": "Check (A) later", "priority": null}` (行頭ではない) |
| **E-P-03** | スペースなし | `(A)NoSpace` | `{"text": "(A)NoSpace", "priority": null}` |
| **E-X-01** | スペースなし完了 | `xDone` | `{"text": "xDone", "completed": false}` |
| **E-X-02** | 大文字X | `X Not completed` | `{"text": "X Not completed", "completed": false}` |

#### 2.4. エッジケース：日付

| ID | カテゴリ | 入力 | 期待結果 |
| --- | --- | --- | --- |
| **E-D-01** | 日付のみ | `2024-01-01` | `{"created": "2024-01-01", "text": ""}` |
| **E-D-02** | 不正フォーマット | `2024/01/01 Slash format` | `{"text": "2024/01/01 Slash format", "created": null}` |
| **E-D-03** | 完了日のみ? | `x 2024-01-20 Just one date` | `{"completed": true, "created": "2024-01-20", "completedDate": null}` (※仕様上、1つの場合は作成日とみなされることが多いが、実装依存確認要) |
| **E-D-04** | 存在しない日 | `2024-02-31 Invalid date` | `{"created": "2024-02-31"}` (日付の妥当性チェックを行うか、文字列として扱うかによる) |

#### 2.5. エッジケース：プロジェクト・コンテキスト・タグ

| ID | カテゴリ | 入力 | 期待結果 |
| --- | --- | --- | --- |
| **E-T-01** | 接頭辞のみ | `Test + @ context` | `{"text": "Test + @ context", "projects": [], "contexts": []}` (単独の記号はタグにならない) |
| **E-T-02** | 記号連結 | `++double @@at` | `{"projects": ["+double"], "contexts": ["@at"]}` または除外（実装仕様による） |
| **E-T-03** | URL混同 | `Check http://google.com` | `{"tags": {}}` (`http: //` がkey:valueと誤認されないこと) |
| **E-T-04** | キーのみ | `key: value` | `{"tags": {}}` (コロンの後にスペースがあるためタグではない) |
| **E-T-05** | 重複 | `Task +work +work` | `{"projects": ["work", "work"]}` (重複を許容するかユニークにするか確認) |

#### 2.6. 空白・特殊文字・日本語

| ID | カテゴリ | 入力 | 期待結果 |
| --- | --- | --- | --- |
| **S-01** | マルチバイト | `(A) 掃除 +家事 @自宅` | `{"priority": "A", "text": "掃除 +家事 @自宅", "projects": ["家事"], "contexts": ["自宅"]}` |
| **S-02** | 絵文字 | `(A) Call 📞 +📱` | `{"priority": "A", "text": "Call 📞 +📱", "projects": ["📱"]}` |
| **S-03** | 余分な空白 | `(A)  Double  Space` | `{"priority": "A", "text": "Double  Space"}` (本文の空白は維持されるべき) |
| **S-04** | 行頭空白 | ` (A) Indented` | `{"text": " (A) Indented", "priority": null}` (行頭スペースにより優先度認識不可) |

#### 2.7. 異常系・境界値

| ID | カテゴリ | 入力 | 期待結果 |
| --- | --- | --- | --- |
| **A-01** | 空行 | `(空文字)` | `Ignored / Null` |
| **A-02** | 空白のみ | `       ` | `Ignored / Null` |
| **A-03** | 極端な長さ | `(A) 2024-01-01 [1万文字の文字列]...` | バッファオーバーフロー等が起きず正常にパースされること |

---

### 3. テストデータファイルの例 (todo_test_sample.txt)

自動テストスクリプトに読み込ませるための、上記パターンを網羅したサンプルファイルです。

```text
(A) Call Mom +Family @Phone
(B) Schedule eye exam @Health
(A) 2024-01-20 Write parser tests +Coding
x 2024-01-21 2024-01-14 Create github repo +Coding @Computer
x 2024-01-21 Pick up milk @Grocery
2024-01-15 Learn Regex
Plan vacation +Hawaii id:123 due:2024-08-01
Check http://example.com/resource
(C)   Space preservation   test
x (A) 2024-01-22 2024-01-01 Priority on completed task
日本語のタスク +開発 @会社
Task with no metadata
+LonelyProject
@LonelyContext
key:value
(b) Lowercase priority is not a priority
xNoSpaceCompletion
2024/01/01 Invalid date format

```

---

### 次のステップ

これらのテストケースを使用して、具体的なテストコード（Pythonの `pytest` や JavaScriptの `Jest` など）の実装テンプレートを作成することも可能です。

**実装言語に合わせてテストコードの雛形を作成しましょうか？**
