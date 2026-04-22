"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateWorkspaceForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug: slug.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "作成に失敗しました");
        return;
      }
      const ws = data.workspace as { slug: string };
      router.push(`/w/${ws.slug}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <h2 className="mb-3 text-sm font-semibold text-white">ワークスペースを作成</h2>
      <div className="mb-3">
        <label className="mb-1 block text-xs text-zinc-400">名前</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          placeholder="例: 開発チーム"
        />
      </div>
      <div className="mb-3">
        <label className="mb-1 block text-xs text-zinc-400">URL用スラッグ（任意・英小文字とハイフン）</label>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase())}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          placeholder="空なら名前から自動生成"
        />
      </div>
      {error ? <p className="mb-2 text-sm text-red-400">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-violet-600 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
      >
        {loading ? "作成中…" : "作成"}
      </button>
    </form>
  );
}
