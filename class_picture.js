// Developed by Clément Corbin
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
    this.collection = {data:{}}
    this.collection.ready = new Promise((resolve,reject) => {
      this.collection.resolve = resolve;
    });
    this.getCollection();
  };
  async getCollection() {
    fetch(REFERENCES)
      .then(async e => {
        if (e.ok) {
          this.collection.data = (await e.json()).collection;
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
    let feats = await this.features();
    feats = feats.descriptors.toString();
    let match_collection = Array.from(this.collection.data);
    match_collection = await Promise.all(match_collection.map(
      async e => {
        e.match = (await this.worker.postMessage({
          cmd:"match",
          opts:[feats,e.features]
        })).message;
        return e;
      }));
    return match_collection.filter(e => e.match);
  }
}
export { Picture };
