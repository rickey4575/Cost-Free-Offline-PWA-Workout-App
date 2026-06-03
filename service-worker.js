const CACHE_NAME = "workout-cache-v3";
const APP_SHELL = [
  "./",
  "./index.html",
  "./app.js",
  "./db.js",
  "./dom.js",
  "./format.js",
  "./uuid.js",
  "./recentActivityView.js",
  "./restTimer.js",
  "./templatesRepo.js",
  "./templatesView.js",
  "./workoutsRepo.js",
  "./workoutView.js",
  "./setsRepo.js",
  "./exerciseNotesRepo.js",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
