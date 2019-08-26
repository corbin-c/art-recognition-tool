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
    this.worker.port.postMessage({id:this.id,message:message});
    this.id++;
    return (new Promise((resolve,reject) => {
      this.messagePromises.push(resolve);
    }));
  }
  onMessage(callback) {
    let that = this;
    this.worker.port.onmessage = function(e) {
      callback.call(that,e.data);
    }
  }
  async messageResolve(msgData) {
    if (msgData == "LOADED") { //This is triggered when OpenCV ready
      this.allowInput();
    } else if (msgData == "FAILURE") {
      //NoOp
    } else {
      this.messagePromises[msgData.id](msgData);
    }
  }
  async allowInput() {
    this.status = "running";
    console.info("OpenCV Shared Worker is loaded");
    try {
      document.querySelector("#user_input")
        .removeAttribute("disabled");
      document.querySelector(".inputLabel")
        .classList.remove("disabled");
    } catch(e) {
      console.info("couldn't allow input");
    }
  }
  onerror(e) {
    console.error("Worker Error",e);
    this.worker = new SharedWorker(this.path);
  }
  get state() { return this.status; };
  constructor(workerPath) {
    this.path = workerPath;
    this.worker = new SharedWorker(workerPath);
    this.worker.port.start();
    this.id = 0;
    this.messagePromises = [];
    this.onMessage(this.messageResolve);
    this.status = "unavailable";
    this.worker.onerror = function(e) {
      console.error(e);
    }
  }
}
export { AWorker };
