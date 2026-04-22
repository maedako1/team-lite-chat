# アーキテクチャ概要

## レイヤー

- **UI:** Next.js App Router（RSC + Client Components）。`/w` 配下はログイン必須（middleware + サーバー側の `auth()`）。
- **API:** `app/api/**` の Route Handlers。Prisma で永続化。認可は各ハンドラで `auth()` と `Membership` / `Channel` 関係を検証。
- **認証:** Auth.js v5（Credentials）。セッションは JWT。`trustHost: true` で Vercel のホスト検証に対応。

## データ

- PostgreSQL（外部ホスティング前提）。
- Prisma Migrate で `prisma/migrations` を管理。本番ビルドで `prisma migrate deploy`。

## 準リアルタイム

- Vercel のサーバーレス実行モデルに合わせ、**WebSocket は使わない**。
- クライアントが 2 秒ごとに `GET /api/channels/:id/messages?since=ISO` で差分取得。初回メッセージが無い間は `since` なしで最新 100 件を取得してマージ。

## 主要ルート

| パス | 役割 |
|------|------|
| `/` | ランディング |
| `/register`, `/login` | 登録・ログイン |
| `/w` | 所属ワークスペース一覧・作成 |
| `/w/[slug]/c/[channelName]` | チャット |
| `/join/[token]` | 招待承諾 |

## セキュリティ方針（MVP）

- パスワードは bcrypt（コスト 12）。
- ワークスペース・チャンネル・メッセージ API はメンバーシップを確認。
- チャンネル名はサーバー側で正規表現バリデーション。
