/* 
* must instantiante worker w/ imgData=ctx.getImageData(sx, sy, sw, sh);
* This class describes an input image. Its methods calls (asyncronously
* or not) for the OpenCV Wrapper Worker, which handles image processing.
* 
*/
import { OCV_Picture } from "./worker_class_picture.js";
function Picture(imgData) {
  console.log("CS pic class instantiated");
  let ocv = new OCV_Picture(imgData);
  this.autocrop = async function() {
    ocv.blur(15);
    ocv.clahe_equalize(8,5);
    ocv.threshold();
    ocv.auto_frame();
  };
  this.normalize = async function() {
    ocv.equalize();
  };
  this.analyze = async function() {
    alert("NoOp");
  };
  this.output = async function() {
    data_to_canvas(ocv.output(),
                  true);
  };
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
export { Picture };
