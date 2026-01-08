# Oxlint & Oxfmt 導入ガイド

このドキュメントでは、ESLint から Oxlint への移行と、フォーマッターとしての Oxfmt の導入方法を説明します。

## 背景

### なぜ Oxlint を選んだか

| 項目 | ESLint | Oxlint |
|------|--------|--------|
| 実行速度 | 数秒 | 3-4ms (50-100倍高速) |
| 依存パッケージ数 | 288個 | 2個 |
| 言語 | JavaScript | Rust |

Oxlint は Rust で書かれており、ESLint と比較して圧倒的に高速です。開発中の快適な体験のために導入しました。

### ハイブリッドアプローチ

ただし、Obsidian プラグイン固有のルール（`eslint-plugin-obsidianmd`）は Oxlint では対応できないため、以下のハイブリッド構成を採用しています：

- **Oxlint**: 一般的なルール（`no-unused-vars`, `no-console` など）
- **ESLint**: Obsidian 固有のルール（`eslint-plugin-obsidianmd`）のみ

---

## 導入手順

### Step 1: パッケージのインストール

```bash
pnpm add -D oxlint oxfmt
```

### Step 2: Oxlint 設定ファイルの作成

`oxlint.json` をプロジェクトルートに作成：

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["typescript"],
  "categories": {
    "correctness": "error",
    "suspicious": "warn",
    "pedantic": "off",
    "perf": "warn",
    "style": "off"
  },
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "warn",
    "typescript/no-explicit-any": "warn"
  },
  "ignorePatterns": [
    "node_modules",
    "dist",
    "main.js",
    "esbuild.config.mjs",
    "version-bump.mjs",
    "refferencies"
  ]
}
```

#### 設定のポイント

- **`$schema`**: VSCode などで自動補完を有効化
- **`plugins`**: TypeScript プラグインを有効化
- **`categories`**: ルールカテゴリごとの重要度設定
  - `correctness`: バグの原因になるコード → エラー
  - `suspicious`: 怪しいコード → 警告
  - `perf`: パフォーマンス問題 → 警告
  - `pedantic`, `style`: 細かいスタイル → オフ（Oxfmt に任せる）
- **`ignorePatterns`**: リント対象外のファイル/ディレクトリ

### Step 3: ESLint 設定の調整

`eslint.config.mts` を修正して、Oxlint と重複するルールを無効化：

```typescript
import tseslint from 'typescript-eslint';
import obsidianmd from "eslint-plugin-obsidianmd";
import { globalIgnores } from "eslint/config";

// eslint-plugin-obsidianmd のみを有効化
// 一般的なルール（no-unused-vars等）は Oxlint で実行
export default tseslint.config(
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            'eslint.config.mts',
            'vitest.config.ts',
            'scrum.ts',
          ]
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  ...obsidianmd.configs.recommended,
  {
    // Oxlint に任せるルールを無効化（obsidianmd.configs.recommended の後に適用）
    rules: {
      "no-undef": "off",
      "no-console": "off",
    },
  },
  globalIgnores([
    "node_modules",
    "dist",
    "esbuild.config.mjs",
    "version-bump.mjs",
    "versions.json",
    "main.js",
    "refferencies",
  ]),
);
```

#### 変更のポイント

- `globals` インポートを削除（不要になった）
- Oxlint で処理するルール（`no-undef`, `no-console`）を `off` に設定
- コメントで役割分担を明記

### Step 4: npm scripts の更新

`package.json` の scripts を更新：

```json
{
  "scripts": {
    "lint": "oxlint && eslint .",
    "lint:oxlint": "oxlint",
    "lint:eslint": "eslint .",
    "format": "oxfmt --write src/",
    "format:check": "oxfmt src/"
  }
}
```

| スクリプト | 説明 |
|-----------|------|
| `lint` | Oxlint → ESLint の順で実行（高速な Oxlint で先にチェック） |
| `lint:oxlint` | Oxlint のみ実行 |
| `lint:eslint` | ESLint のみ実行 |
| `format` | Oxfmt でコードをフォーマット（上書き） |
| `format:check` | フォーマット差分をチェック（CI 用） |

### Step 5: 初回フォーマットの適用

```bash
pnpm format
```

主な変更点：
- シングルクォート → ダブルクォートへ統一
- スペーシングの調整
- 行末セミコロンの統一

---

## 使い方

### 開発時

```bash
# リント実行
pnpm lint

# フォーマット実行
pnpm format
```

### CI/CD

```bash
# フォーマットチェック（差分があれば非ゼロ終了）
pnpm format:check

# リントチェック
pnpm lint
```

---

## 参考: 関連コミット

導入時のコミット履歴：

1. **`e9f8f5a`** - `build: migrate from ESLint to Oxlint for faster linting`
   - Oxlint の導入
   - ESLint との役割分担

2. **`370baa1`** - `style: prefix unused parameters with underscore`
   - Oxlint 警告への対応

3. **`f312cfe`** - `build: add oxfmt as code formatter`
   - Oxfmt の導入

4. **`62b0d10`** - `style: apply oxfmt formatting to existing code`
   - 初回フォーマット適用

---

## トラブルシューティング

### 未使用変数の警告

Oxlint は未使用変数を検出します。意図的に使用しない場合は、プレフィックスにアンダースコアを付けてください：

```typescript
// NG: 警告が出る
function handler(event, context) { ... }

// OK: 警告が出ない
function handler(_event, context) { ... }
```

### VSCode 拡張機能

- [Oxc](https://marketplace.visualstudio.com/items?itemName=nickel.oxc) 拡張機能をインストールすると、エディタ内でリアルタイムに警告が表示されます。

---

## 参考リンク

- [Oxlint 公式サイト](https://oxc.rs/docs/guide/usage/linter.html)
- [Oxfmt 公式サイト](https://oxc.rs/docs/guide/usage/formatter.html)
- [eslint-plugin-obsidianmd](https://www.npmjs.com/package/eslint-plugin-obsidianmd)
