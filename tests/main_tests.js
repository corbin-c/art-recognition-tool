const ocv_worker = new Worker("worker_opencv.js");
function createImage(url) {
  let img = document.createElement("img");
  img.crossOrigin = "anonymous";
  document.querySelector("section").append(img);
  img.addEventListener("load",function() { imgData(this); } );
  img.src = url;
}
function imgData(img) {
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
  let picture = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
  picture = new Picture(picture); 
  pp.postMessage({cmd:"blur",opts:[15]});
  pp.postMessage({cmd:"clahe_equalize",opts:[8,5]});
  pp.postMessage({cmd:"threshold"});
}
function data_to_canvas(imgData,visible) {
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  canvas.width = imgData.width;
  canvas.height = imgData.height;
  let z = new Uint8ClampedArray(imgData.data);
  z = new ImageData(z,imgData.width,imgData.height);
  ctx.putImageData(z, 0, 0);
  document.querySelector("section").append(canvas);
}
ocv_worker.onmessage = function(e) {
  if (e.data == "LOADED") {
    createImage("./1.jpg");
  } else {
    data_to_canvas(e.data,true);
    // send received messages to class pictures,
    // create Async/Await logic for sending & receiving messages from
    // worker
  }
};
