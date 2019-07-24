importScripts("opencv.js");
//console.log("LOADED");
postMessage("LOADED");
onmessage = function(e) {
  //let src = cv.matFromArray(4, 1,new cv.Mat(e.data.h, e.data.w, cv.CV_8UC4);
  console.log(e.data);
  let src = cv.matFromArray(e.data.h, e.data.w, cv.CV_32FC2, e.data.buffer);
  console.log("image width: " + src.cols);
  console.log("image height: " + src.rows);
}
