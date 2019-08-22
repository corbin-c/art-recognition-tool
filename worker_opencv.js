/*
 * This worker loads OpenCV WASM module. Then, It notifies the main
 * thread so it can start sending messages to it.
 * The worker is instantiated with imageData from a canvas, which serves
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
      console.info("OpenCV has been imported");
      if (cv.getBuildInformation) {       // asm.js
        loaded();
      } else {
        cv["onRuntimeInitialized"]=()=>{  // WASM
          loaded();
        }
      }
    } catch(e) {
      console.warn("something went wrong while loading opencv.js:");
      console.error(e);
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
    let message;
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
        message = pic[e.message.cmd](...e.message.opts);
      } else {
        message = pic[e.message.cmd]();
      }
      if (typeof message === "undefined") {
        message = e.message.cmd+": DONE";
      }
    }
    e.message = message;
    port.postMessage(e);
  }
}
