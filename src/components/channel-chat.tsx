"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Author = { id: string; name: string; email: string | null };
export type ChatMessage = {
  id: string;
  body: string;
  createdAt: string;
  author: Author;
};

function mergeById(prev: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  const map = new Map<string, ChatMessage>();
  for (const m of prev) map.set(m.id, m);
  for (const m of incoming) map.set(m.id, m);
  return [...map.values()].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function ChannelChat({
  channelId,
  workspaceSlug,
  channelName,
  initialMessages,
}: {
  channelId: string;
  workspaceSlug: string;
  channelName: string;
  initialMessages: ChatMessage[];
}) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const latestIso = useMemo(() => {
    if (messages.length === 0) return undefined;
    return messages[messages.length - 1].createdAt;
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    setMessages(initialMessages);
  }, [channelId, initialMessages]);

  useEffect(() => {
    const t = setInterval(async () => {
      const qs = latestIso ? `?since=${encodeURIComponent(latestIso)}` : "";
      const res = await fetch(`/api/channels/${channelId}/messages${qs}`);
      if (!res.ok) return;
      const data = (await res.json()) as { messages: ChatMessage[] };
      if (data.messages?.length) {
        setMessages((prev) => mergeById(prev, data.messages));
        scrollToBottom();
      }
    }, 2000);
    return () => clearInterval(t);
  }, [channelId, latestIso, scrollToBottom]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/channels/${channelId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return;
      const msg = data.message as ChatMessage;
      setDraft("");
      setMessages((prev) => mergeById(prev, [msg]));
      scrollToBottom();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-zinc-950">
      <header className="border-b border-zinc-800 px-4 py-3">
        <h1 className="text-lg font-semibold text-zinc-100">
          <span className="text-zinc-500">#</span>
          {channelName}
        </h1>
        <p className="text-xs text-zinc-500">
          {workspaceSlug} · updates every ~2s (no WebSockets on serverless)
        </p>
      </header>
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.map((m) => {
          const mine = m.author.id === session?.user?.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  mine ? "bg-violet-700 text-white" : "bg-zinc-800 text-zinc-100"
                }`}
              >
                {!mine ? <p className="mb-1 text-xs font-medium text-violet-300">{m.author.name}</p> : null}
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className={`mt-1 text-[10px] ${mine ? "text-violet-200" : "text-zinc-500"}`}>
                  {new Date(m.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="border-t border-zinc-800 p-3">
        <div className="flex gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Message…"
            rows={2}
            className="min-h-[44px] flex-1 resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="self-end rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
