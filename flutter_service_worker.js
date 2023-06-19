'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "splash/style.css": "c94c38ff00a9d487c353a2d78989ea08",
"splash/img/dark-1x.png": "98ce801a401bdb88cf7ae6db35c75d99",
"splash/img/light-3x.png": "9b08478150f4b13cccd3eaceaf25e0cc",
"splash/img/dark-4x.png": "41a179703049ad8f340a799af6772b30",
"splash/img/light-1x.png": "98ce801a401bdb88cf7ae6db35c75d99",
"splash/img/dark-2x.png": "2100239161b3e7054d8e9d93bdd41079",
"splash/img/light-4x.png": "41a179703049ad8f340a799af6772b30",
"splash/img/dark-3x.png": "9b08478150f4b13cccd3eaceaf25e0cc",
"splash/img/light-2x.png": "2100239161b3e7054d8e9d93bdd41079",
"splash/splash.js": "123c400b58bea74c1305ca3ac966748d",
"main.dart.js": "0e32f8ce9739b125a0b4e87b098448aa",
"assets/NOTICES": "28c68799f4fd543d4692ca355f834a1b",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/FontManifest.json": "78014bb85d8df5ee43ecf08780c45309",
"assets/shaders/ink_sparkle.frag": "bc56a6b1b7e93088748fbfe65782650e",
"assets/lib/assets/icons/pokefun_logo.png": "ec1f74d5d68154d0e037beae9f4ac9e0",
"assets/lib/assets/icons/pokefun_logo.svg": "625e4311fe136acb214bd00760ad23bd",
"assets/lib/assets/icons/pokefun_logo_wide.svg": "7893585af8bd666c7c4f5ce13678d9bb",
"assets/lib/assets/icons/pokefun_logo_wide.png": "31496063762d73e2a2c77311e51fe1d2",
"assets/lib/assets/animations/pokeball_loading.json": "69ecab3ea8da4f89d8f4302a532c61de",
"assets/lib/assets/images/pokefun_logo.png": "df021c8e4e63c303a2d244dc427d802b",
"assets/lib/assets/images/not_found.png": "dba4e759a3e3ed4a3e239d53ac3385cd",
"assets/lib/fonts/Ruda-Bold.ttf": "e283d6f0c24f67a434795e6b8f70160e",
"assets/lib/fonts/Ruda-ExtraBold.ttf": "9869c7249e00cad7abbfe3d32801d7b9",
"assets/lib/fonts/Ruda-Medium.ttf": "73981c084c48b5ea70641262d426cbb1",
"assets/lib/fonts/Ruda-SemiBold.ttf": "2eb2cbcbf2a564038bf8e786509005e4",
"assets/lib/fonts/Ruda-Regular.ttf": "67232d5eee3461fe171f25d55e0dbe61",
"assets/lib/fonts/Ruda-Black.ttf": "70ca3cb8fefabec3715e82979bf67d62",
"assets/fonts/MaterialIcons-Regular.otf": "95db9098c58fd6db106f1116bae85a0b",
"assets/AssetManifest.json": "c5a679ec394dd58468a5d9b6b19a4dff",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"index.html": "8fb5d1d017fc6e406d539c285b895b26",
"/": "8fb5d1d017fc6e406d539c285b895b26",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"manifest.json": "8aa3230b459322eeabb5d5052fadf791",
"version.json": "d93c1e974fbc061b56335ad2368cf75c"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
