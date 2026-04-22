"use client";

import { useState } from "react";

export function InvitePanel({ workspaceId }: { workspaceId: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createInvite() {
    setLoading(true);
    setError(null);
    setUrl(null);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/invites`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Failed to create invite");
        return;
      }
      setUrl(data.url as string);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border-t border-zinc-700/80 p-3 text-xs text-zinc-400">
      <p className="mb-2 font-medium text-zinc-300">Invite members</p>
      <button
        type="button"
        onClick={createInvite}
        disabled={loading}
        className="mb-2 w-full rounded-md bg-zinc-700 px-2 py-1.5 text-zinc-100 hover:bg-zinc-600 disabled:opacity-50"
      >
        {loading ? "Generating…" : "Create invite link"}
      </button>
      {error ? <p className="text-red-400">{error}</p> : null}
      {url ? (
        <p className="break-all rounded bg-zinc-900 p-2 font-mono text-[11px] text-emerald-300">{url}</p>
      ) : null}
    </div>
  );
}
