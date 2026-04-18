# Knip／jscpd ローカル検証パイプライン実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 仕様 `docs/superpowers/specs/2026-04-18-knip-jscpd-local-verify-design.md` に従い、dev 依存として **Knip** と **jscpd** を導入し、**`bun run verify`** で `astro check` → Knip → jscpd を順に実行できるようにする（CI・pre-push は入れない）。

**Architecture:** Knip は Astro 公式プラグインの既定エントリを活かしつつ、`tsconfig.json` の `@/*` を Knip の `paths` で明示して alias 解決を安定させる。jscpd はルートの **`.jscpd.json`** で閾値・除外・対象パスを固定し、`src` 以下の TypeScript と `.astro`（markup として拡張子マッピング）を走査する。自動テストは追加せず、**各コマンドの退出コード**で検証する。

**Tech Stack:** Bun、`package.json`（`type: module`）、Astro 6、TypeScript 5、Knip、jscpd。

**Spec:** `docs/superpowers/specs/2026-04-18-knip-jscpd-local-verify-design.md`

---

## ファイル構成（変更予定）

| ファイル | 責務 |
|----------|------|
| `package.json` | `devDependencies` に `knip` / `jscpd` を追加。`scripts`: `knip`, `jscpd`, `verify` |
| `knip.json` | Knip のプロジェクト設定（`paths`、`$schema`）。最初は最小構成 |
| `.jscpd.json` | 重複検出の閾値、`src` パス、除外、`minTokens`、レポーター |
| `bun.lock` | `bun add` により更新 |

---

### Task 1: dev 依存の追加

**Files:**

- Modify: `package.json`
- Modify: `bun.lock`

- [ ] **Step 1: パッケージを追加する**

Run:

```bash
cd /Users/kazkiueda/Sources/github.com/themeaningof8/kazkiueda_com
bun add -d knip jscpd
```

Expected: `package.json` の `devDependencies` に `knip` と `jscpd` が追加され、`bun.lock` が更新される。

- [ ] **Step 2: コミット**

```bash
git add package.json bun.lock
git commit -m "chore(dev): add knip and jscpd as devDependencies"
```

---

### Task 2: `knip.json` を追加する

**Files:**

- Create: `knip.json`

- [ ] **Step 1: 設定ファイルを作成する**

`tsconfig.json` の `compilerOptions.paths`（`@/*` → `src/*`）と整合させる。Astro プラグインは Knip が既定で取り込むため、ここでは **alias の明示**に留める。

```json
{
  "$schema": "https://unpkg.com/knip@6/schema.json",
  "paths": {
    "@/*": ["src/*"]
  }
}
```

- [ ] **Step 2: Knip を単体実行する**

Run:

```bash
bunx knip
```

Expected: プロセスが終了する（初回は未使用依存や未使用 export の報告が多数出てもよい。退出コード 1 になり得る）。

- [ ] **Step 3: コミット**

```bash
git add knip.json
git commit -m "chore: add knip.json with path aliases"
```

---

### Task 3: `.jscpd.json` を追加する

**Files:**

- Create: `.jscpd.json`

- [ ] **Step 1: 設定ファイルを作成する**

`dist`・依存・生成物を除外し、`src` を対象にする。`.astro` は組み込み言語一覧に無いため、**`markup` フォーマットに `astro` 拡張子を割り当て**てトークナイズさせる（重複検出は厳密な AST ではなくトークン類似のため、仕様どおり「目安」として扱う）。

```json
{
  "path": ["src"],
  "minTokens": 60,
  "threshold": null,
  "reporters": ["console"],
  "gitignore": true,
  "absolute": true,
  "ignore": [
    "**/node_modules/**",
    "**/dist/**",
    "**/.astro/**",
    "**/*.min.*"
  ],
  "format": ["typescript", "javascript", "css", "markup"],
  "formatsExts": {
    "markup": ["astro"]
  }
}
```

`formatsExts` は `@jscpd/core` の `IOptions` にある公式キー（例: `markup` フォーマットに `astro` 拡張子を割り当てる）。

- [ ] **Step 2: jscpd を単体実行する**

Run:

```bash
bunx jscpd
```

Expected: 設定が読み込まれ、コンソールにレポートが出力され、終了コード 0（閾値未設定のため通常は成功）または重複検出時は非ゼロ。

- [ ] **Step 3: コミット**

```bash
git add .jscpd.json
git commit -m "chore: add jscpd config for src duplication scan"
```

---

### Task 4: `package.json` の scripts

**Files:**

- Modify: `package.json`（`scripts` セクション）

- [ ] **Step 1: スクリプトを追加する**

既存の `"check": "astro check"` を再利用し、次を **追加**する（既存キーは変更しない）。

```json
"knip": "knip",
"jscpd": "jscpd",
"verify": "bun run check && bun run knip && bun run jscpd"
```

- [ ] **Step 2: 各スクリプトを確認する**

Run:

```bash
bun run check
```

Expected: 従来どおり Astro チェックが通る。

Run:

```bash
bun run knip
```

Expected: Knip が実行される。

Run:

```bash
bun run jscpd
```

Expected: jscpd が実行される。

- [ ] **Step 3: コミット**

```bash
git add package.json
git commit -m "chore: add verify script chaining check, knip, and jscpd"
```

---

### Task 5: エンドツーエンド確認（任意の調整）

**Files:**

- Modify（必要時のみ）: `knip.json`, `.jscpd.json`

- [ ] **Step 1: `verify` を実行する**

Run:

```bash
bun run verify
```

Expected: `check` → `knip` → `jscpd` が順に実行される。いずれかが失敗すると **その時点で連鎖が止まり**非ゼロ終了する。

- [ ] **Step 2: 初回のみ発生しうる対応**

- Knip が動的インポートや Astro のエントリで誤検知する場合、仕様どおり **`knip.json` の `ignore`、`ignoreDependencies` 等で最小限除外**する。
- jscpd のノイズが多い場合は **`minTokens` を 80〜100 程度に上げる**、または `ignore` にパスを追加する。

調整した場合は理由が分かるコミットメッセージで保存する。

```bash
git add knip.json .jscpd.json
git commit -m "chore: tune knip/jscpd ignores after first verify run"
```

---

## セルフレビュー（計画側）

| 仕様セクション | 対応タスク |
|----------------|------------|
| 目的 A（未使用）／B（重複） | Task 2, 3 |
| ローカル・CI しない・フックなし | タスク本文で明示（ツールのみ） |
| Bun・個別 script・verify 順序 | Task 1, 4 |
| メンテ（設定更新） | Task 5 |

プレースホルダ除去: jscpd のキー名差異は **実装時に README で確かめる**旨を Task 3 に明示済み。

---

## 実行の引き渡し

計画は `docs/superpowers/plans/2026-04-18-knip-jscpd-local-verify-plan.md` に保存済み。

**実行方法の選択:**

1. **Subagent-Driven（推奨）** — タスクごとに新しいサブエージェントを起票し、タスク間でレビューする。`superpowers:subagent-driven-development` を使用。
2. **インライン実行** — このセッションで `superpowers:executing-plans` に従いチェックポイント付きで連続実行。

どちらで進めますか？
