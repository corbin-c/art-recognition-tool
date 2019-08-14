/* 
* must instantiante worker w/ imgData=ctx.getImageData(sx, sy, sw, sh);
* This class describes an input image. Its methods calls (asyncronously
* or not) for the OpenCV Wrapper Worker, which handles image processing.
* 
*/
let Picture = class {
  constructor(imgData,worker) {
    this.worker = worker;
    worker.postMessage({imgData:imgData,cmd:"init"});
  };
  autocrop = async function() {
      await this.worker.postMessage({cmd:"blur",opts:[15]});
      await this.worker.postMessage({cmd:"clahe_equalize",opts:[8,5]});
      await this.worker.postMessage({cmd:"threshold"});
      await this.worker.postMessage({cmd:"auto_frame"});
  };
  normalize = async function() {
    await this.worker.postMessage({cmd:"equalize"});
  };
  analyze = async function() {
    
  };
  output = async function() {
    data_to_canvas((await this.worker.postMessage({cmd:"output"})).message,
                  true);
  };
}
