if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js", { scope: "/" });
}
const OCV = new AWorker("worker_opencv.js");
function createImage(url) {
  console.log("Fn createImage");
  let img = document.createElement("img");
  img.crossOrigin = "anonymous";
  document.querySelector("section").append(img);
  img.addEventListener("load",function() { imgData(this); } );
  img.src = url;
  console.log("Image created");
}
async function imgData(img) {
  console.log("Fn imgData");
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
  console.log("img drawn to canvas");
  let picture = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
  console.log("img data gathered");
  picture = new Picture(picture,OCV);
  console.log("ocv img created");
  await picture.autocrop();
  await picture.normalize();
  picture.output();
}
function data_to_canvas(imgData,visible=false) {
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  canvas.width = imgData.width;
  canvas.height = imgData.height;
  let z = new Uint8ClampedArray(imgData.data);
  z = new ImageData(z,imgData.width,imgData.height);
  ctx.putImageData(z, 0, 0);
  if (visible)
    document.querySelector("section").append(canvas);
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
  
  button.innerHTML = "OK !";
  
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
    type = await get_input(type);
    createImage(type);
  });
}
async function get_input(type) {
  let out;
  if (type == "camera") {
    out = await addCameraInput();
    console.log(out);
  } else {
    out = await addFileInputHandler();
  }
  return out;
}
function addFileInputHandler() {
  let inputElement = document.createElement("input");
  inputElement.setAttribute("id","user_input");
  inputElement.setAttribute("type","file");
  inputElement.setAttribute("accept","image/*");
  if (status != "running")
    inputElement.setAttribute("disabled", "true");
  document.querySelector("section").append(inputElement);
  return new Promise(function(resolve,reject) {
    inputElement.addEventListener("change", (e) => {
        let files = e.target.files;
        e.target.remove();
        if (files.length > 0) {
            resolve(URL.createObjectURL(files[0]))
        }
    }, false);
  })
};
async function addCameraInput() {
  let video = document.createElement("video");
  video = new Video(video);
  video = await video.get_camera();
  return video;
}
main();
