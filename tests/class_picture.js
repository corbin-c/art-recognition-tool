/* 
* must instantiante worker w/ imgData=ctx.getImageData(sx, sy, sw, sh);
* This class describes an input image. Its methods calls (asyncronously
* or not) for the OpenCV Wrapper Worker, which handles image processing.
* 
*/
function Picture(imgData) {
  ocv_worker.postMessage({imgData:imgData,cmd:"init"});
}
