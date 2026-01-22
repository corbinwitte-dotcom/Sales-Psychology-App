/**
 * Service Worker for Peak Performance App
 * Provides offline capability and caching
 */

const CACHE_NAME = 'peak-performance-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/app.js',
    '/js/player.js',
    '/js/storage.js',
    '/js/categories.js',
    '/manifest.json'
];

/**
 * Install event - cache core assets
 */
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching core assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                console.log('[Service Worker] Installation complete');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[Service Worker] Installation failed:', error);
            })
    );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[Service Worker] Activation complete');
                return self.clients.claim();
            })
    );
});

/**
 * Fetch event - serve from cache, fallback to network
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                // Return cached response if found
                if (cachedResponse) {
                    console.log('[Service Worker] Serving from cache:', request.url);
                    return cachedResponse;
                }

                // Otherwise fetch from network
                console.log('[Service Worker] Fetching from network:', request.url);
                return fetch(request)
                    .then((response) => {
                        // Don't cache if not a success response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Cache audio files and other assets
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                // Cache audio files and other assets
                                if (isAudioFile(request.url) || isCacheable(request.url)) {
                                    cache.put(request, responseToCache);
                                    console.log('[Service Worker] Cached:', request.url);
                                }
                            });

                        return response;
                    })
                    .catch((error) => {
                        console.error('[Service Worker] Fetch failed:', error);
                        // You could return a custom offline page here
                        throw error;
                    });
            })
    );
});

/**
 * Check if URL is an audio file
 */
function isAudioFile(url) {
    const audioExtensions = ['.mp3', '.wav', '.m4a', '.ogg', '.aac', '.flac'];
    const lowerUrl = url.toLowerCase();
    return audioExtensions.some(ext => lowerUrl.endsWith(ext));
}

/**
 * Check if URL should be cached
 */
function isCacheable(url) {
    const cacheableExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.woff', '.woff2'];
    const lowerUrl = url.toLowerCase();
    return cacheableExtensions.some(ext => lowerUrl.endsWith(ext)) || url.endsWith('/');
}

/**
 * Message event - handle messages from the app
 */
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CACHE_AUDIO') {
        const audioUrl = event.data.url;
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.add(audioUrl);
            })
            .then(() => {
                console.log('[Service Worker] Audio cached:', audioUrl);
            })
            .catch((error) => {
                console.error('[Service Worker] Failed to cache audio:', error);
            });
    }
});
