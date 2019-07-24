const pp = new Worker("worker_opencv.js");
function createImage(url) {
  let img = document.createElement("img");
  img.crossOrigin = "anonymous";
  document.querySelector("section").append(img);
  img.addEventListener("load",function() { alert("ikj"); imgData(this); } );
  img.src = url;
}
function imgData(img) {
  console.log("ok");
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0, img.width, img.height);
  let out = ctx.getImageData(100, 100, 200, 200).data.buffer;
  pp.postMessage({buffer:out,h:canvas.height,w:canvas.width});
}
pp.onmessage = function(e) {
  if (e.data == "LOADED") {
    console.log("loaded");
    createImage("./1.jpg");
  } else {}
};
