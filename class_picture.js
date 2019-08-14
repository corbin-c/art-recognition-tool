/* 
* must instantiante worker w/ imgData=ctx.getImageData(sx, sy, sw, sh);
* This class describes an input image. Its methods calls (asyncronously
* or not) for the OpenCV Wrapper Worker, which handles image processing.
* 
*/
import cv from "opencv.js";
import OCV from "worker_class_picture.js";
function Picture(imgData) {
  console.log("CS pic class instantiated");
  ocv = new OCV(imgData);
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
