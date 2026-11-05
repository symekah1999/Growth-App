"use client";

import { useEffect, useState, useTransition } from "react";
import { Bell, BellOff, Send } from "lucide-react";
import { removePushSubscription, savePushSubscription, sendTestPush } from "@/app/(app)/reminders/actions";

const b64ToBytes = (b64: string) => {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
};
const toB64 = (buf: ArrayBuffer | null) => (buf ? btoa(String.fromCharCode(...new Uint8Array(buf))) : "");

type State = "loading" | "unsupported" | "denied" | "off" | "on";

export function PushControls({ publicKey }: { publicKey: string }) {
  const [state, setState] = useState<State>("loading");
  const [note, setNote] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    (async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return setState("unsupported");
      if (Notification.permission === "denied") return setState("denied");
      try {
        const reg = await navigator.serviceWorker.ready;
        setState((await reg.pushManager.getSubscription()) ? "on" : "off");
      } catch {
        setState("unsupported");
      }
    })();
  }, []);

  const enable = () =>
    start(async () => {
      setNote(null);
      try {
        const perm = await Notification.requestPermission();
        if (perm !== "granted") return setState(perm === "denied" ? "denied" : "off");
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(publicKey) });
        const res = await savePushSubscription({
          endpoint: sub.endpoint,
          p256dh: toB64(sub.getKey("p256dh")),
          auth: toB64(sub.getKey("auth")),
          userAgent: navigator.userAgent,
        });
        if (!res.ok) {
          await sub.unsubscribe();
          setNote(res.message ?? "Could not save.");
          return;
        }
        setState("on");
      } catch {
        setNote("Could not turn reminders on for this device.");
      }
    });

  const disable = () =>
    start(async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await removePushSubscription(sub.endpoint);
          await sub.unsubscribe();
        }
        setState("off");
      } catch {
        setNote("Could not turn reminders off.");
      }
    });

  const test = () =>
    start(async () => {
      const r = await sendTestPush();
      setNote(r.message ?? (r.ok ? "Sent." : "Failed."));
    });

  if (state === "loading") return <p className="text-sm text-neutral-500">Checking this device…</p>;
  if (state === "unsupported")
    return (
      <p className="text-sm text-neutral-400">
        This browser can&apos;t receive push reminders. On iPhone, add Growth OS to your Home Screen first (Share → Add to Home Screen), then open it from there.
      </p>
    );
  if (state === "denied")
    return <p className="text-sm text-amber-300">Notifications are blocked for this site. Allow them in your browser or phone settings, then come back.</p>;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {state === "on" ? (
        <>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-800/60 px-3 py-1.5 text-sm text-emerald-300">
            <Bell size={14} /> On for this device
          </span>
          <button onClick={test} disabled={pending} className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800 disabled:opacity-50">
            <Send size={14} /> Send a test
          </button>
          <button onClick={disable} disabled={pending} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-neutral-400 hover:text-neutral-200 disabled:opacity-50">
            <BellOff size={14} /> Turn off
          </button>
        </>
      ) : (
        <button onClick={enable} disabled={pending} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">
          <Bell size={14} /> Turn on reminders on this device
        </button>
      )}
      {note && <p className="w-full text-xs text-neutral-400" role="status">{note}</p>}
    </div>
  );
}
