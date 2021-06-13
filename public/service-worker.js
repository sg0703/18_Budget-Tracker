// configure static file cache
const CACHE_NAME = "budget-static-cache";

// configure static files to cache
const FILES_TO_CACHE = [
  '/',
  'index.html',
  'index.js',
  'styles.css',
  'service-worker.js',
  '/assets/db.js',
  'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js@2.8.0'
];

// install service worker
self.addEventListener("install", function (evt) {
  // cache static assets
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );

  // tell the browser to activate this service worker immediately once it
  // has finished installing
  self.skipWaiting();
});

// activate cache
self.addEventListener("activate", function(evt) {
  evt.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// send cached static files if offline
self.addEventListener("fetch", (evt) => {
  // added this to prevent console error when sending credits/debits offline
  const { request } = evt;
  if(request.method === 'GET') {
    evt.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(evt.request).then(response => {
          return response || fetch(evt.request);
        });
      })
    );
  }
});
