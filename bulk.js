/*if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js", { scope: "/" });
}*/
import { Picture } from "./class_picture.js";
import { AWorker } from "./class_aworker.js";

const OCV = new AWorker("worker_opencv.js");
const PARENT = "section";
const MAX_WIDTH = 1000;
function createImage(url) {
  let img = document.createElement("img");
  img.crossOrigin = "anonymous";
  img.addEventListener("load",function() { imgData(this,true); } );
  img.src = url;
}
async function imgData(img,visible=false) {
  let canvas = document.createElement("canvas");
  if (visible) {
    document.querySelector(PARENT).append(canvas);
  }
  let ctx = canvas.getContext("2d");
  if (typeof img.naturalHeight === "undefined") {
    img.naturalHeight = img.videoHeight;
    img.naturalWidth = img.videoWidth;
  }
  canvas.width = MAX_WIDTH;
  canvas.height = MAX_WIDTH*(img.naturalHeight/img.naturalWidth);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  let picture = ctx.getImageData(0, 0, canvas.width, canvas.height);
  picture = new Picture(picture,OCV);
  //let out = await picture.autocrop(true);
  //out.map(e => data_to_canvas(e,true));
  //await picture.normalize();
  let feats = await picture.features(true);
  console.log(feats.descriptors.toString()); // stringified descriptors for json storage
  /*
   * Here we need to picture.match(feats.descriptors); This will run a
   * cv.BFMatcher on every picture in the reference collection.
   * Eventually, a reduced wasm module with only BFMatcher might be used
   * in order to run this process in separate workers.
   * 
   * If no confirmed match is found, we might run colometric comparison
   * (histogram matching)
   * 
   * We also need a way to feed the json w/ data running this imgData()
   * on a large set of pictures)
   */
  data_to_canvas(await picture.output(),true);
}
function data_to_canvas(imgData,visible=false) {
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  canvas.width = imgData.width;
  canvas.height = imgData.height;
  ctx.putImageData(imgData, 0, 0);
  if (visible) {
    document.querySelector(PARENT).append(canvas);
  }
}
async function main() {
  let collection = await fetch("bulk/index.php");
  collection = (await collection.json()).collection;
  collection.map(e => createImage("./bulk/"+e.file_path));
}
main();
