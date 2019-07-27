/* 
* This class provides a wrapper for sending/receiving messages to a web
* worker. It is instantianted and used like a classic web worker but it
* returns promises instead of providing an onMessage event. It allows
* operation chaining on a worker, waiting for an answer before sending
* next request.
* 
* */
function AWorker(workerPath) {
  const WORKER = new Worker(workerPath);
  this.id = 0;
  this.messagePromises = [];
  this.postMessage = function(message) {
    WORKER.postMessage({id:this.id,message:message});
    this.id++;
    return (new Promise((resolve,reject) => {
      this.messagePromises.push(resolve);
    }));
  }
  this.onMessage = function(callback) {
    let that = this;
    WORKER.onmessage = function(e) {
      callback.call(that,e.data);
    }
  }
  this.messageResolve = function(msgData) {
    if (msgData == "LOADED") { //This is triggered when OpenCV ready
      createImage("./1.jpg");
    } else {
      this.messagePromises[msgData.id](msgData);
    }
  }
  this.onMessage(this.messageResolve);
}
