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
    this.worker.postMessage({id:this.id,message:message});
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
      this.allowInput();
    } else if (msgData == "FAILURE") {
      //NoOp
    } else {
      this.messagePromises[msgData.id](msgData);
    }
  }
  async allowInput() {
    this.status = "running";
    console.info("OpenCV Worker is loaded");
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
  }
  get state() { return this.status; };
  constructor(workerPath) {
    this.id = 0;
    this.messagePromises = [];
    this.onMessage(this.messageResolve);
    navigator.serviceWorker.register(workerPath, { scope: "/" });
    this.worker = navigator.serviceWorker.controller;
    this.status = "unavailable";
    if (this.worker !== null) {
      this.postMessage("preload");
    }
  }
}
export { AWorker };
