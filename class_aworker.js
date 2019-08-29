// Developed by Clément Corbin
/* 
* This class provides a wrapper for sending/receiving messages to a web
* worker. It is instantianted and used like a classic web worker but it
* returns promises instead of providing an onMessage event. It allows
* operation chaining on a worker, waiting for an answer before sending
* next request.
* 
* */

let AWorker = class {
  postMessage(message) {
    navigator.serviceWorker.controller
      .postMessage({id:this.id,message:message});
    this.id++;
    return (new Promise((resolve,reject) => {
      this.messagePromises.push(resolve);
    }));
  }
  onMessage(callback) {
    let that = this;
    navigator.serviceWorker.addEventListener('message', (e) => {
      callback.call(that,e.data);
    });
  }
  async messageResolve(msgData) {
    if (msgData == "LOADED") { //This is triggered when OpenCV ready
      await this.postMessage("loaded");
      this.status[0](true);
      console.info("OpenCV ready");
    } else if (msgData == "FAILURE") {
      //NoOp
    } else {
      try {
        this.messagePromises[msgData.id](msgData);
      } catch {
        console.warn("couldn't resolve message");
      }
    }
  }
  constructor(workerPath) {
    this.id = 0;
    this.messagePromises = [];
    this.status = [];
    this.onMessage(this.messageResolve);
    navigator.serviceWorker.register(workerPath, { scope: "/" });
    this.status.push((new Promise((resolve,reject) => {
      this.status.push(resolve);
    })));
    if (navigator.serviceWorker.controller !== null) {
      this.postMessage("preload");
    }
  }
}
export { AWorker };
