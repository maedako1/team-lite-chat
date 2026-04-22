import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-xl font-semibold text-white">見つかりません</h1>
      <p className="text-sm text-zinc-400">ワークスペースまたはチャンネルが存在しないか、アクセス権がありません。</p>
      <Link href="/w" className="text-violet-400 hover:underline">
        ワークスペース一覧へ
      </Link>
    </div>
  );
}
