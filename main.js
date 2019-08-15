/*if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js", { scope: "/" });
}*/
import { Picture } from "./class_picture.js";
import { Video } from "./class_camera.js";
import { AWorker } from "./class_aworker.js";

const OCV = new AWorker("worker_opencv.js");
const PARENT = "section";
const MAX_WIDTH = 1000;

function createImage(url) {
  let img = document.createElement("img");
  img.crossOrigin = "anonymous";
  img.addEventListener("load",function() { imgData(this,true); } );
  img.src = url;
}
async function imgData(img,visible=false) {
  let canvas = document.createElement("canvas");
  if (visible) {
    document.querySelector(PARENT).append(canvas);
  }
  let ctx = canvas.getContext("2d");
  if (typeof img.naturalHeight === "undefined") {
    img.naturalHeight = img.videoHeight;
    img.naturalWidth = img.videoWidth;
  }
  canvas.width = MAX_WIDTH;
  canvas.height = MAX_WIDTH*(img.naturalHeight/img.naturalWidth);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  let picture = ctx.getImageData(0, 0, canvas.width, canvas.height);
  picture = new Picture(picture,OCV);
  let out = await picture.autocrop(true);
  out.map(e => data_to_canvas(e,true));
  await picture.normalize();
  data_to_canvas(await picture.output(),true);
}
function data_to_canvas(imgData,visible=false) {
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  canvas.width = imgData.width;
  canvas.height = imgData.height;
  ctx.putImageData(imgData, 0, 0);
  if (visible) {
    document.querySelector(PARENT).append(canvas);
  }
}
function main() {
  let form = document.createElement("form");
  let radio = document.createElement("input");
  let l_radio = document.createElement("label");
  let radio2 = document.createElement("input");
  let l_radio2 = document.createElement("label");
  let button = document.createElement("button");
  
  radio.setAttribute("type","radio");
  radio2.setAttribute("type","radio");
  radio.setAttribute("id","file");
  radio2.setAttribute("id","camera");
  radio.setAttribute("name","type");
  radio2.setAttribute("name","type");
  l_radio.innerHTML = "File Input";
  l_radio2.innerHTML = "Camera Input";
  button.innerHTML = "✔️";
  
  form.append(l_radio);
  l_radio.append(radio);
  form.append(l_radio2);
  l_radio2.append(radio2);
  
  form.append(button);
  document.querySelector("section").append(form);
  button.addEventListener("click", async function(e) {
    e.preventDefault();
    let type;
    type = (radio2.checked) ? "camera":"file";
    form.remove();
    get_input(type);
  });
}
async function get_input(type) {
  let out;
  if (type == "camera") {
    out = await addCameraInput();
    imgData(out.video,true);
    out.stop_camera();
  } else {
    out = await addFileInputHandler();
    createImage(out);
  }
  let againButton = document.createElement("button");
  againButton.setAttribute("id","againButton");
  againButton.innerText = "🌟";
  document.querySelector(PARENT).append(againButton);
  againButton.addEventListener("click", function() {
    document.querySelector(PARENT).innerHTML = "";
    main();
  });
}
function addFileInputHandler() {
  let inputElement = document.createElement("input");
  inputElement.setAttribute("id","user_input");
  inputElement.setAttribute("type","file");
  inputElement.setAttribute("accept","image/*");
  let inputLabel = document.createElement("label");
  inputLabel.setAttribute("class","inputLabel");
  inputLabel.setAttribute("for","user_input");
  inputLabel.innerText = "🗃";
  if (OCV.state != "running") {
    inputElement.setAttribute("disabled", "true");
    inputLabel.classList.add("disabled");
  }
  document.querySelector(PARENT).append(inputLabel);
  document.querySelector(PARENT).append(inputElement);
  return new Promise(function(resolve,reject) {
    inputElement.addEventListener("change", (e) => {
        let files = e.target.files;
        document.querySelector(".inputLabel").remove();
        e.target.remove();
        if (files.length > 0) {
            resolve(URL.createObjectURL(files[0]))
        }
    }, false);
  })
};
async function addCameraInput() {
  let video = document.createElement("video");
  document.querySelector(PARENT).append(video);
  video = new Video(video);
  video = await video.get_camera(OCV);
  return video;
}
window.onbeforeunload = function() {
  console.warn("exit");
  OCV.postMessage({cmd:"quit"});
}
main();
