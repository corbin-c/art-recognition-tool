/**
 * JS Wrapper to use common OpenCV Feature to analyze images.
 * It depends on opencv.js, WASM-compiled OpenCV release.
 * 
 * Developed by Clément CORBIN
 */
const PARENT = "section";
function img_properties(src) {
  console.log("image width: " + src.cols);
  console.log("image height: " + src.rows);
  console.log("image size: " + src.size().width + "*" + src.size().height);
  console.log("image depth: " + src.depth());
  console.log("image channels " + src.channels());
  console.log("image type: " + src.type());
}
function pixel_at(src,x,y) {
  if (src.isContinuous()) {
    return [src.data[x * src.cols * src.channels() + y * src.channels()],
            src.data[x * src.cols * src.channels() + y * src.channels() + 1],
            src.data[x * src.cols * src.channels() + y * src.channels() + 2],
            src.data[x * src.cols * src.channels() + y * src.channels() + 3]]
  } else {
      console.warn("Uncontinuous data");
      return false;
  }
}
function output(imgData) {
  let c = document.createElement("canvas");
  let id = "canvas_out_"+(new Date()).valueOf();
  c.setAttribute("id",id);
  document.querySelector(PARENT).append(c);
  cv.imshow(id, imgData);
  return id;
}
function outer_edges(imgInput) {
  let time = (new Date().valueOf());
  console.time(time);
  let src = cv.imread(imgInput);
  let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
  cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
  cv.threshold(src, src, 127, 255, cv.THRESH_BINARY);
  console.log("image threshold done");
  console.timeLog(time);
  output(src);
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  //cv.medianBlur(src, src, 5);
  //output(src);
  cv.Canny(src, src, 60, 100);
  output(src);
  cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
  for (let i = 0; i < contours.size(); ++i) {
      let color = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
                                Math.round(Math.random() * 255));
      cv.drawContours(dst, contours, i, color, 1, cv.LINE_8, hierarchy, 100);
  }
  output(dst);
  console.timeEnd(time);
}
function equalize(imgInput) {
  let time = (new Date().valueOf());
  console.time(time);
  let src = cv.imread(imgInput);
  let dst = [new cv.Mat(),new cv.Mat(),new cv.Mat()];
  let rgbaPlanes = new cv.MatVector();
  let dstVect = new cv.MatVector();
  cv.split(src, rgbaPlanes);
  dst.map((e,i) => cv.equalizeHist(rgbaPlanes.get(i), e));
  dst.map(e => dstVect.push_back(e));
  cv.merge(dstVect, src);
  output(src);
  console.timeEnd(time);
}
function histogram(imgInput,hsv=false) {
  let time = (new Date().valueOf());
  console.time(time);
  let src = cv.imread(imgInput);
  let srcVec = new cv.MatVector();
  srcVec.push_back(src);
  let histSize = [256];
  let ranges = [0, 255];
  let colors = [new cv.Scalar(255, 0, 0),new cv.Scalar(0, 255, 0),new cv.Scalar(0, 0, 255)]
  if (hsv) {
    console.log("hsv");
    cv.cvtColor(src, src, cv.COLOR_RGB2HSV, 0);
    srcVec = new cv.MatVector();
    srcVec.push_back(src);
    colors = [new cv.Scalar(0, 255, 255),new cv.Scalar(255, 0, 255),new cv.Scalar(255, 255, 0)]
  }
  let color_hist = [new cv.Mat(),new cv.Mat(),new cv.Mat()];
  let mask = new cv.Mat();
  color_hist.map((e,i) => cv.calcHist(srcVec, [i], mask, e, histSize, ranges, false));
  let max = Math.max(...color_hist.map((e) => cv.minMaxLoc(e, mask).maxVal));
  let dst = new cv.Mat.zeros(src.rows, histSize[0], cv.CV_8UC3);
  console.timeLog(time);
  for (let i = 0; i < histSize[0]; i++) {
    color_hist.map(function(e,j) {
      let binVal = e.data32F[i] * src.rows / max;
      let point1 = new cv.Point(i, src.rows - 1);
      let point2 = new cv.Point((i + 1) - 1, src.rows - binVal);
      cv.rectangle(dst, point1, point2, colors[j], cv.FILLED);
    });
  }
  document.getElementById(output(dst)).setAttribute("style","height: 50vh;");
  console.timeEnd(time);
}

let utils = new Utils('errorMessage');
utils.loadOpenCv(() => {
  console.log("opencv loaded");
  let inputElement = document.createElement("input");
  inputElement.setAttribute("type","file");
  inputElement.setAttribute("accept","image/*");
  document.querySelector("section").insertBefore(inputElement,document.querySelector("#canvasOutput"));
  inputElement.addEventListener("change", (e) => {
    let imgElement = document.createElement("img");
    imgElement.onload = function() {
      output(cv.imread(this));
      /*histogram(this,false);
      histogram(this,true);*/
      equalize(this);
      //outer_edges(this);
    };  
  imgElement.src = URL.createObjectURL(e.target.files[0]);
  }, false);
  });
