// Developed by Clément Corbin
import { Picture } from "./class_picture.js";
import { Video } from "./class_camera.js";
import { AWorker } from "./class_aworker.js";

const OCV = new AWorker("service_worker.js");
const PARENT = "section";
const MAX_WIDTH = 500;
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
  canvas.width = (img.naturalWidth>MAX_WIDTH)?MAX_WIDTH:img.naturalWidth;
  canvas.height = canvas.width*(img.naturalHeight/img.naturalWidth);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  let picture = ctx.getImageData(0, 0, canvas.width, canvas.height);
  picture = new Picture(picture,OCV);
  /*
   * Eventually, a reduced wasm module with only BFMatcher might be used
   * in order to run this process in separate workers.
   * 
   * If no confirmed match is found, we might run colometric comparison
   * (histogram matching)
   */
  let match = await picture.match();
  /*
   * Instead of logging output, graphical output must be generated w/
   * associated metadata & reference picture. Graphical style from
   * belenos website will be gathered (offset #e0c387 bkg, box-shadow).
   * Links to associated artist page & buy button should be added.
   * 
   * Case when no match should be handled
   */
  if (match === false) {
    alert("no match found :/");
  } else
  {
    console.log(match.file_path,match.match);
    window.location.href = "https://www.belenos-art.com/concept#"
      +match.file_path+","+match.match;
  }
}
function dataToCanvas(imgData,visible=false) {
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  canvas.width = imgData.width;
  canvas.height = imgData.height;
  ctx.putImageData(imgData, 0, 0);
  if (visible) {
    document.querySelector(PARENT).append(canvas);
  }
}
function main(type=false) {
  if (type) {
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
      let type = (radio2.checked) ? "camera":"file";
      form.remove();
      getInput(type);
    });
  } else {
    getInput("camera");
  }
}
async function getInput(type) {
  let out;
  if (type == "camera") {
    out = await addCameraInput();
    imgData(out.video);
    out.stopCamera();
  } else {
    out = await addFileInputHandler();
    createImage(out);
  }
  let againButton = document.createElement("button");
  againButton.setAttribute("id","againButton");
  againButton.innerText = "🌟";
  document.querySelector(PARENT).append(againButton);
  againButton.addEventListener("click", tryAgain);
}
function tryAgain() { //this function must be triggered by clicking on
                      //the again button or by history.back
  document.querySelector(PARENT).innerHTML = "";
  main();
}
async function addFileInputHandler() {
  let inputElement = document.createElement("input");
  inputElement.setAttribute("id","user_input");
  inputElement.setAttribute("type","file");
  inputElement.setAttribute("accept","image/*");
  let inputLabel = document.createElement("label");
  inputLabel.setAttribute("class","inputLabel");
  inputLabel.setAttribute("for","user_input");
  inputLabel.innerText = "🗃";
  inputElement.setAttribute("disabled", "true");
  inputLabel.classList.add("disabled");
  document.querySelector(PARENT).append(inputLabel);
  document.querySelector(PARENT).append(inputElement);
  OCV.status.ready.then(() => {
    inputElement.removeAttribute("disabled");
    inputLabel.classList.remove("disabled");
  });
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
  video = await video.getCamera(OCV);
  return video;
}
main();
