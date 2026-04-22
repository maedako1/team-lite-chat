import { spawnSync } from "node:child_process";

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const onVercel = process.env.VERCEL === "1";

run("npx", ["prisma", "generate"]);

if (!process.env.DATABASE_URL) {
  if (onVercel) {
    console.error(
      "\n[build] DATABASE_URL が Vercel の Environment Variables にありません。\n" +
        "    Vercel ダッシュボード → 該当プロジェクト → Settings → Environment Variables で\n" +
        "    Production（と Preview）に Postgres の接続文字列を追加し、再デプロイしてください。\n",
    );
    process.exit(1);
  }
  console.warn("[build] DATABASE_URL 未設定のため prisma migrate deploy をスキップします。");
} else {
  run("npx", ["prisma", "migrate", "deploy"]);
}

if (onVercel && !process.env.AUTH_SECRET) {
  console.error(
    "\n[build] AUTH_SECRET が Vercel の Environment Variables にありません。\n" +
      "    例: openssl rand -base64 32 の出力を AUTH_SECRET に設定してください。\n" +
      "    Production と Preview の両方に同じ値を設定するか、\n" +
      "    Project Settings → Environment Variables で Preview にもチェックを付けてください。\n" +
      "    AUTH_URL にはデプロイ後に表示される本番 URL（…vercel.app）を設定してください。\n",
  );
  process.exit(1);
}

run("npx", ["next", "build"]);
