# todo.txt パーサー 統合テストケース

> 本ドキュメントは chatgpt.md、claude.md、gemini.md の3つのテスト設計書を統合し、
> 重複を排除したものです。

---

## 1. todo.txt フォーマット仕様サマリー

### 基本構造
```
[x ] [(A)-(Z) ] [completion_date ] [creation_date ] description [+project...] [@context...] [key:value...]
```

### パースルール

| 要素 | 形式 | 位置制約 | 備考 |
|------|------|----------|------|
| 完了マーク | `x ` (小文字 + 半角スペース) | 行頭のみ | 大文字Xは無効 |
| 優先度 | `(A)` ～ `(Z)` + 半角スペース | 行頭または完了マーク直後 | 大文字のみ有効 |
| 完了日 | `YYYY-MM-DD` | 完了マーク直後 | 完了タスクのみ |
| 作成日 | `YYYY-MM-DD` | 完了日/優先度の後、または行頭 | 省略可能 |
| プロジェクト | `+name` | 本文中どこでも可（前に空白必須） | 複数可 |
| コンテキスト | `@name` | 本文中どこでも可（前に空白必須） | 複数可 |
| タグ | `key:value` | 本文中どこでも可 | key/valueに空白・コロン不可 |

---

## 2. 期待結果フォーマット

```typescript
interface ParsedTodo {
  completed: boolean;
  priority: string | null;      // "A" - "Z"
  completionDate: string | null; // "YYYY-MM-DD"
  creationDate: string | null;   // "YYYY-MM-DD"
  text: string;                  // メタ要素除去後の本文
  projects: string[];            // "+" は含まない
  contexts: string[];            // "@" は含まない
  tags: Record<string, string>;  // key:value ペア
}
```

---

## 3. テストケース一覧

### 3.1 基本パターン（正常系）

| ID | 入力 | 期待結果 |
|----|------|----------|
| B-01 | `Call Mom` | completed=false, priority=null, text="Call Mom" |
| B-02 | `(A) Call Mom` | priority="A", text="Call Mom" |
| B-03 | `(Z) Low priority task` | priority="Z", text="Low priority task" |
| B-04 | `2024-01-15 Created task` | creationDate="2024-01-15", text="Created task" |
| B-05 | `(A) 2024-01-15 Priority with date` | priority="A", creationDate="2024-01-15", text="Priority with date" |
| B-06 | `x Completed task` | completed=true, text="Completed task" |
| B-07 | `x 2024-01-20 Completed with date` | completed=true, completionDate="2024-01-20", text="Completed with date" |
| B-08 | `x 2024-01-20 2024-01-15 Both dates` | completed=true, completionDate="2024-01-20", creationDate="2024-01-15", text="Both dates" |
| B-09 | `Task +project` | projects=["project"], text="Task" |
| B-10 | `Task @context` | contexts=["context"], text="Task" |
| B-11 | `Task due:2024-12-31` | tags={due:"2024-12-31"}, text="Task" |

### 3.2 複数要素の組み合わせ

| ID | 入力 | 期待結果 |
|----|------|----------|
| C-01 | `(A) Call Mom +Family @phone` | priority="A", projects=["Family"], contexts=["phone"], text="Call Mom" |
| C-02 | `(B) 2024-01-10 Report +Work @computer due:2024-01-31` | priority="B", creationDate="2024-01-10", projects=["Work"], contexts=["computer"], tags={due:"2024-01-31"}, text="Report" |
| C-03 | `x 2024-01-12 2024-01-01 Release v1.2 +Product @office pri:A` | completed=true, completionDate="2024-01-12", creationDate="2024-01-01", projects=["Product"], contexts=["office"], tags={pri:"A"}, text="Release v1.2" |
| C-04 | `(Z) 2024-01-02 Multi @a @b +p1 +p2 k:v` | priority="Z", creationDate="2024-01-02", contexts=["a","b"], projects=["p1","p2"], tags={k:"v"}, text="Multi" |
| C-05 | `Task +proj1 +proj2` | projects=["proj1","proj2"], text="Task" |
| C-06 | `Task @home @work @mobile` | contexts=["home","work","mobile"], text="Task" |
| C-07 | `Task due:2024-12-31 priority:high est:2h` | tags={due:"2024-12-31", priority:"high", est:"2h"}, text="Task" |
| C-08 | `Middle +project text @context here` | projects=["project"], contexts=["context"], text="Middle text here" |
| C-09 | `+project @context Description at end` | projects=["project"], contexts=["context"], text="Description at end" |

### 3.3 優先度エッジケース

| ID | 入力 | 期待結果 | 備考 |
|----|------|----------|------|
| P-01 | `(A) Valid` | priority="A" | 最高優先度 |
| P-02 | `(M) Valid` | priority="M" | 中間優先度 |
| P-03 | `(Z) Valid` | priority="Z" | 最低優先度 |
| P-04 | `(a) lowercase` | priority=null, text="(a) lowercase" | 小文字は無効 |
| P-05 | `(1) digit` | priority=null, text="(1) digit" | 数字は無効 |
| P-06 | `(AA) multiple` | priority=null, text="(AA) multiple" | 複数文字は無効 |
| P-07 | `() empty` | priority=null, text="() empty" | 空は無効 |
| P-08 | `( A) space inside` | priority=null, text="( A) space inside" | 内部スペースは無効 |
| P-09 | `(A)NoSpace` | priority=null, text="(A)NoSpace" | 後続スペース必須 |
| P-10 | `Task (A) middle` | priority=null, text="Task (A) middle" | 行頭以外は無効 |
| P-11 | `(Á) accented` | priority=null, text="(Á) accented" | アクセント付きは無効 |

### 3.4 日付エッジケース

| ID | 入力 | 期待結果 | 備考 |
|----|------|----------|------|
| D-01 | `2024-01-01 Year start` | creationDate="2024-01-01" | 年始 |
| D-02 | `2024-12-31 Year end` | creationDate="2024-12-31" | 年末 |
| D-03 | `2024-02-29 Leap year` | creationDate="2024-02-29" | うるう年 |
| D-04 | `2000-01-01 Y2K` | creationDate="2000-01-01" | 2000年 |
| D-05 | `9999-12-31 Far future` | creationDate="9999-12-31" | 遠い未来 |
| D-06 | `2024/01/15 Slash format` | creationDate=null, text="2024/01/15 Slash format" | スラッシュ形式は無効 |
| D-07 | `2024-1-15 No padding` | creationDate=null, text="2024-1-15 No padding" | ゼロパディング必須 |
| D-08 | `24-01-15 Short year` | creationDate=null, text="24-01-15 Short year" | 4桁年必須 |
| D-09 | `2024-13-01 Invalid month` | 実装依存（バリデーション有無） | 無効な月 |
| D-10 | `2024-02-30 Invalid day` | 実装依存（バリデーション有無） | 無効な日 |
| D-11 | `2023-02-29 Not leap year` | 実装依存（バリデーション有無） | うるう年でない |
| D-12 | `Task 2024-01-15 middle` | creationDate=null, text="Task 2024-01-15 middle" | 途中の日付は本文扱い |
| D-13 | `(A) 2024-01-02T10:00 ISO` | priority="A", creationDate=null, text="2024-01-02T10:00 ISO" | ISO形式は無効 |
| D-14 | `x 2024-01-20 Only completion` | completed=true, completionDate="2024-01-20" | 完了日のみ |

### 3.5 プロジェクトエッジケース

| ID | 入力 | 期待結果 | 備考 |
|----|------|----------|------|
| PR-01 | `+a Minimal` | projects=["a"], text="Minimal" | 最短 |
| PR-02 | `+Project_Name-123 Complex` | projects=["Project_Name-123"], text="Complex" | 複合文字 |
| PR-03 | `+日本語 Japanese` | projects=["日本語"], text="Japanese" | Unicode（実装依存） |
| PR-04 | `+UPPERCASE Upper` | projects=["UPPERCASE"], text="Upper" | 大文字 |
| PR-05 | `+lowercase Lower` | projects=["lowercase"], text="Lower" | 小文字 |
| PR-06 | `+ Space after` | projects=[], text="+ Space after" | 空白後は無効 |
| PR-07 | `Task+ Trailing` | projects=[], text="Task+ Trailing" | 末尾+は無効 |
| PR-08 | `Task+inline No space` | projects=[], text="Task+inline No space" | 前に空白必須 |
| PR-09 | `+A+B Chained` | projects=["A+B"], text="Chained" | 連続（非空白として認識） |
| PR-10 | `++double Double plus` | 実装依存 | ダブルプラス |

### 3.6 コンテキストエッジケース

| ID | 入力 | 期待結果 | 備考 |
|----|------|----------|------|
| CX-01 | `@a Minimal` | contexts=["a"], text="Minimal" | 最短 |
| CX-02 | `@home_office-2024 Complex` | contexts=["home_office-2024"], text="Complex" | 複合文字 |
| CX-03 | `@会社 Japanese` | contexts=["会社"], text="Japanese" | Unicode（実装依存） |
| CX-04 | `@ Empty` | contexts=[], text="@ Empty" | 空は無効 |
| CX-05 | `email@example.com Email` | contexts=[], text="email@example.com Email" | メールアドレスは無効 |
| CX-06 | `Task@inline No space` | contexts=[], text="Task@inline No space" | 前に空白必須 |
| CX-07 | `@@double Double at` | 実装依存 | ダブルアット |

### 3.7 タグ（key:value）エッジケース

| ID | 入力 | 期待結果 | 備考 |
|----|------|----------|------|
| T-01 | `due:2024-12-31 Date value` | tags={due:"2024-12-31"}, text="Date value" | 日付値 |
| T-02 | `pri:A Single char` | tags={pri:"A"}, text="Single char" | 単一文字値 |
| T-03 | `a:b Minimal` | tags={a:"b"}, text="Minimal" | 最短 |
| T-04 | `key:value_with-special Complex` | tags={key:"value_with-special"}, text="Complex" | 複合値 |
| T-05 | `key: Empty value` | 実装依存（空値の扱い） | 空値 |
| T-06 | `:value No key` | tags={}, text=":value No key" | キーなしは無効 |
| T-07 | `key:val:ue Multi colon` | 実装依存 | valueにコロン |
| T-08 | `http://example.com URL` | 実装依存 | URLの扱い |
| T-09 | `time:10:30 Time value` | 実装依存 | 時刻値 |
| T-10 | `key1:val1 key2:val2 Multiple` | tags={key1:"val1", key2:"val2"}, text="Multiple" | 複数タグ |
| T-11 | `key :value Space before` | tags={}, text="key :value Space before" | スペース入りは無効 |
| T-12 | `キー:値 Japanese` | 実装依存（Unicode対応） | 日本語タグ |

### 3.8 完了マークエッジケース

| ID | 入力 | 期待結果 | 備考 |
|----|------|----------|------|
| X-01 | `x Task` | completed=true, text="Task" | 正常 |
| X-02 | `X Task uppercase` | completed=false, text="X Task uppercase" | 大文字は無効 |
| X-03 | `xTask no space` | completed=false, text="xTask no space" | スペース必須 |
| X-04 | ` x Leading space` | completed=false, text="x Leading space" | 行頭以外は無効 |
| X-05 | `Task x middle` | completed=false, text="Task x middle" | 途中は無効 |
| X-06 | `xx Double x` | completed=false, text="xx Double x" | 重複は無効 |
| X-07 | `xylophone lesson` | completed=false, text="xylophone lesson" | 公式例示 |
| X-08 | `x\t2024-01-01 Tab after` | 実装依存 | タブの扱い |

### 3.9 空白・特殊文字

| ID | 入力 | 期待結果 | 備考 |
|----|------|----------|------|
| S-01 | `Task  double  space` | text="Task  double  space" | 複数スペース保持 |
| S-02 | `  Leading spaces` | 実装依存（トリム有無） | 先頭スペース |
| S-03 | `Trailing spaces  ` | 実装依存（トリム有無） | 末尾スペース |
| S-04 | `Task\ttab` | 実装依存 | タブの扱い |
| S-05 | `Task "quotes" here` | text=`Task "quotes" here` | ダブルクォート |
| S-06 | `Task 'apostrophe' here` | text=`Task 'apostrophe' here` | シングルクォート |
| S-07 | `Task \`backtick\` here` | text=`Task \`backtick\` here` | バッククォート |
| S-08 | `Task <html> tags` | text=`Task <html> tags` | HTMLタグ |
| S-09 | `Task & ampersand` | text=`Task & ampersand` | アンパサンド |
| S-10 | `Task 日本語 🎉 emoji` | text="Task 日本語 🎉 emoji" | Unicode・絵文字 |
| S-11 | `全角　スペース +P` | 実装依存 | 全角スペースの扱い |
| S-12 | `CRLF line\r\n` | 実装依存（末尾\r除去推奨） | Windows改行 |

### 3.10 複数行パース

| ID | 入力 | 期待結果 | 備考 |
|----|------|----------|------|
| M-01 | `Task1\nTask2` | 2件: ["Task1", "Task2"] | 基本 |
| M-02 | `(A) Task1\n(B) Task2` | 2件: [{priority:"A"}, {priority:"B"}] | 優先度付き |
| M-03 | `Task1\n\nTask2` | 2件（空行スキップ）または3件 | 空行の扱い |
| M-04 | `Task1\n   \nTask2` | 実装依存 | 空白のみの行 |
| M-05 | `# Comment\nTask` | 実装依存 | コメント行 |
| M-06 | `Task1\r\nTask2` | 2件 | Windows改行 |
| M-07 | `` (空文字列) | 0件 | 空ファイル |
| M-08 | `\n\n\n` | 0件（空行のみ） | 空行のみ |

### 3.11 異常系・境界値

| ID | 入力 | 期待結果 | 備考 |
|----|------|----------|------|
| E-01 | `` (空文字列) | 0件または空タスク | 空入力 |
| E-02 | `   ` (スペースのみ) | 0件または空タスク | 空白のみ |
| E-03 | `a` | text="a" | 1文字タスク |
| E-04 | `(A)` | 実装依存（空本文） | 優先度のみ |
| E-05 | `x ` | 実装依存（完了日欠落） | 完了マークのみ |
| E-06 | `2024-01-01` | creationDate="2024-01-01", text="" | 日付のみ |
| E-07 | `x 2024-13-01 Invalid` | completed=true, errors有無は実装依存 | 無効な完了日 |
| E-08 | 1000文字のタスク | 正常パース | 長いタスク |
| E-09 | 100個の+projectを含む | 100個のprojects配列 | 大量プロジェクト |
| E-10 | 100個の@contextを含む | 100個のcontexts配列 | 大量コンテキスト |
| E-11 | 100個のkey:valueを含む | 100個のtags | 大量タグ |
| E-12 | `\x00` (NULLバイト) | エラーまたは無視 | 不正バイト |
| E-13 | 10000行のファイル | 全行パース | パフォーマンス |

### 3.12 実用的な複合パターン

| ID | 入力 | 期待結果 |
|----|------|----------|
| R-01 | `(A) 2024-01-13 Submit expense report +Work @computer due:2024-01-20` | priority="A", creationDate="2024-01-13", projects=["Work"], contexts=["computer"], tags={due:"2024-01-20"}, text="Submit expense report" |
| R-02 | `(B) Prepare slides +VimConf @focus est:2h owner:hayashi` | priority="B", projects=["VimConf"], contexts=["focus"], tags={est:"2h", owner:"hayashi"}, text="Prepare slides" |
| R-03 | `x 2024-01-10 2024-01-02 Fix prod incident +Ops @oncall ticket:INC1234` | completed=true, completionDate="2024-01-10", creationDate="2024-01-02", projects=["Ops"], contexts=["oncall"], tags={ticket:"INC1234"}, text="Fix prod incident" |
| R-04 | `2024-01-05 Weekly review +Personal @home recur:weekly` | creationDate="2024-01-05", projects=["Personal"], contexts=["home"], tags={recur:"weekly"}, text="Weekly review" |
| R-05 | `(C) 2024-01-03 Call Mom +Family @phone note:Remember_to_ask_about_trip` | priority="C", creationDate="2024-01-03", projects=["Family"], contexts=["phone"], tags={note:"Remember_to_ask_about_trip"}, text="Call Mom" |
| R-06 | `x 2024-01-18 2024-01-10 Bug fix complete +webapp @dev issue:123` | completed=true, completionDate="2024-01-18", creationDate="2024-01-10", projects=["webapp"], contexts=["dev"], tags={issue:"123"}, text="Bug fix complete" |
| R-07 | `Shopping list +home +errands @weekend` | projects=["home","errands"], contexts=["weekend"], text="Shopping list" |
| R-08 | `Call John about +ProjectX @phone @waiting due:2024-02-01` | projects=["ProjectX"], contexts=["phone","waiting"], tags={due:"2024-02-01"}, text="Call John about" |

---

## 4. テストデータファイル例

### sample_todo.txt
```
(A) 2024-01-13 Submit expense report +Work @computer due:2024-01-20
(B) Prepare slides +VimConf @focus est:2h owner:hayashi
2024-01-05 Weekly review +Personal @home recur:weekly
Call Mom +Family @phone
Fix issue due:2024-01-02
xylophone lesson
X 2024-01-01 Make resolutions
```

### sample_done.txt
```
x 2024-01-10 2024-01-02 Fix prod incident +Ops @oncall ticket:INC1234
x 2024-01-12 2024-01-01 Release v1.2 +Product @office pri:A
```

### edge_cases.txt
```
(a) lowercase priority
(AA) multiple chars
(A)NoSpace
Task (A) middle
2024/01/15 slash date
2024-1-15 no padding
Task+inline no space
Task@inline no space
xTask no space
X uppercase completion
email@example.com in text
http://example.com URL
key:val:ue multiple colons
+ empty project
@ empty context
:value no key
```

---

## 5. テストカバレッジサマリー

| カテゴリ | テストケース数 | カバー内容 |
|----------|----------------|------------|
| 基本パターン | 11 | 各要素の単独正常系 |
| 複数要素の組み合わせ | 9 | 2要素以上の組み合わせ |
| 優先度エッジケース | 11 | A-Z、無効形式、位置異常 |
| 日付エッジケース | 14 | 形式、境界日付、無効日付 |
| プロジェクトエッジケース | 10 | 形式、Unicode、無効形式 |
| コンテキストエッジケース | 7 | 形式、メールアドレス、複数指定 |
| タグエッジケース | 12 | 形式、コロン、URL、複数タグ |
| 完了マークエッジケース | 8 | x形式、位置、大文字 |
| 空白・特殊文字 | 12 | 空白、引用符、Unicode、絵文字 |
| 複数行パース | 8 | 改行コード、空行、コメント |
| 異常系・境界値 | 13 | 空入力、長大入力、不正バイト |
| 実用的な複合パターン | 8 | 実際の使用シーンを想定 |
| **合計** | **113** | |

---

## 6. 実装時の注意点

### 6.1 実装方針の決定が必要な項目

以下の項目は実装方針により期待結果が変わるため、事前に方針を固定すること：

1. **完了タスクの優先度**
   - 保持する / 削除する / 無視する

2. **日付のバリデーション**
   - フォーマットチェックのみ / 実在日付チェックまで

3. **Unicode対応**
   - プロジェクト・コンテキスト名に日本語を許可するか

4. **先頭・末尾の空白**
   - トリムする / 保持する

5. **コメント行**
   - `#`で始まる行をコメント扱いするか

6. **タグのvalueにコロン**
   - 最初のコロンで分割 / 無効扱い

7. **エラーハンドリング**
   - 無効な行をスキップ / エラーを返す

---

## 7. 仕様参照

- [todo.txt format](https://github.com/todotxt/todo.txt) - 公式リポジトリ
