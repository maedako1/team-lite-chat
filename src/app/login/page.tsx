import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./ui";

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-lg">
        <h1 className="mb-1 text-xl font-semibold text-white">ログイン</h1>
        <p className="mb-6 text-sm text-zinc-400">メールとパスワードでサインインします。</p>
        <Suspense fallback={<p className="text-sm text-zinc-500">読み込み中…</p>}>
          <LoginForm />
        </Suspense>
        <p className="mt-4 text-center text-sm text-zinc-500">
          アカウントがない方は{" "}
          <Link href="/register" className="text-violet-400 hover:underline">
            登録
          </Link>
        </p>
      </div>
    </div>
  );
}
