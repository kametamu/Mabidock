# マビノギ ポータル（GitHub Pages向け純静的サイト）

npm不要・ビルド不要でそのまま配信できる構成です。

## 構成

- `index.html`
- `style.css`
- `app.js`（Hashルーティング: `#/home`, `#/training`, `#/money`, `#/dailies`）
- `data/*.json`（表示データ）

## ローカル確認

```bash
python -m http.server 8000
```

ブラウザで以下を開きます。

- <http://localhost:8000/#/home>

## GitHub Pages公開

### 方法A: GitHub Actions（推奨）

1. このリポジトリの `main` に push
2. GitHub の **Settings > Pages > Build and deployment > Source** を **GitHub Actions** に設定
3. Actions の `Deploy static site to GitHub Pages` が成功したら公開URLにアクセス

### 方法B: Deploy from a branch

`main` ブランチの `/ (root)` を公開対象にすれば表示できます。
このリポジトリはビルド済み不要の静的ファイルのみなので branch deploy でも動きます。

> 真っ白な場合は、古いデプロイキャッシュの可能性があるため、空コミットを push して再デプロイすると解消しやすいです。

```bash
git commit --allow-empty -m "Trigger Pages redeploy"
git push
```

## データ追加

`data/links.json`, `data/training.json`, `data/money.json`, `data/dailies.json` を編集すると画面に反映されます。
外部リンクは自動で別タブ（`target="_blank" rel="noopener noreferrer"`）で開きます。
