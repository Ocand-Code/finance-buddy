/* ============================================
   sw.js - Service Worker for offline support
   ============================================ */

const CACHE_NAME = 'finance-buddy-v2';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './css/style.css',
    './js/i18n.js',
    './js/storage.js',
    './js/categories.js',
    './js/charts.js',
    './js/excel.js',
    './js/xlsx.full.min.js',
    './js/app.js',
    './icons/icon.svg',
    './icons/icon-192.png',
    './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return fetch(event.request)
                .then((response) => {
                    // Cache successful responses
                    if (response.ok && event.request.url.startsWith(self.location.origin)) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    }
                    return response;
                })
                .catch(() => caches.match('./index.html'));
        })
    );
});