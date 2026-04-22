# Team Lite Chat

Slack 風のチームチャット MVP（Next.js 16 · PostgreSQL · Prisma · Auth.js）。**Vercel** 上のサーバーレス向けに、メッセージ更新は **約 2 秒のポーリング**（`?since=` 差分取得）で実装しています。

## 機能

- メール + パスワードの登録 / ログイン（bcrypt ハッシュ）
- ワークスペース作成（自動で `#general` チャンネル）
- チャンネル一覧・作成（名前は `^[a-z0-9][a-z0-9-]{0,78}$`）
- 招待リンク（7 日有効、API で生成）
- メッセージ投稿・履歴（最大 8000 文字）

## ローカル開発

1. Node.js 20+ を用意する。
2. PostgreSQL の `DATABASE_URL` を用意する（[Neon](https://neon.tech/) など）。
3. 環境変数を設定する。

```bash
cp .env.example .env
# .env を編集
```

4. マイグレーションと開発サーバー。

```bash
npx prisma migrate deploy
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く。

### ビルド（DB 接続なしで型チェックのみしたい場合）

```bash
npm run build:next
```

本番相当（マイグレーション込み）は `DATABASE_URL` が有効な状態で:

```bash
npm run build
```

## Vercel にデプロイする

1. GitHub にこのリポジトリをプッシュする。
2. [Vercel](https://vercel.com/) で **Import** し、同じリポジトリを選ぶ。
3. **Environment Variables** に次を設定する（Production / Preview 両方推奨）。

| 変数名 | 説明 |
|--------|------|
| `DATABASE_URL` | マネージド Postgres の接続文字列（SSL 必須のプロバイダが多い）。 |
| `AUTH_SECRET` | ランダムな長い文字列。ローカルで `openssl rand -base64 32` などで生成。 |
| `AUTH_URL` | デプロイ後の本番 URL（例: `https://your-project.vercel.app`）。Preview 用に別 URLは通常不要だが、認証リダイレクトで問題が出る場合は Vercel のドキュメントに従い `trustHost` 済みの本設定を確認。 |

4. **Build Command** はデフォルトの `npm run build` のままでよい。ビルド時に `prisma migrate deploy` が走り、スキーマが DB に適用される。

5. 初回デプロイ後、サイトにアクセスしてユーザー登録 → ワークスペース作成まで通ることを確認する。

### Vercel での注意

- 長寿命 **WebSocket** はサーバーレスでは使わず、ポーリングで代替している。
- `postinstall` で `prisma generate` を実行しているため、Vercel のインストール段階でもクライアントが生成される。

## リポジトリ

このプロジェクトのソースは次の GitHub リポジトリにプッシュ済みです。

https://github.com/maedako1/team-lite-chat

別アカウントや名前で管理する場合は、GitHub 上で空リポジトリを作成してから `git remote set-url origin ...` と `git push -u origin main` で差し替えてください。

## 技術スタック

- Next.js 16（App Router）
- Prisma 5 + PostgreSQL
- Auth.js（`next-auth` v5 beta）Credentials + JWT
- Tailwind CSS 4

詳細は [docs/architecture.md](docs/architecture.md) を参照。

## ライセンス

MIT（必要に応じて変更してください）。
