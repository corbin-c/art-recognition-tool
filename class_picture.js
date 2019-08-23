/* 
* must instantiante worker w/ imgData=ctx.getImageData(sx, sy, sw, sh);
* This class describes an input image. Its methods calls (asyncronously
* or not) for the OpenCV Wrapper Worker, which handles image processing.
* 
*/
const REFERENCES = "./collection.json"; //this is to be updated
                                       // w/ API endpoint 
let Picture = class {
  constructor(imgData,worker) {
    this.worker = worker;
    worker.postMessage({imgData:imgData,cmd:"init"});
    this.get_collection();
  };
  async get_collection() {
    this.collection = await fetch(REFERENCES);
    this.collection = await this.collection.json();
    console.log(this.collection);
  }
  async autocrop(debugging=false) {
    let out = [];
    await this.worker.postMessage({cmd:"blur",opts:[15]});
    if (debugging) { out.push(await this.output()); }
    await this.worker.postMessage({cmd:"clahe_equalize",opts:[8,5]});
    if (debugging) { out.push(await this.output()); }
    await this.worker.postMessage({cmd:"threshold"});
    if (debugging) { out.push(await this.output()); }
    await this.worker.postMessage({cmd:"auto_frame"});
    if (debugging) {
      out.push(await this.output());
      return out;
    }
  };
  async normalize() {
    await this.worker.postMessage({cmd:"equalize"});
  };
  async features(draw=false) {
    return (await this.worker.postMessage(
      {cmd:"orb_features",opts:[draw]})).message;
  }
  async analyze() {
    //NoOp
  };
  async output() {
    let output = await this.worker.postMessage({cmd:"output"});
    return output.message;
  };
}
export { Picture };
