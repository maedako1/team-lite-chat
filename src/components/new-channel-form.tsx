"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewChannelForm({ workspaceId, workspaceSlug }: { workspaceId: string; workspaceSlug: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(typeof data.error === "string" ? data.error : "Could not create channel");
        return;
      }
      const ch = data.channel as { name: string };
      setName("");
      router.push(`/w/${workspaceSlug}/c/${ch.name}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="border-t border-zinc-700/80 p-2">
      <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-zinc-500">New channel</label>
      <div className="flex gap-1">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. random"
          className="min-w-0 flex-1 rounded border border-zinc-600 bg-zinc-900 px-2 py-1 text-sm text-zinc-100 placeholder:text-zinc-600"
        />
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="shrink-0 rounded bg-violet-600 px-2 py-1 text-sm text-white hover:bg-violet-500 disabled:opacity-40"
        >
          Add
        </button>
      </div>
      {err ? <p className="mt-1 text-[11px] text-red-400">{err}</p> : null}
    </form>
  );
}
