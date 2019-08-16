/*
 * This worker loads OpenCV WASM module. Then, It notifies the main
 * thread so it can start sending messages to it.
 * The worker is instentiated with imageData from a canvas, which serves
 * then as a reference for the worker_class_picture, a class dedicated
 * to image processing.
 * This script only serves as a bridge between the window object and the
 * picture worker-class.
 * 
 */
onconnect = function(e) {
  let port = e.ports[0];
  let pic;
  init();
  function init() {
    try {
      importScripts("opencv.js");
      if (cv.getBuildInformation) {       // asm.js
        loaded();
      } else {
        cv["onRuntimeInitialized"]=()=>{  // WASM
          loaded();
        }
      }
    } catch(e) {
      console.warn("something went wrong while loading opencv.js: ",e);
      port.postMessage("FAILURE");
    }
  }
  function loaded()
  {
    importScripts("worker_class_picture.js");
    port.postMessage("LOADED");
  }
  port.onmessage = function(e) {
    e = e.data;
    let message = e.message.cmd+": DONE";
    if (e.message.cmd == "init") {
      let src = cv.matFromImageData(e.message.imgData);
      pic = new ocv_Picture(src);
    } else if (e.message.cmd == "quit") {
      try {
        cv.wasmMemory = undefined;
        cv.wasmTable = undefined;
        cv = undefined;
      } catch(e) {
        console.warn("wasmMemory couldn't be emptied:",e);
      }
    } else if (e.message.cmd == "fail") {
      console.warn("Trying to relaunch OpenCV.js");
      init();
    } else {
      if (typeof e.message.opts !== "undefined") {
        pic[e.message.cmd](...e.message.opts);
      } else {
        if (e.message.cmd == "output") {
          message = pic.output();
        } else {
          pic[e.message.cmd]();
        }
      }
    }
    e.message = message;
    port.postMessage(e);
  }
}
