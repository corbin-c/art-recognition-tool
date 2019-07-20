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
function equalize(imgInput,canvasSrc,canvasOut) {
  console.time(canvasOut);
  let src = cv.imread(imgInput);
  cv.imshow(canvasSrc, src);
  let dst = [new cv.Mat(),new cv.Mat(),new cv.Mat()];
  let rgbaPlanes = new cv.MatVector();
  let dstVect = new cv.MatVector();
  cv.split(src, rgbaPlanes);
  dst.map((e,i) => cv.equalizeHist(rgbaPlanes.get(i), e));
  dst.map(e => dstVect.push_back(e));
  cv.merge(dstVect, src);
  cv.imshow(canvasOut, src);
  console.timeLog(canvasOut);
}
function histogram(imgInput,canvasOutput,hsv=false) {
  console.time(canvasOutput);
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
  let dst = new cv.Mat.zeros(src.rows, histSize[0],
                             cv.CV_8UC3);
  console.timeLog(canvasOutput);
  for (let i = 0; i < histSize[0]; i++) {
    color_hist.map(function(e,j) {
      let binVal = e.data32F[i] * src.rows / max;
      let point1 = new cv.Point(i, src.rows - 1);
      let point2 = new cv.Point((i + 1) - 1, src.rows - binVal);
      cv.rectangle(dst, point1, point2, colors[j], cv.FILLED);
    });
  }
  cv.imshow(canvasOutput, dst);
  document.getElementById(canvasOutput).setAttribute("style","width: 50vw;");
  console.timeEnd(canvasOutput);
}
function onOpenCvReady() {
  console.log("opencv loaded");
  let inputElement = document.createElement("input");
  inputElement.setAttribute("type","file");
  inputElement.setAttribute("accept","image/*");
  document.querySelector("section").insertBefore(inputElement,document.querySelector("#canvasOutput"));
  inputElement.addEventListener("change", (e) => {
    let imgElement = document.createElement("img");
    imgElement.onload = function() {
      //histogram(this,"canvasOutput2",true);
      equalize(this,"canvasOutput","canvasOutput2");
        
    };  
  imgElement.src = URL.createObjectURL(e.target.files[0]);
  }, false);
}
