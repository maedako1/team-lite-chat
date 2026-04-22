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
      "\n[build] DATABASE_URL is not set on Vercel.\n" +
        "    Dashboard → Project → Settings → Environment Variables → add Postgres URL for Production and Preview, then Redeploy.\n" +
        "    (Neon: https://neon.tech — copy connection string, often with ?sslmode=require)\n",
    );
    process.exit(1);
  }
  console.warn("[build] DATABASE_URL not set; skipping prisma migrate deploy.");
} else {
  run("npx", ["prisma", "migrate", "deploy"]);
}

if (onVercel && !process.env.AUTH_SECRET) {
  console.error(
    "\n[build] AUTH_SECRET is not set on Vercel.\n" +
      "    Generate: openssl rand -base64 32\n" +
      "    Add the value for Production and Preview (same secret).\n" +
      "    Set AUTH_URL to your production https://….vercel.app URL.\n",
  );
  process.exit(1);
}

run("npx", ["next", "build"]);
