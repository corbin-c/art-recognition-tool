const worker = new AWorker("worker_opencv.js");
function createImage(url) {
  let img = document.createElement("img");
  img.crossOrigin = "anonymous";
  document.querySelector("section").append(img);
  img.addEventListener("load",function() { imgData(this); } );
  img.src = url;
}
async function imgData(img) {
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
  let picture = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
  picture = new Picture(picture); 
  await worker.postMessage({cmd:"blur",opts:[15]});
  await worker.postMessage({cmd:"clahe_equalize",opts:[8,5]});
  await worker.postMessage({cmd:"threshold"});
  data_to_canvas((await worker.postMessage({cmd:"output"})).message,true);
}
function data_to_canvas(imgData,visible=false) {
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  canvas.width = imgData.width;
  canvas.height = imgData.height;
  let z = new Uint8ClampedArray(imgData.data);
  z = new ImageData(z,imgData.width,imgData.height);
  ctx.putImageData(z, 0, 0);
  if (visible)
    document.querySelector("section").append(canvas);
}
