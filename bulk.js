// Developed by Clément Corbin
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
  return new Promise(function(resolve,reject) {
    img.addEventListener("load",async function() {
      let data = await imgData(this);
      resolve(data);
    });
    img.src = url;
  })
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
  let feats = await picture.features();
  await picture.clean();
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
  picture = null;
  return feats.descriptors.toString();
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
function output(filename, data, type)
{
  var blob = new Blob([data], {type: type});
  var elem = window.document.createElement('a');
  elem.href = window.URL.createObjectURL(blob);
  elem.download = filename;        
  document.body.appendChild(elem);
  elem.click();        
  document.body.removeChild(elem);
}
function incr_wait(i,t,rand=false)
{
  t = (rand) ? Math.floor(t+2*t*Math.random()):t;
  return new Promise(function(resolve,reject){
    setTimeout(function(){
      resolve(i+1);
    },t)
  })
}
async function main() {
  let inputElement = document.createElement("button");
  inputElement.setAttribute("id","user_input");
  inputElement.setAttribute("class","camera");
  if (OCV.state != "running") {
    inputElement.setAttribute("disabled", "true");
  }
  inputElement.innerHTML = "📷";
  document.querySelector("section").append(inputElement);
  await (function () { return new Promise(function(resolve,reject) {
    inputElement.addEventListener("click", (e) => {
      e.target.remove();
      resolve(true);
    }, false);
  })})();
  let collection = await fetch("bulk/index.php");
  collection = (await collection.json()).collection;
  for (let e in collection) { 
    collection[e].features =
      await createImage("./bulk/"+collection[e].file_path);
    await incr_wait(0,500);
  }
  output("collection.json",
    JSON.stringify({ collection:collection }),
    "application/json");
}

main();
