// Growth OS service worker — minimal, offline-friendly cache for the app shell.
// Exists to satisfy PWA installability criteria and keep the app opening
// (even if stale) when the network is briefly unavailable. It does NOT
// cache API/data responses — journal, goals, habits etc. always come fresh
// from the server when you're online.

const CACHE_NAME = "growth-os-shell-v1";
const APP_SHELL = ["/manifest.json", "/icon.svg", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  event.respondWith(
    fetch(request).catch(() =>
      caches.match(request).then((cached) => cached || caches.match("/manifest.json")),
    ),
  );
});
