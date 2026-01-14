# PBI-047 設計書 - 自然言語タスク追加 (AI変換)

## 1. 概要

### 1.1 目的
ユーザーが自然言語でタスクを入力すると、AIがtodo.txt形式に変換し、指定されたファイルに追記する機能を提供する。

### 1.2 主な機能
- 自然言語からtodo.txt形式への自動変換
- OpenRouter経由での複数AIモデル利用
- プロジェクト・コンテキスト・優先度・期限の自動抽出
- 編集可能なプレビュー機能
- 複数タスクの一括入力対応
- 設定可能な自動リトライ機能

### 1.3 依存関係
- **PBI-046**: サイドパネルUI（AIボタン配置先）

---

## 2. ユーザーストーリー

> **As a** todo.txtユーザー
> **I want** 自然言語でタスクを説明するとtodo.txt形式に変換して追加できる
> **So that** 形式を覚えなくても自然な文章でタスクを追加できる

---

## 3. 機能仕様

### 3.1 入力インターフェース

#### 3.1.1 起動方法
| 方法 | 説明 |
|------|------|
| コマンドパレット | `Ctrl/Cmd + P` → "Todo.txt: AI Add Task" |
| サイドパネル | AIボタン（✨）をクリック |
| メインビュー | AIボタン（✨）をクリック |

#### 3.1.2 入力形式
- テキストエリアに自然言語でタスクを入力
- 複数タスクは改行または箇条書き（`-`、`*`、`・`）で区切り
- ハッシュタグでコンテキストを指定可能

**入力例：**
```
プロジェクトAの件
田中さんにメールを送る #pc
来週金曜日までに資料を作成
会議室を予約する #phone
```

### 3.2 todo.txt形式への変換

#### 3.2.1 変換ルール

| 要素 | 入力形式 | 出力形式 | 備考 |
|------|----------|----------|------|
| 作成日 | （自動付与） | `YYYY-MM-DD` | 設定でON/OFF可能 |
| 優先度 | 「重要」「急ぎ」「緊急」等 | `(A)`〜`(Z)` | ユーザー明示時のみ |
| プロジェクト | 「〇〇の件」「〇〇関連」等 | `+ProjectName` | 文頭パターンで判定 |
| コンテキスト | `#keyword` | `@keyword` | 文末のハッシュタグ |
| 期限 | 「来週まで」「金曜日に」等 | `due:YYYY-MM-DD` | 相対日付を絶対日付に変換 |

#### 3.2.2 プロジェクト判定パターン
以下のパターンが文頭にある場合、後続タスクにプロジェクトを付与：
- `〇〇についてです。`
- `〇〇の件`
- `〇〇関連`

**変換例：**
```
入力: プロジェクトAの件
      田中さんにメールを送る #pc
      来週金曜日までに資料を作成

出力:
2026-01-14 田中さんにメールを送る +ProjectA @pc
2026-01-14 資料を作成 +ProjectA due:2026-01-17
```

#### 3.2.3 コンテキストのマジックキーワード
文末に `#keyword` 形式で記述することでコンテキストを指定。

**デフォルト対応：**
| 入力 | 出力 |
|------|------|
| `#pc` | `@pc` |
| `#phone` | `@phone` |
| `#home` | `@home` |
| `#office` | `@office` |
| `#email` | `@email` |

設定画面でカスタムキーワードを追加可能。

#### 3.2.4 優先度の判定
ユーザーが明示的に指定した場合のみ優先度を付与：

| 入力キーワード | 優先度 |
|----------------|--------|
| 「緊急」「最優先」「すぐに」 | `(A)` |
| 「重要」「優先」 | `(B)` |
| 「急ぎ」 | `(C)` |

#### 3.2.5 期限の自動抽出
自然言語の日付表現を解析し、`due:YYYY-MM-DD` 形式に変換：

| 入力表現 | 変換結果（例：今日が2026-01-14の場合） |
|----------|----------------------------------------|
| 「今日中に」 | `due:2026-01-14` |
| 「明日まで」 | `due:2026-01-15` |
| 「来週まで」 | `due:2026-01-21` |
| 「来週金曜日に」 | `due:2026-01-17` |
| 「1月20日まで」 | `due:2026-01-20` |
| 「月末まで」 | `due:2026-01-31` |

### 3.3 プレビュー・編集機能

#### 3.3.1 フロー
```
[入力] → [AI生成] → [プレビュー表示] → [編集可能] → [確認] → [ファイル追記]
```

#### 3.3.2 プレビュー画面
- 生成されたtodo.txt形式をテキストエリアで表示
- ユーザーは内容を編集可能
- 「追加」ボタンでファイルに追記
- 「キャンセル」ボタンで破棄
- 「再生成」ボタンでAI再実行

### 3.4 複数タスク一括入力

#### 3.4.1 区切り文字
- 改行
- 箇条書き記号（`-`、`*`、`・`）

#### 3.4.2 プロジェクトの継承
文頭でプロジェクトを宣言すると、後続のすべてのタスクに同じプロジェクトが付与される。

---

## 4. 設定仕様

### 4.1 設定項目

#### 4.1.1 OpenRouter設定

| 設定項目 | 型 | 説明 | デフォルト |
|----------|-----|------|------------|
| API Key | Password | OpenRouter APIキー | - |
| Model | Dropdown | 使用するモデル | `anthropic/claude-3-haiku` |

**モデル選択肢（例）：**
- `anthropic/claude-3-haiku` - 高速・低コスト
- `anthropic/claude-3.5-sonnet` - 高精度
- `openai/gpt-4o-mini` - バランス型
- `google/gemini-flash-1.5` - 高速

#### 4.1.2 出力設定

| 設定項目 | 型 | 説明 | デフォルト |
|----------|-----|------|------------|
| Include Creation Date | Toggle | 作成日を含めるか | ON |

#### 4.1.3 コンテキスト設定

| 設定項目 | 型 | 説明 | デフォルト |
|----------|-----|------|------------|
| Custom Contexts | KeyValue[] | カスタムキーワード→コンテキストのマッピング | `[]` |

**設定例：**
```json
{
  "customContexts": {
    "パソコン": "pc",
    "スマホ": "phone",
    "買い物": "shopping"
  }
}
```

#### 4.1.4 リトライ設定

| 設定項目 | 型 | 説明 | デフォルト |
|----------|-----|------|------------|
| Auto Retry | Toggle | APIエラー時の自動リトライ | ON |
| Max Retries | Number | 最大リトライ回数 | 3 |
| Retry Delay | Number | リトライ初期間隔（ミリ秒） | 1000 |

### 4.2 設定画面UI

```
┌──────────────────────────────────────────────────┐
│ Todo.txt Settings                                │
├──────────────────────────────────────────────────┤
│                                                  │
│ 【AI Task Addition】                             │
│                                                  │
│ OpenRouter API Key                               │
│ ┌──────────────────────────────────────────┐    │
│ │ ••••••••••••••••••••••••••••••••         │    │
│ └──────────────────────────────────────────┘    │
│ Get your API key at https://openrouter.ai       │
│                                                  │
│ Model                                            │
│ ┌──────────────────────────────────────────┐    │
│ │ anthropic/claude-3-haiku              ▼  │    │
│ └──────────────────────────────────────────┘    │
│                                                  │
│ Include Creation Date                    [ON]   │
│                                                  │
│ ─────────────────────────────────────────────   │
│                                                  │
│ 【Custom Contexts】                              │
│ ┌────────────────┬─────────────────────────┐    │
│ │ Input Keyword  │ Output Context          │    │
│ ├────────────────┼─────────────────────────┤    │
│ │ パソコン        │ pc                      │    │
│ │ スマホ          │ phone                   │    │
│ └────────────────┴─────────────────────────┘    │
│ [+ Add Custom Context]                          │
│                                                  │
│ ─────────────────────────────────────────────   │
│                                                  │
│ 【Retry Settings】                               │
│                                                  │
│ Auto Retry on Error                      [ON]   │
│ Max Retries                              [3]    │
│ Retry Delay (ms)                         [1000] │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 5. 技術仕様

### 5.1 アーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│                    Obsidian Plugin                       │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   UI Layer  │  │  Core Logic │  │  OpenRouter     │  │
│  │             │  │             │  │  Service        │  │
│  │  - Dialog   │  │  - Parser   │  │                 │  │
│  │  - Preview  │  │  - Prompt   │  │  - API Client   │  │
│  │  - Settings │  │  - Retry    │  │  - Retry Logic  │  │
│  │             │  │             │  │                 │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│         │                │                  │           │
│         └────────────────┴──────────────────┘           │
│                          │                              │
│                  ┌───────▼───────┐                      │
│                  │  File System  │                      │
│                  │  (Vault API)  │                      │
│                  └───────────────┘                      │
└─────────────────────────────────────────────────────────┘
```

### 5.2 モジュール構成

```
src/
├── ai/
│   ├── openrouter.ts           # OpenRouter APIクライアント
│   ├── openrouter.test.ts
│   ├── prompt.ts               # プロンプトテンプレート
│   ├── prompt.test.ts
│   ├── retry.ts                # リトライロジック
│   └── retry.test.ts
├── ui/
│   └── dialogs/
│       ├── AITaskInputDialog.ts      # 自然言語入力ダイアログ
│       ├── AITaskInputDialog.test.ts
│       ├── AITaskPreviewDialog.ts    # プレビュー・編集ダイアログ
│       └── AITaskPreviewDialog.test.ts
└── settings.ts                 # 設定拡張（既存ファイル）
```

### 5.3 OpenRouterサービス

#### 5.3.1 インターフェース

```typescript
export interface OpenRouterConfig {
  apiKey: string;
  model: string;
  retryConfig: RetryConfig;
}

export interface RetryConfig {
  enabled: boolean;
  maxRetries: number;
  initialDelayMs: number;
}

export interface ConversionResult {
  success: boolean;
  todoLines?: string[];
  error?: string;
}

export class OpenRouterService {
  constructor(config: OpenRouterConfig);

  async convertToTodotxt(
    naturalLanguage: string,
    currentDate: string,
    customContexts: Record<string, string>
  ): Promise<ConversionResult>;
}
```

#### 5.3.2 API呼び出し

```typescript
const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${this.config.apiKey}`,
    "HTTP-Referer": "obsidian://todotxt",
    "X-Title": "Obsidian Todo.txt Plugin",
  },
  body: JSON.stringify({
    model: this.config.model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: naturalLanguage },
    ],
  }),
});
```

### 5.4 AIプロンプト設計

#### 5.4.1 システムプロンプト

```typescript
export function buildSystemPrompt(
  currentDate: string,
  customContexts: Record<string, string>
): string {
  const contextMappings = {
    pc: "pc",
    phone: "phone",
    home: "home",
    office: "office",
    email: "email",
    ...customContexts,
  };

  const contextList = Object.entries(contextMappings)
    .map(([k, v]) => `#${k} → @${v}`)
    .join("\n");

  return `あなたはタスク管理の専門家です。ユーザーの自然言語入力をtodo.txt形式に変換してください。

## 変換ルール
1. 各タスクは1行で表現
2. 作成日は ${currentDate} を使用（YYYY-MM-DD形式で先頭に付与）
3. プロジェクトは +ProjectName 形式
4. コンテキストは @context 形式
5. 期限は due:YYYY-MM-DD 形式

## プロジェクト判定
文頭が以下のパターンの場合、後続のタスクにプロジェクトを付与：
- 「〇〇についてです」
- 「〇〇の件」
- 「〇〇関連」

## コンテキスト判定
入力文末の #keyword を以下のルールで変換：
${contextList}

## 優先度判定
- 「緊急」「最優先」「すぐに」→ (A)
- 「重要」「優先」→ (B)
- 「急ぎ」→ (C)
- それ以外は優先度なし

## 期限判定
相対的な日付表現を絶対日付に変換（今日: ${currentDate}）

## 出力形式
todo.txt形式のみを出力（説明不要、1タスク1行）`;
}
```

### 5.5 リトライ戦略

#### 5.5.1 リトライ対象エラー
- ネットワークエラー
- レート制限（429）
- サーバーエラー（5xx）

#### 5.5.2 Exponential Backoff

```typescript
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (!config.enabled || attempt === config.maxRetries) {
        throw error;
      }

      if (!isRetryableError(error)) {
        throw error;
      }

      const delay = config.initialDelayMs * Math.pow(2, attempt);
      await sleep(delay);
    }
  }

  throw lastError;
}
```

### 5.6 エラーハンドリング

#### 5.6.1 エラーメッセージ

| エラー種別 | メッセージ |
|-----------|-----------|
| API Key未設定 | 「OpenRouter APIキーが設定されていません。設定画面でAPIキーを入力してください。」 |
| ネットワークエラー | 「ネットワークエラーが発生しました。接続を確認してください。」 |
| レート制限 | 「API制限に達しました。しばらく待ってから再試行してください。」 |
| 無効なレスポンス | 「AIの応答を解析できませんでした。再生成してください。」 |

---

## 6. データフロー

### 6.1 タスク追加フロー

```
┌─────────────────────────────────────────────────────────────┐
│                        User                                  │
└──────────────────────────┬──────────────────────────────────┘
                           │ 1. 自然言語入力
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  AITaskInputDialog                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ プロジェクトAの件                                    │    │
│  │ 田中さんにメールを送る #pc                           │    │
│  │ 来週金曜日までに資料を作成                           │    │
│  └─────────────────────────────────────────────────────┘    │
│  [生成] [キャンセル]                                         │
└──────────────────────────┬──────────────────────────────────┘
                           │ 2. AI変換リクエスト
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  OpenRouterService                           │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ Build Prompt │ → │ API Request  │ → │ Parse Result │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                            │                                 │
│                            ▼                                 │
│                   [Retry on Error]                           │
└──────────────────────────┬──────────────────────────────────┘
                           │ 3. 変換結果
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 AITaskPreviewDialog                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 2026-01-14 田中さんにメールを送る +ProjectA @pc      │    │
│  │ 2026-01-14 資料を作成 +ProjectA due:2026-01-17       │    │
│  └─────────────────────────────────────────────────────┘    │
│  [追加] [再生成] [キャンセル]                                 │
└──────────────────────────┬──────────────────────────────────┘
                           │ 4. 確定
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    todo.txt File                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ (既存のタスク...)                                    │    │
│  │ 2026-01-14 田中さんにメールを送る +ProjectA @pc      │    │
│  │ 2026-01-14 資料を作成 +ProjectA due:2026-01-17       │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. 受け入れ基準と検証

| # | 基準 | 検証方法 |
|---|------|----------|
| 1 | AI追加ボタンクリックで自然言語入力ダイアログが開く | `pnpm build && 手動確認` |
| 2 | 入力された自然言語がtodo.txt形式に変換される | `pnpm vitest run -- -t 'natural language to todotxt'` |
| 3 | 変換結果をプレビュー表示し、編集・確認できる | `pnpm build && 手動確認` |
| 4 | 確認後にタスクがtodo.txtに追加される | `pnpm build && 手動確認` |
| 5 | OpenRouterのAPIキー設定が可能 | `pnpm build && 手動確認` |
| 6 | 複数タスクを一括で変換・追加できる | `pnpm vitest run -- -t 'multiple tasks'` |
| 7 | カスタムコンテキストマッピングが機能する | `pnpm vitest run -- -t 'custom context'` |
| 8 | APIエラー時に設定に従いリトライする | `pnpm vitest run -- -t 'retry'` |

---

## 8. 実装順序（Subtasks）

```
PBI-047 AI タスク追加
├── Subtask 1: settings.tsにAI関連設定を追加
│   - OpenRouter設定（apiKey, model）
│   - リトライ設定（enabled, maxRetries, initialDelayMs）
│   - カスタムコンテキスト設定
├── Subtask 2: リトライロジック実装（retry.ts）
│   - withRetry関数
│   - isRetryableError判定
├── Subtask 3: プロンプト設計・テスト（prompt.ts）
│   - buildSystemPrompt関数
│   - 変換ルールのユニットテスト
├── Subtask 4: OpenRouterService実装（openrouter.ts）
│   - API呼び出しロジック
│   - レスポンスパース
├── Subtask 5: AITaskInputDialog実装
│   - 自然言語入力UI
│   - 生成ボタン処理
├── Subtask 6: AITaskPreviewDialog実装
│   - プレビュー表示
│   - 編集機能
│   - 追加/再生成/キャンセル
└── Subtask 7: AIボタンとダイアログの接続
    - サイドパネルのAIボタン
    - メインビューのAIボタン
```

---

## 9. セキュリティ考慮事項

1. **APIキー保護**: Obsidianの`loadData()/saveData()`で保存、入力時はパスワードフィールド使用
2. **入力サニタイズ**: LLMレスポンスを既存パーサーで検証してから追加
3. **ネットワーク許可**: manifest.jsonに外部接続先を明記

---

## 10. 参照

- [OpenRouter API Docs](https://openrouter.ai/docs)
- [todo.txt Format](https://github.com/todotxt/todo.txt)
- [Obsidian Plugin API](https://docs.obsidian.md/Plugins)
- todonoeai設計書（`docs/design/specification.md`）
