// Developed by Clément Corbin
let pic;
function postMessage(e) {
  self.clients.matchAll({includeUncontrolled: true, type: 'window'})
    .then(function(clients) {
      clients.map((client) => { client.postMessage(e); });
    });
}
function load() {
  let picture = false;
  if (cv.getBuildInformation) {
    postMessage("LOADED");
    picture = true;
  } else {
    cv["onRuntimeInitialized"]=()=>{  // WASM
      postMessage("LOADED");
      picture = true;
      declare_class_picture();
    }
  }
  if (picture) {
    ocv_picture_class = declare_class_picture();
  }  
}
self.addEventListener("install", async (event) => {
  event.waitUntil(caches.open("art")
    .then((e) => e.addAll(["blank.png","index.html"])));
  console.info("Service Worker initialized");
  (() => {
    try {
      importScripts("opencv.js");
      importScripts("worker_class_picture.js");
      console.info("OpenCV has been imported");
    } catch(e) {
      console.warn("something went wrong while loading opencv.js:");
      console.error(e);
      port.postMessage("FAILURE");
    }
  })();
});
self.addEventListener("activate", (event) => {
  console.info("Service Worker active");
  load();
});
self.addEventListener("message", (e) => {
  e = e.data;
  let message;
  if (e.message == "preload") {
    load();
  } else if (e.message.cmd == "init") {
    let src = cv.matFromImageData(e.message.imgData);
    pic = new ocv_picture_class(src);
  } else if (e.message.cmd == "quit") {
    //NoOp
  } else if (e.message.cmd == "fail") {
    //NoOp
  } else {
    message = (typeof e.message.opts !== "undefined") ?
      pic[e.message.cmd](...e.message.opts):pic[e.message.cmd]();
    if (typeof message === "undefined") {
      message = e.message.cmd+": DONE";
    }
  }
  e.message = message;
  postMessage(e);
});
/*this.addEventListener("fetch", function(event) {
  event.respondWith(caches.match(event.request)
    .then(function(response) {
    if (typeof response !== "undefined") {
      return response;
    } else {
      return fetch(event.request).then(function (response) {
        let r = response.clone();
        if (response.status == 200) {
          caches.open("art").then(function (cache) {
            cache.put(event.request, r);
          });
          return response;
        } else {
          return caches.match("blank.png");
        }
      },function(){return caches.match("blank.png");})
    }
  },function(){return caches.match("blank.png");}));
});*/
// ajouter gestion versions cache
