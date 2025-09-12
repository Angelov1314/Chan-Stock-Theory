const CACHE_NAME = 'chan-analysis-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/',
  'https://chan-stock-theory.onrender.com/',
  'https://chan-stock-theory.onrender.com/api/'
];

// 安装Service Worker
self.addEventListener('install', function(event) {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(function(error) {
        console.log('Cache addAll failed:', error);
      })
  );
  self.skipWaiting();
});

// 激活Service Worker
self.addEventListener('activate', function(event) {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 拦截网络请求
self.addEventListener('fetch', function(event) {
  // 只处理GET请求
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // 如果缓存中有，返回缓存的内容
        if (response) {
          console.log('Serving from cache:', event.request.url);
          return response;
        }

        // 否则从网络获取
        console.log('Fetching from network:', event.request.url);
        return fetch(event.request).then(function(response) {
          // 检查响应是否有效
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // 克隆响应，因为响应是流，只能使用一次
          var responseToCache = response.clone();

          // 将响应添加到缓存
          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(function(error) {
          console.log('Fetch failed:', error);
          // 如果是API请求失败，可以返回一个默认响应
          if (event.request.url.includes('/api/')) {
            return new Response(
              JSON.stringify({ error: '网络连接失败，请检查网络设置' }),
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
              }
            );
          }
          throw error;
        });
      })
  );
});

// 处理推送通知（可选）
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/assets/icon-192-dw90j4oy.png',
      badge: '/assets/icon-192-dw90j4oy.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        {
          action: 'explore',
          title: '查看详情',
          icon: '/assets/icon-192-dw90j4oy.png'
        },
        {
          action: 'close',
          title: '关闭',
          icon: '/assets/icon-192-dw90j4oy.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// 处理通知点击
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});