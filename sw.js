const CACHE_NAME = 'sagak-studio-v2';
const PRECACHE_URLS = [
  '/',
  './index.html',
  './manifest.json',
  './config.js',
  './sagak_icon.png',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js',
  'https://unpkg.com/docx@7.1.0/build/index.js',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/framer-motion@10.16.4/dist/framer-motion.js',
  'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/dagre/0.8.5/dagre.min.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// 설치 시 캐싱
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
  );
});

// 새로운 서비스 워커 활성화 시 이전 캐시 삭제
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Stale-While-Revalidate 전략: 캐시에서 먼저 보여주고 배경에서 업데이트
self.addEventListener('fetch', event => {
  // Supabase API 등 외부 API 요청은 캐싱 제외 (필요시)
  if (event.request.url.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // 성공적인 응답인 경우에만 캐시 업데이트
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
            // 오프라인 상태일 때 fallback 처리 (옵션)
        });
        
        // 캐시에 있으면 즉시 반환, 없으면 네트워크 요청 기다림
        return response || fetchPromise;
      });
    })
  );
});
