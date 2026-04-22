# Implementation guide

このドキュメントは当初の実装チェックリストです。**実装済み**の内容はリポジトリ内のソースと [README.md](../README.md) を正とします。

## スタック（Vercel 向け）

- Next.js 16（App Router）
- PostgreSQL + Prisma 5
- Auth.js v5（`next-auth@beta`）— Credentials、JWT、`trustHost: true`
- メッセージ更新: **短い間隔のポーリング**（約 2 秒、`?since=`）

## 環境変数

- `DATABASE_URL` — Postgres
- `AUTH_SECRET` — ランダムシークレット
- `AUTH_URL` — 本番 URL（例: `https://xxx.vercel.app`）

`.env.example` を参照。

## NPM スクリプト

- `postinstall`: `prisma generate`
- `build`: `prisma generate && prisma migrate deploy && next build`
- `build:next`: DB なしで Next のビルドのみ（ローカル検証用）

## API 一覧（実装済み）

- `POST /api/register`
- `GET/POST /api/auth/*`（Auth.js）
- `GET/POST /api/workspaces`
- `GET /api/workspaces/by-slug/[slug]`
- `POST /api/workspaces/[workspaceId]/invites`
- `POST /api/invites/[token]/accept`
- `GET/POST /api/workspaces/[workspaceId]/channels`
- `GET/POST /api/channels/[channelId]/messages`（`?since=` 対応）
