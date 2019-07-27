/* 
 * This class exists within the OpenCV Web Worker. It describes the 
 * image being processsed and its processing states and methods.
 * The class receives its orders from the worker, performs image
 * processing and returns output image data.
 * 
 */
function Picture(imgData) {
  this.original_picture = imgData.clone(); //expected: cv.Mat
  this.working_copy = this.original_picture.clone();
  this.output_copy = this.original_picture.clone();
  imgData.delete();

  this.output = function(q) {
    /*  First we'll convert colorspace back to RGBA so it can be
    *   displayed on a HTML5 Canvas element; */
    this.output_copy = this.working_copy.clone();
    if (this.output_copy.channels() == 1) {
      cv.cvtColor(this.output_copy, this.output_copy,
                  cv.COLOR_GRAY2RGBA, 0);
    } else if (this.output_copy.channels() == 3) {
      cv.cvtColor(this.output_copy, this.output_copy,
                  cv.COLOR_RGB2RGBA, 0);
    }
    return {
      width:this.output_copy.cols,
      height:this.output_copy.rows,
      data:this.output_copy.data
    }
  }
  
  this.blur = function(q) {
    q = Math.round(this.working_copy.cols/2500*q); //Q Factor must be
                                                  //picture-independent
    cv.blur(this.working_copy, this.working_copy, (new cv.Size(q, q)),
            (new cv.Point(-1, -1)), cv.BORDER_DEFAULT);
  }
  
  this.threshold = function() {
    cv.threshold(this.working_copy, this.working_copy, 1, 255,
                  cv.THRESH_OTSU); //use Otsu Algorithm to determine
                                  //the optimal threshold value
  }

  this.clahe_equalize = function(q,depth) {
    // Contrast-Limited Adaptative Histogram Equalization
    q = Math.round(this.working_copy.cols/2500*q);
    cv.cvtColor(this.working_copy, this.working_copy,
                cv.COLOR_RGBA2GRAY, 0); //Colorspace: RGBA -> grayscale
    let dst = new cv.Mat();
    let clahe = new cv.CLAHE(depth, (new cv.Size(q, q)));
    clahe.apply(this.working_copy, dst);
    this.working_copy = dst.clone();
    dst.delete();
    clahe.delete();
  }

  this.equalize = function() {
    let dst = [new cv.Mat(),new cv.Mat(),new cv.Mat()];
    let rgbaPlanes = new cv.MatVector();
    let dstVect = new cv.MatVector();
    cv.split(this.working_copy, rgbaPlanes);
    dst.map((e,i) => cv.equalizeHist(rgbaPlanes.get(i), e));
    dst.map(e => dstVect.push_back(e));
    cv.merge(dstVect, this.working_copy);
    dst.map(e => e.delete());
    rgbaPlanes.delete();
    dstVect.delete();
  }

  this.order_matrix = function(mat) {
    /* This function orders 4 points to form a rectangle : top-left,
     * top-right, bottom-right & bottom-left; */
    let xs = mat.map(e => e[0]);
    let ys = mat.map(e => e[1]);
    let cx = 0.5*(Math.max(...xs)-Math.min(...xs))+Math.min(...xs);
    let cy = 0.5*(Math.max(...ys)-Math.min(...ys))+Math.min(...ys);
    let out = [[],[],[],[]];
    mat.map(function(e) {
      if (e[0] < cx) {
        if (e[1] < cy) {
          out[0] = e;
        } else {
          out[3] = e;
        }
      } else {
        if (e[1] < cy) {
          out[1] = e;
        } else {
          out[2] = e;
        }    
      }
    });
    return out;
  }
}
/* Changer la fonction d'histogrammes pour ne plus output de visuel mais seuelement les données brutes.
 * Donc également changer l'output pour ne pas seulement gérer que des imgData
function crop_rotated_rect(src,srcTri,rect) {
  let dst = new cv.Mat();
  let w = rect.size.width;
  let h = rect.size.height;
  if (rect.angle < -45) {
    w = rect.size.height;
    h = rect.size.width;
  }
  let dsize = new cv.Size(w,h);
  let dstTri = [0,0,w,0,w,h,0,h];
  dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, dstTri);
  let M = cv.getPerspectiveTransform(srcTri, dstTri);
  cv.warpPerspective(src, dst, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
  return dst;
}

function outer_edges(imgInput) {
  //INIT
  let white = new cv.Scalar(255,255,255);
  let red = new cv.Scalar(255, 0, 0);
  let green = new cv.Scalar(0, 255, 0);
  let yellow = new cv.Scalar(255, 255, 0);
  let time = (new Date().valueOf());
  console.time(time);
  let src = cv.imread(imgInput);
  let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
  //CLAHE EQUALIZATION
  src = clahe_equalize(src);
  console.log("blurring done");
  console.timeLog(time);
  //BLURRING
  src = blur(src,15);
  console.log("blurring done");
  console.timeLog(time);
  //RGB2GRAY & THRESHOLDING
  src = threshold(src);
  console.log("threshold done");
  console.timeLog(time);
  //CONTOURS DETECTION
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(src, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);
  let largestArea = 0;
  let largestContour = 0;
  //LARGEST CONTOUR DETECTION
  for (let i = 0; i < contours.size(); ++i) {
      let area = cv.contourArea(contours.get(i),true);
      cv.drawContours(dst,contours,i,yellow,2,8,hierarchy,0);
      if (area > largestArea) {
        largestArea = area;
        largestContour = i;
      }
  }
  console.log("largest contour found");
  console.timeLog(time);
  cv.drawContours(dst, contours, largestContour, white, cv.FILLED, cv.LINE_8, hierarchy, 100);
  let external = contours.get(largestContour);
  //MINIMAL BOUNDING RECT
  let rotatedRect = cv.minAreaRect(external);
  let vertices = cv.RotatedRect.points(rotatedRect);
  for (let i = 0; i < 4; i++) {
      cv.line(dst, vertices[i], vertices[(i + 1) % 4], green, 2, cv.LINE_AA, 0);
  }
  console.log("minimal bounding rect");
  console.timeLog(time);
  //CONTOUR POLYGON
  let poly = new cv.Mat();
  let contours_poly = new cv.MatVector();
  cv.approxPolyDP(external,poly,0.1*cv.arcLength(external,true),true);
  contours_poly.push_back(poly);
  cv.drawContours(dst,contours_poly,0,red,2,8,hierarchy,0);
  console.log("approx Poly DP");
  console.timeLog(time);
  let dstTri = [[vertices[0].x,vertices[0].y],[vertices[1].x,vertices[1].y],
                  [vertices[2].x,vertices[2].y],[vertices[3].x,vertices[3].y]];
  console.log(dstTri);
  console.log(order_matrix(dstTri).flat());
  dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, order_matrix(dstTri).flat());
  if ((poly.size().height == 4) && (cv.isContourConvex(poly))) { //PERSPECTIVE CORRECTION
    let dsize = new cv.Size(src.cols, src.rows);
    let srcTri = [[poly.intAt(0),poly.intAt(1)],[poly.intAt(2),poly.intAt(3)],
                  [poly.intAt(4),poly.intAt(5)],[poly.intAt(6),poly.intAt(7)]];
    srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, order_matrix(srcTri).flat());
    let M = cv.getPerspectiveTransform(srcTri, dstTri);
    cv.warpPerspective(cv.imread(imgInput), dst, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
    dst = crop_rotated_rect(dst,dstTri,rotatedRect);
  } else {
    let dsize = new cv.Size(src.cols, src.rows);
    let srcTri = [0,0,src.cols,0,src.cols,src.rows,0,src.rows];
    srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, srcTri);
    let M = cv.getPerspectiveTransform(dstTri, srcTri);
    cv.warpPerspective(cv.imread(imgInput), dst, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
  }
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
  //document.getElementById(output(dst)).setAttribute("style","height: 50vh;");
  console.timeEnd(time);
}
*/
