"use client";

import { useEffect, useState } from "react";
import { CloudOff, Check, Heart, ListChecks, NotebookPen } from "lucide-react";
import { captureItem, type CaptureItem } from "@/app/(app)/capture/actions";
import { enqueue, flushQueue, localDate, onQueueChange, readQueue } from "@/lib/offline-queue";

const KINDS: { key: CaptureItem["kind"]; label: string; icon: typeof Heart; hint: string }[] = [
  { key: "journal", label: "Journal note", icon: NotebookPen, hint: "A thought, a moment, anything worth keeping…" },
  { key: "gratitude", label: "Gratitude", icon: Heart, hint: "One or more things you're thankful for (one per line)" },
  { key: "todo", label: "To-do", icon: ListChecks, hint: "Something to do today" },
];

export function CaptureForm() {
  const [kind, setKind] = useState<CaptureItem["kind"]>("journal");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [queued, setQueued] = useState(0);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const sync = () => {
      setQueued(readQueue().length);
      setOnline(navigator.onLine);
    };
    sync();
    const off = onQueueChange(sync);
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      off();
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  const save = async () => {
    const t = text.trim();
    if (!t || busy) return;
    setBusy(true);
    setMsg(null);
    const done = () => {
      setText("");
    };
    if (navigator.onLine) {
      try {
        const res = await captureItem({ id: crypto.randomUUID(), kind, text: t, date: localDate() });
        if (res.ok) {
          done();
          setMsg("Saved ✓");
          void flushQueue();
          setBusy(false);
          return;
        }
        setMsg(res.message ?? "Could not save.");
        setBusy(false);
        return;
      } catch {
        // network dropped mid-request: fall through and queue it
      }
    }
    enqueue({ kind, text: t });
    done();
    setMsg("Saved on this device. It will sync when you're back online.");
    setBusy(false);
  };

  const active = KINDS.find((k) => k.key === kind)!;

  return (
    <div>
      {!online && (
        <p className="mb-3 flex items-center gap-1.5 rounded-lg border border-amber-800/60 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          <CloudOff size={14} /> You&apos;re offline. Anything you save here is kept on this device and sent later.
        </p>
      )}
      <div className="mb-3 flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <button
            key={k.key}
            type="button"
            onClick={() => setKind(k.key)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm ${
              kind === k.key ? "border-indigo-500 bg-indigo-500/15 text-indigo-200" : "border-neutral-700 text-neutral-400 hover:bg-neutral-800"
            }`}
          >
            <k.icon size={14} /> {k.label}
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={active.hint}
        rows={kind === "todo" ? 2 : 5}
        className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-indigo-500 focus:outline-none"
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={busy || !text.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          <Check size={14} /> Save
        </button>
        {msg && <span className="text-sm text-neutral-400" role="status">{msg}</span>}
        {queued > 0 && (
          <span className="ml-auto text-xs text-amber-300">
            {queued} waiting to sync
            {online && (
              <button type="button" onClick={() => void flushQueue()} className="ml-2 underline hover:text-amber-200">
                Sync now
              </button>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
