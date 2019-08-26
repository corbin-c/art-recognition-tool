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
    this.collection = {}
    this.collection.ready = new Promise((resolve,reject) => {
      this.collection.resolve = resolve;
    });
    this.getCollection();
  };
  async getCollection() {
    this.collection.data = await fetch(REFERENCES)
      .then(e => {
        if (e.ok) {
          e.json();
          this.collection.resolve(true);
        } else {
          throw new Error("Fetch fail");
        }
      })
      .catch(e => console.error("Collection retrieval failure:",e));
  }
  async autocrop(debugging=false) {
    let out = [];
    await this.worker.postMessage({cmd:"blur",opts:[15]});
    if (debugging) { out.push(await this.output()); }
    await this.worker.postMessage({cmd:"claheEqualize",opts:[8,5]});
    if (debugging) { out.push(await this.output()); }
    await this.worker.postMessage({cmd:"threshold"});
    if (debugging) { out.push(await this.output()); }
    await this.worker.postMessage({cmd:"autoFrame"});
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
      {cmd:"orbFeatures",opts:[draw]})).message;
  }
  async analyze() {
    //NoOp
  };
  async output() {
    let output = await this.worker.postMessage({cmd:"output"});
    return output.message;
  };
  async clean() {
    await this.worker.postMessage({cmd:"cleanPicture"});
  }
  async match() {
    await this.collection.ready;
    console.info("Collection ready");
  }
}
export { Picture };
