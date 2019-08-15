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
      this.allow_input();
    } else if (msgData == "FAILURE") {
      console.warn("OpenCV Init Failed. Try again in 5 sec.");
      await incr_wait(0,5000);
      this.worker.port.postMessage({cmd:"fail"});
    } else {
      this.messagePromises[msgData.id](msgData);
    }
  }
  async allow_input() {
    this.status = "running";
    console.log("loaded");
    try {
      document.querySelector("#user_input")
        .removeAttribute("disabled");
      document.querySelector(".inputLabel")
        .classList.remove("disabled");
    } catch(e) {
      console.log("couldn't allow input");
    }
  }
  get state() { return this.status; };
  incr_wait(i,t,rand=false)
  {
    t = (rand) ? Math.floor(t+2*t*Math.random()):t;
    return new Promise(function(resolve,reject){
      setTimeout(function(){
        resolve(i+1);
      },t)
    })
  }
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
