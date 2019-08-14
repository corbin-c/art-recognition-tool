/* 
* This class provides a wrapper for sending/receiving messages to a web
* worker. It is instantianted and used like a classic web worker but it
* returns promises instead of providing an onMessage event. It allows
* operation chaining on a worker, waiting for an answer before sending
* next request.
* 
* */
let status = "unavailable";
function AWorker(workerPath) {
  const WORKER = new SharedWorker(workerPath);
  console.log(WORKER);
  console.log(WORKER.port.start());
  this.id = 0;
  this.messagePromises = [];
  this.postMessage = function(message) {
    WORKER.port.postMessage({id:this.id,message:message});
    this.id++;
    return (new Promise((resolve,reject) => {
      this.messagePromises.push(resolve);
    }));
  }
  this.onMessage = function(callback) {
    let that = this;
    WORKER.port.onmessage = function(e) {
      callback.call(that,e.data);
    }
  }
  this.messageResolve = function(msgData) {
    if (msgData == "LOADED") { //This is triggered when OpenCV ready
      this.allow_input();
    } else {
      this.messagePromises[msgData.id](msgData);
    }
  }
  this.allow_input = function() {
    status = "running";
    console.log("loaded");
    if (document.querySelector("#user_input") !== null) {
      if (document.querySelector("#user_input")
          .getAttribute("disabled") !== null) {
        document.querySelector("#user_input")
          .removeAttribute("disabled");
      }
    }
  }
  this.onMessage(this.messageResolve);
}
