// Developed by Clément Corbin
let Video = class {
  constructor(video_element) {
    this.video = video_element;
  }
  async getCamera(opencv_instance) {
    this.video.srcObject = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: "environment" }
        });
    await (function(video) { return new Promise(
      function(resolve,reject) {
        video.onloadedmetadata = function() {
          resolve(true);
        }
      })})(this.video);
    this.video.play();
    this.video.setAttribute("style","display:block;");
    let inputElement = document.createElement("button");
    inputElement.setAttribute("id","user_input");
    inputElement.setAttribute("class","camera");
    if (opencv_instance.state != "running") {
      inputElement.setAttribute("disabled", "true");
    }
    inputElement.innerHTML = "📷";
    document.querySelector("section").append(inputElement);
    await (function () { return new Promise(function(resolve,reject) {
      inputElement.addEventListener("click", (e) => {
        e.target.remove();
        resolve(true);
      }, false);
    })})();
    return this;
  }
  stopCamera() {
    this.video.setAttribute("style","display:none;");
    this.video.srcObject.getTracks().map(e => e.stop());
  }
}
export { Video };
