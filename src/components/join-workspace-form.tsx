"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function JoinWorkspaceForm({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function accept() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/invites/${token}/accept`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not join");
        return;
      }
      const slug = data.workspaceSlug as string;
      router.push(`/w/${slug}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border border-zinc-700 bg-zinc-900/80 p-6 shadow-xl">
      <h1 className="mb-2 text-xl font-semibold text-zinc-100">Workspace invite</h1>
      <p className="mb-4 text-sm text-zinc-400">Accept this invite to join the team workspace.</p>
      {error ? <p className="mb-3 text-sm text-red-400">{error}</p> : null}
      <button
        type="button"
        onClick={accept}
        disabled={loading}
        className="w-full rounded-lg bg-violet-600 py-2.5 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
      >
        {loading ? "Joining…" : "Accept & open workspace"}
      </button>
    </div>
  );
}
