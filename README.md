# バーコード買取価格チェッカー

スマホのカメラで商品のバーコード(JAN/EAN)をスキャンすると、買取店ごとの想定価格を
比較表示するNext.jsアプリです。

デフォルトはサンプルデータのみで動作します。駿河屋・ブックオフの検索結果ページを
実際にスクレイピングして価格を取り込むスクリプト(`npm run scrape`)も用意していますが、
**検索URLのパターンは未検証**です(下記「実データの取り込みについて」を参照)。

## セットアップ

```bash
npm install
npm run seed   # data/store.db にサンプル商品データを投入
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開く。

- `/` — バーコードスキャン画面。カメラへのアクセスが必要なため、スマホの場合は
  HTTPS(またはlocalhost)でアクセスすること
- `/demo-barcodes` — サンプル商品のバーコード画像一覧。実物の商品が手元になくても、
  この画面をスマホのカメラで映せば動作確認できる

## 仕組み

- `lib/db.ts` — SQLite(`better-sqlite3`)の接続とスキーマ定義
- `lib/sample-products.ts` — ダミーの商品・価格データ(架空の値)
- `scripts/seed.ts` — サンプルデータを `data/store.db` に投入するシードスクリプト
- `app/api/lookup/route.ts` — バーコードでDBを検索するAPI
- `components/BarcodeScanner.tsx` — `@zxing/browser` を使ったカメラでのバーコード読み取り
- `app/page.tsx` — スキャン→検索→価格比較表示のメインUI
- `app/demo-barcodes/page.tsx` — `jsbarcode` でサンプル商品のバーコード画像を描画

### スクレイピングでの実データ取り込み(`npm run scrape`)

- `lib/scrapers/targets.ts` — 駿河屋・ブックオフの検索URLを組み立てる(**未検証**、下記参照)
- `lib/scrapers/fetch-page.ts` — 検索結果ページを取得し、タグを除去したプレーンテキストに変換
- `lib/scrapers/extract.ts` — テキストをClaude(`claude-sonnet-5`、tool useで構造化出力)に渡し、
  商品名・価格をJSONで抽出。サイトごとにCSSセレクタを個別に書くより、HTML構造の変化に強い
- `lib/scrapers/target-barcodes.ts` — スクレイピング対象のJANコードを列挙する場所(初期状態は空)
- `scripts/scrape-seed.ts` — 上記を組み合わせて対象バーコードを1件ずつ取得し、DBへ書き込む
  (店ごとに`REQUEST_DELAY_MS`だけ間隔を空けて、逐次実行)

**このセッションの実行環境は外部ネットワークへのアクセスが制限されており、実際に
駿河屋・ブックオフへアクセスして動作検証することができませんでした。** そのため
`lib/scrapers/targets.ts` の検索URLパターンは私(Claude)の一般知識に基づく推測で、
実際のサイトの検索窓の挙動と一致しない可能性があります。実行前に次の手順で確認・
修正してください。

1. 通常のブラウザで各サイトを開き、検索窓にJANコード(例: `4901234567894`)を1件入力して検索
2. 遷移後のURLの形式を確認し、`lib/scrapers/targets.ts` の `searchUrl` をそれに合わせて修正
3. `lib/scrapers/target-barcodes.ts` の `TARGET_BARCODES` に、手元にある商品のJANコードを
   数件追加
4. `.env.local` に `ANTHROPIC_API_KEY` を設定
5. `npm run scrape` を実行し、コンソールのログで取得結果を確認しながら調整

利用規約を確認したうえで、対象は数件程度・手動実行に留め、自動化された定期クロールや
ブロック回避のための偽装は行わないでください。
