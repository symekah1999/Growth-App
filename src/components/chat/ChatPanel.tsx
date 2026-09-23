"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Turn = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "How am I doing overall this week?",
  "Log today's habits as done",
  "Add a goal to read one book a month",
  "What's my verse of the day?",
];

export function ChatPanel({ compact = false }: { compact?: boolean }) {
  const [messages, setMessages] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/chat")
      .then((r) => r.json())
      .then((data) => setMessages(data.messages ?? []))
      .catch(() => setError("Couldn't load chat history."))
      .finally(() => setLoadingHistory(false));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setError(null);
    setMessages((m) => [...m, { role: "user", content: trimmed }]);
    setInput("");
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSending(false);
    }
  }

  async function clearChat() {
    await fetch("/api/chat", { method: "DELETE" });
    setMessages([]);
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500">
            <Sparkles size={14} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-100">Growth Assistant</p>
            {!compact && <p className="text-xs text-neutral-500">Knows everything in your OS</p>}
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            title="Clear conversation"
            className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {loadingHistory ? (
          <div className="flex justify-center py-8 text-neutral-600">
            <Loader2 size={18} className="animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20">
              <Sparkles size={20} className="text-indigo-400" />
            </div>
            <p className="max-w-[220px] text-sm text-neutral-500">
              Ask me anything about your goals, habits, journal, recovery, savings, or debts — or just tell me what to log.
            </p>
            <div className="flex w-full flex-col gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-lg border border-neutral-800 px-3 py-2 text-left text-xs text-neutral-400 transition hover:border-indigo-700 hover:text-neutral-200"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "rounded-br-sm bg-gradient-to-br from-indigo-600 to-indigo-500 text-white"
                    : "rounded-bl-sm border border-neutral-800 bg-neutral-900/70 text-neutral-200",
                )}
              >
                {m.content}
              </div>
            </div>
          ))
        )}

        {sending && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-neutral-800 bg-neutral-900/70 px-4 py-3">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-500 [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-500 [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-500" />
            </div>
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-red-900 bg-red-950/40 px-3 py-2 text-xs text-red-400">{error}</p>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-end gap-2 border-t border-neutral-800 p-3"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder="Message your assistant..."
          rows={1}
          className="max-h-32 flex-1 resize-none rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-50 outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-500 text-white transition hover:opacity-90 disabled:opacity-40"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
