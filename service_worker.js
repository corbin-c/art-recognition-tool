// Developed by Clément Corbin
let pic;
let ocv_picture_class;
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
  } else {
    cv["onRuntimeInitialized"]=()=>{  // WASM
      postMessage("LOADED");
    }
  }
}
self.addEventListener("install", async (event) => {
  event.waitUntil(caches.open("art")
    .then((e) => e.addAll(["collection.json","index.html"])));
  console.info("Service Worker initialized");
  (() => {
    try {
      importScripts("opencv.js");
      importScripts("worker_class_picture.js");
      console.info("OpenCV has been imported");
    } catch(e) {
      console.warn("something went wrong while loading opencv.js:");
      console.error(e);
    }
  })();
});
self.addEventListener("activate", (event) => {
  console.info("Service Worker active");
  clients.claim();
  load();
});
self.addEventListener("message", (e) => {
  e = e.data;
  let message;
  if (e.message == "preload") {
    load();
  } else if (e.message == "loaded") {
    ocv_picture_class = declare_class_picture();
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
self.addEventListener("fetch", function(event) {
  event.respondWith(caches.match(event.request)
    .then(function(response) {
    if (typeof response !== "undefined") {
      return response;
    } else {
      return fetch(event.request).then(function (response) {
        return response; })
    }
  }));
});
// ajouter gestion versions cache
