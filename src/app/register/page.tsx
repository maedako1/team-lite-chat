import Link from "next/link";
import { RegisterForm } from "./ui";

export default function RegisterPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-lg">
        <h1 className="mb-1 text-xl font-semibold text-white">アカウント登録</h1>
        <p className="mb-6 text-sm text-zinc-400">8文字以上のパスワードを設定してください。</p>
        <RegisterForm />
        <p className="mt-4 text-center text-sm text-zinc-500">
          すでにアカウントがある方は{" "}
          <Link href="/login" className="text-violet-400 hover:underline">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}
