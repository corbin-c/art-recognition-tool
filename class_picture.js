/* 
* must instantiante worker w/ imgData=ctx.getImageData(sx, sy, sw, sh);
* This class describes an input image. Its methods calls (asyncronously
* or not) for the OpenCV Wrapper Worker, which handles image processing.
* 
*/
function Picture(imgData,worker) {
  worker.postMessage({imgData:imgData,cmd:"init"});
  this.autocrop = async function() {
      await worker.postMessage({cmd:"blur",opts:[15]});
      await worker.postMessage({cmd:"clahe_equalize",opts:[8,5]});
      await worker.postMessage({cmd:"threshold"});
      await worker.postMessage({cmd:"auto_frame"});
  };
  this.normalize = async function() {
    await worker.postMessage({cmd:"equalize"});
  };
  this.analyze = async function() {
    
  };
  this.output = async function() {
    data_to_canvas((await worker.postMessage({cmd:"output"})).message,
                  true);
  };
}
