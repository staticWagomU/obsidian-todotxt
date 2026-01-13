2026-01-13 23:40 (JST)

```markdown
# todo.txt フォーマット仕様整理（パーサー前提の明文化）

## 1. 1行=1タスク
- 仕様根拠（公式リポジトリ）  
  URL: https://github.com/todotxt/todo.txt  
  引用: “A single line in your todo.txt text file represents a single task.” :contentReference[oaicite:0]{index=0}

## 2. 未完了タスク（Incomplete）: 3つのルール
### 2.1 優先度（Priority）
- 先頭にのみ出現可。形式は `(A)`〜`(Z)`（大文字1文字）+ 半角スペース。
- 仕様根拠  
  URL: https://github.com/todotxt/todo.txt  
  引用: “If priority exists, it ALWAYS appears first.” :contentReference[oaicite:1]{index=1}  
  引用: “The priority is an uppercase character from A-Z enclosed in parentheses and followed by a space.” :contentReference[oaicite:2]{index=2}

### 2.2 作成日（Creation date）
- 優先度がある場合は「優先度+スペース」の直後に任意で出現。優先度がない場合は先頭に出現。
- 形式は `YYYY-MM-DD`。
- 仕様根拠  
  URL: https://github.com/todotxt/todo.txt  
  引用: “A task's creation date may optionally appear directly after priority and a space.” :contentReference[oaicite:3]{index=3}  
  引用: “If there is no priority, the creation date appears first. If the creation date exists, it should be in the format `YYYY-MM-DD`.” :contentReference[oaicite:4]{index=4}

### 2.3 プロジェクト（+project）とコンテキスト（@context）
- 優先度／先頭日付（作成日）の後であれば、行内のどこにでも出現可。
- `+` / `@` は「単一スペースの直後」に出現する（前に空白が必要）。
- プロジェクト／コンテキスト名は「空白を含まない文字列」。
- 仕様根拠  
  URL: https://github.com/todotxt/todo.txt  
  引用: “Contexts and Projects may appear anywhere in the line after priority/prepended date.” :contentReference[oaicite:5]{index=5}  
  引用: “A context is preceded by a single space and an at-sign (`@`).” :contentReference[oaicite:6]{index=6}  
  引用: “A project is preceded by a single space and a plus-sign (`+`).” :contentReference[oaicite:7]{index=7}  
  引用: “A project or context contains any non-whitespace character.” :contentReference[oaicite:8]{index=8}

## 3. 完了タスク（Complete）: 2つのルール
### 3.1 完了マーク
- 行頭が `x`（小文字、大小区別あり）+ 半角スペースなら完了。
- 仕様根拠  
  URL: https://github.com/todotxt/todo.txt  
  引用: “A completed task starts with a lowercase x character (`x`).” :contentReference[oaicite:9]{index=9}  
  引用: “If a task starts with an `x` (case-sensitive and lowercase) followed directly by a space, it is marked as complete.” :contentReference[oaicite:10]{index=10}

### 3.2 完了日（Completion date）
- `x` の直後に「スペース区切り」で完了日が出現。
- 作成日が付いていたタスクは「完了日→作成日」の順で2日付が並ぶ。
- 仕様根拠  
  URL: https://github.com/todotxt/todo.txt  
  引用: “The date of completion appears directly after the x, separated by a space.” :contentReference[oaicite:11]{index=11}  
  引用: “If you’ve prepended the creation date to your task, on completion it will appear directly after the completion date.” :contentReference[oaicite:12]{index=12}

## 4. 追加メタデータ（key:value）
- 開発者拡張として `key:value` 形式を推奨。
- `key` と `value` は「空白なし」かつ「コロンを含まない」。区切りのコロンは1つ。
- 仕様根拠  
  URL: https://github.com/todotxt/todo.txt  
  引用: “Developers should use the format `key:value` to define additional metadata (e.g. `due:2010-01-02` as a due date).” :contentReference[oaicite:13]{index=13}  
  引用: “Both `key` and `value` must consist of non-whitespace characters, which are not colons. Only one colon separates the `key` and `value`.” :contentReference[oaicite:14]{index=14}

---

# パーサーの期待結果フォーマット（テストで統一）
期待結果は以下の論理フィールドで表現する（例示）:
- completed: boolean
- priority: "A".."Z" | null
- completionDate: "YYYY-MM-DD" | null
- creationDate: "YYYY-MM-DD" | null
- text: string（メタ要素除去後の本文。順序は保持）
- projects: string[]
- contexts: string[]
- tags: { [key: string]: string }（key:value）
- errors: string[]（異常系でのみ。エラーにせず“本文扱い”にする方針なら空配列でOK）

※仕様上「無効な見た目の要素」は“本文扱い”（例: `(b)`、`X ...`、`xylophone`、`@`/`+` の前に空白が無い等）。根拠: “These are not complete tasks.” に例があるため。  
URL: https://github.com/todotxt/todo.txt  
引用: “These are not complete tasks. … xylophone lesson … X 2012-01-01 … (A) x …” :contentReference[oaicite:15]{index=15}

---

# テストケース一覧（包括）

| ID | カテゴリ | 入力 | 期待結果 |
|---|---|---|---|
| B01 | 基本パターン（正常系） | `Call Mom` | completed=false, priority=null, dates=null, text=`Call Mom`, projects=[], contexts=[], tags={} |
| B02 | 基本パターン（正常系） | `(A) Call Mom` | completed=false, priority=`A`, text=`Call Mom` |
| B03 | 基本パターン（正常系） | `2011-03-02 Document +TodoTxt task format` | creationDate=`2011-03-02`, projects=[`TodoTxt`], text=`Document task format` |
| B04 | 基本パターン（正常系） | `(A) 2011-03-02 Call Mom` | priority=`A`, creationDate=`2011-03-02`, text=`Call Mom` |
| B05 | 基本パターン（正常系） | `(A) Call Mom +Family @phone` | priority=`A`, projects=[`Family`], contexts=[`phone`], text=`Call Mom` |
| B06 | 基本パターン（正常系） | `x 2011-03-03 Call Mom` | completed=true, completionDate=`2011-03-03`, text=`Call Mom` |
| B07 | 基本パターン（正常系） | `x 2011-03-02 2011-03-01 Review Tim's PR +TodoTxtTouch @github` | completed=true, completionDate=`2011-03-02`, creationDate=`2011-03-01`, projects=[`TodoTxtTouch`], contexts=[`github`], text=`Review Tim's PR` |
| B08 | 基本パターン（正常系） | `Fix issue due:2010-01-02` | completed=false, tags={due:`2010-01-02`}, text=`Fix issue` |

| C01 | 複数要素の組み合わせ | `(B) 2026-01-10 Prepare report +Work @computer due:2026-01-31` | priority=`B`, creationDate=`2026-01-10`, projects=[`Work`], contexts=[`computer`], tags={due:`2026-01-31`}, text=`Prepare report` |
| C02 | 複数要素の組み合わせ | `x 2026-01-12 2026-01-01 Release v1.2 +Product @office pri:A` | completed=true, completionDate=`2026-01-12`, creationDate=`2026-01-01`, projects=[`Product`], contexts=[`office`], tags={pri:`A`}, text=`Release v1.2` |
| C03 | 複数要素の組み合わせ | `(Z) 2026-01-02 Multi @a @b +p1 +p2 k:v` | priority=`Z`, creationDate=`2026-01-02`, contexts=[`a`,`b`], projects=[`p1`,`p2`], tags={k:`v`}, text=`Multi` |
| C04 | 複数要素の組み合わせ | `2026-01-02 (A) Misplaced priority +P` | priority=null（先頭ルール違反なので本文扱い）, creationDate=`2026-01-02`, projects=[`P`], text=`(A) Misplaced priority` |
| C05 | 複数要素の組み合わせ | `(A) x 2026-01-01 not completion` | completed=false（`x`は先頭でないので本文）, priority=`A`, text=`x 2026-01-01 not completion` |

| E-P01 | 優先度エッジ | `(A)Call Mom` | priority=null（後ろにスペース必須）, text=`(A)Call Mom` |
| E-P02 | 優先度エッジ | `(a) Call Mom` | priority=null（大文字A-Zのみ）, text=`(a) Call Mom` |
| E-P03 | 優先度エッジ | `(AA) Call Mom` | priority=null, text=`(AA) Call Mom` |
| E-P04 | 優先度エッジ | `(1) Call Mom` | priority=null, text=`(1) Call Mom` |
| E-P05 | 優先度エッジ | `(Z) Call Mom` | priority=`Z`, text=`Call Mom` |

| E-D01 | 日付エッジ | `2026-1-02 Bad date` | creationDate=null（形式`YYYY-MM-DD`必須）, text=`2026-1-02 Bad date` |
| E-D02 | 日付エッジ | `2026-01-32 Bad date` | creationDate=null（形式は満たすが暦として不正→パーサ方針で決める。推奨: errors=[`invalid_date`] か本文扱い）, text=`Bad date` or 原文保持 |
| E-D03 | 日付エッジ | `(A) 2026-01-02T10:00 Not allowed` | creationDate=null（`YYYY-MM-DD`以外は本文扱い）, text=`2026-01-02T10:00 Not allowed`（priority=`A`は有効） |
| E-D04 | 日付エッジ | `x 2026-01-02 2026-01-01 ok` | completed=true, completionDate=`2026-01-02`, creationDate=`2026-01-01`, text=`ok` |

| E-PR01 | プロジェクトエッジ | `Task+Proj` | projects=[]（前に空白がないので本文）, text=`Task+Proj` |
| E-PR02 | プロジェクトエッジ | `Task +Proj` | projects=[`Proj`], text=`Task` |
| E-PR03 | プロジェクトエッジ | `Task +` | projects=[]（空白以外必須）, text=`Task +` |
| E-PR04 | プロジェクトエッジ | `Task +プロジェクト` | projects=[`プロジェクト`]（非空白ならOK）, text=`Task` |
| E-PR05 | プロジェクトエッジ | `Task +A+B` | projects=[`A+B`]（非空白ならOK）, text=`Task` |

| E-CT01 | コンテキストエッジ | `Task@home` | contexts=[]（前に空白がないので本文）, text=`Task@home` |
| E-CT02 | コンテキストエッジ | `Task @home` | contexts=[`home`], text=`Task` |
| E-CT03 | コンテキストエッジ | `Task @` | contexts=[]（空白以外必須）, text=`Task @` |
| E-CT04 | コンテキストエッジ | `Task @家` | contexts=[`家`], text=`Task` |

| E-T01 | タグ(key:value)エッジ | `Task due:2026-01-31` | tags={due:`2026-01-31`}, text=`Task` |
| E-T02 | タグ(key:value)エッジ | `Task du e:2026-01-31` | tags={}（keyに空白→無効）, text=`Task du e:2026-01-31` |
| E-T03 | タグ(key:value)エッジ | `Task due:2026:01:31` | tags={}（valueにコロン含む→無効）, text=`Task due:2026:01:31` |
| E-T04 | タグ(key:value)エッジ | `Task :value` | tags={}（keyが空→無効）, text=`Task :value` |
| E-T05 | タグ(key:value)エッジ | `Task key:` | tags={}（valueが空→無効）, text=`Task key:` |
| E-T06 | タグ(key:value)エッジ | `Task pri:A` | tags={pri:`A`}, text=`Task`（完了で優先度が落ちる実装の保全用途） |

| E-X01 | 完了マークエッジ | `xylophone lesson` | completed=false（例示あり）, text=`xylophone lesson` |
| E-X02 | 完了マークエッジ | `X 2012-01-01 Make resolutions` | completed=false（例示あり）, text=`X 2012-01-01 Make resolutions` |
| E-X03 | 完了マークエッジ | `x 2011-03-03 Call Mom` | completed=true, completionDate=`2011-03-03`, text=`Call Mom` |
| E-X04 | 完了マークエッジ | `x\t2011-03-03 Tab after x` | completed=false（`x`直後はスペース必須。タブは別扱いにする方針なら本文）, text=`x\t2011-03-03 Tab after x` |
| E-X05 | 完了マークエッジ | ` x 2011-03-03 Leading space` | completed=false（先頭でない）, text=`x 2011-03-03 Leading space`（先頭空白トリムする実装なら要方針固定） |

| W01 | 空白・特殊文字 | `   (A) Call Mom` | priority=null（先頭厳密なら無効）。もしくは先頭トリムする実装なら priority=`A`。どちらかに統一しテストで固定 |
| W02 | 空白・特殊文字 | `(A)  Call  Mom` | priority=`A`, text=`Call  Mom`（本文の連続スペース保持） |
| W03 | 空白・特殊文字 | `(A)\t2011-03-02\tCall\tMom` | priority=null（優先度の後はスペース必須。タブ許容するなら許容仕様に明記して期待結果を変える） |
| W04 | 空白・特殊文字 | `Call Mom @phone,@home` | contexts=[]（`@phone,@home`は空白区切りでないので単一トークン扱い。方針: contexts=[`phone,@home`] もあり得るため、実装方針を固定） |
| W05 | 空白・特殊文字 | `Fix bug +Proj-1 @ctx_2 key:value_3` | projects=[`Proj-1`], contexts=[`ctx_2`], tags={key:`value_3`}, text=`Fix bug` |
| W06 | 空白・特殊文字 | `Emoji 😺 +Cat @home` | projects=[`Cat`], contexts=[`home`], text=`Emoji 😺` |
| W07 | 空白・特殊文字 | `全角　スペース +P` | projects=[]（「単一スペース」要件に従い、全角スペースでは認識しない方針）, text=`全角　スペース +P` |
| W08 | 空白・特殊文字 | `CRLF line\r\n` | 末尾の`\r`をどう扱うか固定（推奨: 行末の`\r`は除去）, text=`CRLF line` |

| M01 | 複数行パース | `Call Mom\nBuy milk` | 2タスク生成。1件目 text=`Call Mom`、2件目 text=`Buy milk` |
| M02 | 複数行パース | `\nCall Mom\n\n` | 空行は無視して1タスク（推奨）。空行もタスク扱いするなら仕様として固定 |
| M03 | 複数行パース | `(A) Call Mom\nx 2026-01-12 Done +P @c` | 2タスク。2件目 completed=true, completionDate=`2026-01-12`, projects=[`P`], contexts=[`c`], text=`Done` |
| M04 | 複数行パース | `x 2026-01-12 2026-01-01 Done\n2011-03-02 Doc +P` | 2タスク。1件目は完了+2日付、2件目は作成日付き |

| N01 | 異常系・境界値 | ``（空文字） | 0タスク（空ファイル） |
| N02 | 異常系・境界値 | `()` | priority=null, text=`()` |
| N03 | 異常系・境界値 | `(A)` | priority=null（後続スペース+本文がない。方針: 空本文許容なら priority=`A`, text=``） |
| N04 | 異常系・境界値 | `x ` | completed=true だが完了日欠落（仕様上“完了日が出る”前提なので errors=[`missing_completion_date`] 推奨） |
| N05 | 異常系・境界値 | `x 2026-13-01 Bad completion date` | completed=true, completionDate不正（errors=[`invalid_date`] 推奨） |
| N06 | 異常系・境界値 | `2011-03-02` | creationDate=`2011-03-02`, text=``（空本文を許容するか errors=[`missing_text`] にするか固定） |
| N07 | 異常系・境界値 | `(A) 2011-03-02` | priority=`A`, creationDate=`2011-03-02`, text=``（同上） |
| N08 | 異常系・境界値 | `x 2011-03-02 2011-03-01` | completed=true, completionDate=`2011-03-02`, creationDate=`2011-03-01`, text=``（同上） |
| N09 | 異常系・境界値 | `x 2011-03-02 (A) Priority after completion` | completed=true, completionDate=`2011-03-02`, priority=null（優先度は先頭のみ）, text=`(A) Priority after completion` |
| N10 | 異常系・境界値 | 長大行（例: 10万文字） | パースが落ちない（性能/メモリ）。結果は textに全量保持、projects/contexts/tags抽出がタイムアウトしない |

| R01 | 実用的な複合パターン | `(A) 2026-01-13 Submit expense report +Work @computer due:2026-01-20` | priority=`A`, creationDate=`2026-01-13`, projects=[`Work`], contexts=[`computer`], tags={due:`2026-01-20`}, text=`Submit expense report` |
| R02 | 実用的な複合パターン | `(B) Prepare slides +VimConf @focus est:2h owner:hayashi` | priority=`B`, projects=[`VimConf`], contexts=[`focus`], tags={est:`2h`, owner:`hayashi`}, text=`Prepare slides` |
| R03 | 実用的な複合パターン | `x 2026-01-10 2026-01-02 Fix prod incident +Ops @oncall ticket:INC1234` | completed=true, completionDate=`2026-01-10`, creationDate=`2026-01-02`, projects=[`Ops`], contexts=[`oncall`], tags={ticket:`INC1234`}, text=`Fix prod incident` |
| R04 | 実用的な複合パターン | `2026-01-05 Weekly review +Personal @home recur:weekly` | creationDate=`2026-01-05`, projects=[`Personal`], contexts=[`home`], tags={recur:`weekly`}, text=`Weekly review` |
| R05 | 実用的な複合パターン | `(C) 2026-01-03 Call Mom +Family @phone note:Remember_to_ask_about_trip` | priority=`C`, creationDate=`2026-01-03`, projects=[`Family`], contexts=[`phone`], tags={note:`Remember_to_ask_about_trip`}, text=`Call Mom` |

---

# 最後に：テストデータファイル例（todo.txt / done.txt 相当）

## sample_todo.txt
(A) 2026-01-13 Submit expense report +Work @computer due:2026-01-20
(B) Prepare slides +VimConf @focus est:2h owner:hayashi
2026-01-05 Weekly review +Personal @home recur:weekly
Call Mom +Family @phone
Fix issue due:2010-01-02
xylophone lesson
X 2012-01-01 Make resolutions

## sample_done.txt
x 2026-01-10 2026-01-02 Fix prod incident +Ops @oncall ticket:INC1234
x 2026-01-12 2026-01-01 Release v1.2 +Product @office pri:A

---

# 仕様参照（根拠URLまとめ）
- https://github.com/todotxt/todo.txt （公式リポジトリのREADME相当。引用は上記各所）
```

