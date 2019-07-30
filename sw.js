this.addEventListener("install", async function(event) {
  event.waitUntil(caches.open("art").then((e) => e.addAll(["opencv.wasm","blank.png","index.html"])));
  console.log("init");
});

this.addEventListener("fetch", function(event) {
  event.respondWith(caches.match(event.request).then(function(response) {
    if (typeof response !== "undefined") {
      return response;
    } else {
      return fetch(event.request).then(function (response) {
        if (response.status == 200) {
          caches.open("art").then(function (cache) {
            cache.put(event.request, response.clone());
          });
          return response;
        } else {
          return caches.match("blank.png");
        }
      })
    }
  }));
});