// Developed by Clément Corbin
let Video = class {
  constructor(video_element,parent_element) {
    this.video = video_element;
    this.parent_element = parent_element;
  }
  async getCamera(opencv_instance) {
    try {
      this.video.srcObject = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { exact: "environment" } }
      });
    } catch(e) {
      throw new Error("Permission failure:",e);
    }
    try {
    await (function(video) { return new Promise(
      function(resolve,reject) {
        video.onloadedmetadata = function() {
          resolve(true);
        }
      })})(this.video);
    } catch(e) {
      throw new Error("Camera stream couldn't be loaded:",e);
    }
    this.video.play();
    this.video.setAttribute("style","display:block;");
    let inputElement = document.createElement("button");
    inputElement.setAttribute("id","user_input");
    inputElement.setAttribute("class","camera");
    inputElement.setAttribute("disabled", "true");
    document.querySelector(this.parent_element).classList.add("inactive");
    opencv_instance.status.ready.then(() => {
      inputElement.removeAttribute("disabled");
      document.querySelector(this.parent_element).classList.remove("inactive");
    });
    inputElement.innerHTML = "📷";
    document.querySelector(this.parent_element).append(inputElement);
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
