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
function histogram(imgInput,canvasOutput,hsv=false) {
  console.time(canvasOutput);
  let src = cv.imread(imgInput);
  let srcVec = new cv.MatVector();
  srcVec.push_back(src);
  let accumulate = false;
  let channels = [0];
  let histSize = [256];
  let ranges = [0, 255];
  let colors = [new cv.Scalar(255, 0, 0),new cv.Scalar(0, 255, 0),new cv.Scalar(0, 0, 255)]
  if (hsv) {
    console.log("hsv");
    let tmp = new cv.Mat();
    cv.cvtColor(src, tmp, cv.COLOR_RGB2HSV, 0);
    srcVec.push_back(tmp);
    colors = [new cv.Scalar(0, 255, 255),new cv.Scalar(255, 0, 255),new cv.Scalar(255, 255, 0)]
  }
  let color_hist = [new cv.Mat(),new cv.Mat(),new cv.Mat()];
  let mask = new cv.Mat();
  let scale = 2;
  color_hist.map((e,i) => cv.calcHist(srcVec, [i], mask, e, histSize, ranges, accumulate));
  let max = Math.max(...color_hist.map((e) => cv.minMaxLoc(e, mask).maxVal));
  let dst = new cv.Mat.zeros(src.rows, histSize[0] * scale,
                             cv.CV_8UC3);
  console.timeLog(canvasOutput);
  for (let i = 0; i < histSize[0]; i++) {
    color_hist.map(function(e,j) {
      let binVal = e.data32F[i] * src.rows / max;
      let point1 = new cv.Point(i * scale, src.rows - 1);
      let point2 = new cv.Point((i + 1) * scale - 1, src.rows - binVal);
      cv.rectangle(dst, point1, point2, colors[j], cv.FILLED);
    });
  }
  cv.imshow(canvasOutput, dst);
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
      histogram(this,"canvasOutput");
        
    };  
  imgElement.src = URL.createObjectURL(e.target.files[0]);
  }, false);
}
