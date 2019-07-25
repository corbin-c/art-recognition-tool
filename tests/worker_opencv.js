/*
 * This worker loads OpenCV WASM module. Then, It notifies the main
 * thread so it can start sending messages to it.
 * The worker is instentiated with imageData from a canvas, which serves
 * then as a reference for the worker_class_picture, a class dedicated
 * to image processing.
 * This script only serves as a bridge between the window object and the
 * worker picture class.
 * 
 */
importScripts("../opencv.js");
let pic;
if (cv.getBuildInformation) {       // asm.js
  loaded();
} else {
  cv['onRuntimeInitialized']=()=>{  // WASM
      loaded();
  }
}
function loaded()
{
  importScripts("worker_class_picture.js");
  postMessage("LOADED");
  onmessage = function(e) {
    if (e.data.cmd == "init") {
      let src = cv.matFromImageData(e.data.imgData);
      pic = new Picture(src);
    } else {
      if (typeof e.data.opts !== "undefined") {
        pic[e.data.cmd](...e.data.opts);
      } else {
        pic[e.data.cmd]();
      }
      postMessage(pic.output());
    }
  }
}
