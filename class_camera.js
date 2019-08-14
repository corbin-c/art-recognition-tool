function Video(video_element) {
  this.video = video_element;
  this.get_camera = async function() {
    _this = this;
    let stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true
        });
    _this.camera_stream = stream;
    _this.video.srcObject = _this.camera_stream;
    return new Promise(function(resolve,reject) {
      _this.video.onloadedmetadata = function() {
        _this.video.play();
        _this.video.setAttribute("style","display:block;");
        let inputElement = document.createElement("button");
        inputElement.setAttribute("id","user_input");
        if (status != "running")
          inputElement.setAttribute("disabled", "true");
        inputElement.innerHTML = "&#128270;";
        document.querySelector("section").append(inputElement);
        inputElement.addEventListener("click", (e) => {
          e.target.remove();
          resolve(_this); //changer la valeur renvoyée
          //_this.stop_camera();
        }, false);
      }
    })
  }
  this.stop_camera = function() {
    this.video.setAttribute("style","display:none;");
    this.camera_stream.getTracks().map(e => e.stop());
  }
}
