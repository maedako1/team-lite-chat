import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect("/w");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-20">
      <div className="max-w-lg text-center">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-violet-400">Team Lite Chat</p>
        <h1 className="mb-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Slack の簡易版</h1>
        <p className="mb-8 text-zinc-400">
          ワークスペース・チャンネル・招待リンク・メッセージ（約2秒ポーリング）。Vercel + PostgreSQL で動くMVPです。
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/register"
            className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-500"
          >
            はじめる
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-zinc-600 px-5 py-2.5 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
          >
            ログイン
          </Link>
        </div>
      </div>
    </div>
  );
}
