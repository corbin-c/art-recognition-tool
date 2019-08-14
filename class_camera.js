let Video = class {
  constructor(video_element) {
    this.video = video_element;
  }
  async get_camera(status) {
    this.video.srcObject = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true
        });
    await (function(video) { return new Promise(function(resolve,reject) {
      video.onloadedmetadata = function() {
        resolve(true);
      }
    })})(this.video);
    this.video.play();
    this.video.setAttribute("style","display:block;");
    let inputElement = document.createElement("button");
    inputElement.setAttribute("id","user_input");
    if (status != "running")
      inputElement.setAttribute("disabled", "true");
    inputElement.innerHTML = "&#128270;";
    document.querySelector("section").append(inputElement);
    await (function () { return new Promise(function(resolve,reject) {
      inputElement.addEventListener("click", (e) => {
        e.target.remove();
        resolve(true);
      }, false);
    })})();
    return this.video;
  }
  stop_camera() {
    this.video.setAttribute("style","display:none;");
    this.camera_stream.getTracks().map(e => e.stop());
  }
}
export { Video };
