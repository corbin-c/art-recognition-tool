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
    console.log("init()");
    try {
      importScripts("opencv.js");
      console.lgo("imported script");
      if (cv.getBuildInformation) {       // asm.js
        loaded();
      } else {
        cv["onRuntimeInitialized"]=()=>{  // WASM
          loaded();
        }
      }
    } catch {
      console.warn("something went wrong while loading opencv.js");
      port.postMessage("FAILURE");
    }
  }
  function loaded()
  {
    console.log("loaded");
    importScripts("worker_class_picture.js");
    port.postMessage("LOADED");
  }
  port.onmessage = function(e) {
    console.log(e.data.message.cmd);
    e = e.data;
    let message = e.message.cmd+": DONE";
    if (e.message.cmd == "init") {
      let src = cv.matFromImageData(e.message.imgData);
      pic = new ocv_Picture(src);
    } else if (e.message.cmd == "quit") {
      delete cv.wasmMemory;
      delete cv.wasmTable;
      delete cv;
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
