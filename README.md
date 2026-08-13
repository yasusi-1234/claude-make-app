# マルチエージェント討論ルーム

Claude API を使って、賛成派・反対派・司会の3つのAIエージェントが1つのお題について
討論する様子をリアルタイムに見られるNext.jsアプリです。

## セットアップ

```bash
npm install
cp .env.example .env.local
# .env.local に ANTHROPIC_API_KEY を設定する
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開いてお題を入力し、「討論開始」を押してください。

## 仕組み

- `lib/personas.ts` — 賛成派・反対派・司会の役割定義とシステムプロンプト生成
- `app/api/debate/route.ts` — サーバー側でラウンドごとに各ペルソナのClaude呼び出しを
  順番に実行し、生成されたテキストをNDJSON形式でストリーミング配信する
- `app/page.tsx` — ストリームを受け取り、発言をチャット風にリアルタイム表示するUI

各ペルソナの発言は、それまでの討論の書き起こしをユーザーメッセージとして毎回渡し、
システムプロンプトで役割（賛成/反対/司会）を指定することで実現しています。

## 使用モデル

`claude-sonnet-5`（`app/api/debate/route.ts` の `MODEL` 定数で変更可能）
