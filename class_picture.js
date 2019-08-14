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
  async autocrop() {
    await this.worker.postMessage({cmd:"blur",opts:[15]});
    await this.worker.postMessage({cmd:"clahe_equalize",opts:[8,5]});
    await this.worker.postMessage({cmd:"threshold"});
    await this.worker.postMessage({cmd:"auto_frame"});
  };
  async normalize() {
    await this.worker.postMessage({cmd:"equalize"});
  };
  async analyze() {
    
  };
  async output() {
    let output = await this.worker.postMessage({cmd:"output"});
    return output.message;
  };
}
export { Picture };
