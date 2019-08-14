/* 
* This class provides a wrapper for sending/receiving messages to a web
* worker. It is instantianted and used like a classic web worker but it
* returns promises instead of providing an onMessage event. It allows
* operation chaining on a worker, waiting for an answer before sending
* next request.
* 
* */
let AWorker = class {
  postMessage = function(message) {
    this.worker.port.postMessage({id:this.id,message:message});
    this.id++;
    return (new Promise((resolve,reject) => {
      this.messagePromises.push(resolve);
    }));
  }
  onMessage = function(callback) {
    let that = this;
    this.worker.port.onmessage = function(e) {
      callback.call(that,e.data);
    }
  }
  messageResolve = function(msgData) {
    if (msgData == "LOADED") { //This is triggered when OpenCV ready
      this.allow_input();
    } else {
      this.messagePromises[msgData.id](msgData);
    }
  }
  allow_input = function() {
    this.status = "running";
    console.log("loaded");
    try {
      document.querySelector("#user_input").removeAttribute("disabled");
    } catch {
      console.warn("couldn't allow input");
    }
  }
  get state() { return this.status; };
  constructor(workerPath) {
    this.worker = new SharedWorker(workerPath);
    this.worker.port.start();
    this.id = 0;
    this.messagePromises = [];
    this.onMessage(this.messageResolve);
    this.status = "unavailable";
  }
}
export { AWorker };
