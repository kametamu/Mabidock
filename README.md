# マビノギ ポータル

GitHub Pages 向けの、個人用マビノギ情報ポータルです。Vite + React + TypeScript + HashRouter で構成され、サーバを立てずに静的配信できます。

## セットアップ

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
npm run preview
```

## データ編集

`src/data` 配下の JSON を編集すると、各ページの表示内容を更新できます。

- `links.json`: Home の便利リンク
- `training.json`: 育成ページ
- `money.json`: 稼ぎページ
- `dailies.json`: 日課ページ（`type` と `cooldownDays` を保持）

## GitHub Pages デプロイ

1. このリポジトリを GitHub に push する。
2. GitHub の `Settings` → `Pages` を開く。
3. `Build and deployment` の `Source` を **GitHub Actions** に変更する。
4. `main` ブランチへ push すると、`.github/workflows/deploy-pages.yml` が起動して自動デプロイされる。

> `HashRouter` を使用しているため、GitHub Pages での直接アクセス時の 404 を回避できます。
