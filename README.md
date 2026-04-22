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

このリポジトリは Vercel プロジェクト **team-lite-chat** に紐付け済みです。本番 URL の一例:

`https://team-lite-chat-kootamaeda-9743s-projects.vercel.app`

（チームやリネームにより異なる場合は、Vercel ダッシュボードの **Domains** を確認し、`AUTH_URL` をその URL と一致させてください。）

### ビルドが失敗する・ログインできないとき（必須チェック）

1. **[Neon](https://neon.tech/) などで PostgreSQL を作成**し、接続文字列をコピーする（Neon では **Transaction** 用 URL を Prisma に使うのが無難。末尾に `?sslmode=require` を付与する場合あり）。
2. Vercel → プロジェクト **team-lite-chat** → **Settings** → **Environment Variables** で **`DATABASE_URL`** を追加し、**Production と Preview の両方**に適用する（変数行を編集し、チェックボックスで両方オン）。
3. 同様に **`AUTH_SECRET`** も Preview に適用する（Production のみだと、プレビューデプロイのビルドで失敗することがあります）。
4. **`AUTH_URL`** は上記の本番ドメイン（`https://…vercel.app`）と**完全一致**にする。カスタムドメインを付けたら、その `https://` URL に更新する。
5. 保存後、**Deployments** から **Redeploy** する。

CLI で追加する例:

```bash
npx vercel env add DATABASE_URL production --value "postgresql://..." --yes
```

（Preview 用にも同じ値を設定する場合はダッシュボードで Environments を複数選択するのが簡単です。）

### 手順（新規 Import する場合）

1. GitHub にこのリポジトリをプッシュする。
2. [Vercel](https://vercel.com/) で **Import** し、同じリポジトリを選ぶ。
3. **Environment Variables** に次を設定する（Production / Preview 両方推奨）。

| 変数名 | 説明 |
|--------|------|
| `DATABASE_URL` | マネージド Postgres の接続文字列。 |
| `AUTH_SECRET` | ランダムな長い文字列。`openssl rand -base64 32` など。 |
| `AUTH_URL` | デプロイ後に確定する本番の `https://…vercel.app`。 |

4. **Build Command** はデフォルトの `npm run build` のままでよい。`prisma migrate deploy` がビルド内で実行される。

5. デプロイ後、ユーザー登録 → ワークスペース作成まで通ることを確認する。

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
