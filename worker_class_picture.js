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
  imgData.delete();
<<<<<<< HEAD
  this.output = function(q) {
=======
  console.log("worker class picture initialized");
  this.output = function() {
>>>>>>> master
    /*  First we'll convert colorspace back to RGBA so it can be
    *   displayed on a HTML5 Canvas element; */
    return cv.imshow(this.working_copy);
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

  this.histogram = function(q,depth,hsv=false) {
    let srcVec = new cv.MatVector();
    srcVec.push_back(this.working_copy);
    let histSize = [q];
    let ranges = [0, depth];
    if (hsv) {
      cv.cvtColor(this.working_copy, this.working_copy,
                  cv.COLOR_RGB2HSV, 0);
      srcVec = new cv.MatVector();
      srcVec.push_back(this.working_copy);
      cv.cvtColor(this.working_copy, this.working_copy,
                  cv.COLOR_HSV2RGB, 0);
    }
    let color_hist = [new cv.Mat(),new cv.Mat(),new cv.Mat()];
    let mask = new cv.Mat();
    color_hist.map((e,i) => cv.calcHist(srcVec, [i], mask, e, histSize,
                                        ranges, false));
    srcVec.delete();
    mask.delete();
    //convertir color_hist en simple tableau et le retourner
    color_hist.map(e => e.delete());
  }

  this.auto_frame = function() {
    //INIT
    let white = new cv.Scalar(255,255,255);
    let red = new cv.Scalar(255, 0, 0);
    let green = new cv.Scalar(0, 255, 0);
    let yellow = new cv.Scalar(255, 255, 0);
    let dst = cv.Mat.zeros(this.working_copy.rows,
                          this.working_copy.cols, cv.CV_8UC3);
    //CONTOURS DETECTION
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(this.working_copy, contours, hierarchy,
                    cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);
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
    cv.drawContours(dst, contours, largestContour, white, cv.FILLED,
                    cv.LINE_8, hierarchy, 100);
    let external = contours.get(largestContour);
    //MINIMAL BOUNDING RECT
    let rotatedRect = cv.minAreaRect(external);
    let vertices = cv.RotatedRect.points(rotatedRect);
    for (let i = 0; i < 4; i++) {
      cv.line(dst, vertices[i], vertices[(i + 1) % 4], green, 2,
              cv.LINE_AA, 0);
    }
    //CONTOUR POLYGON
    let poly = new cv.Mat();
    let contours_poly = new cv.MatVector();
    cv.approxPolyDP(external,poly,0.1*cv.arcLength(external,true),true);
    contours_poly.push_back(poly);
    cv.drawContours(dst,contours_poly,0,red,2,8,hierarchy,0);
    let dstTri = [[vertices[0].x,vertices[0].y],
                  [vertices[1].x,vertices[1].y],
                  [vertices[2].x,vertices[2].y],
                  [vertices[3].x,vertices[3].y]];
    dstTri = cv.matFromArray(4, 1, cv.CV_32FC2,
                            this.order_matrix(dstTri).flat());
    if ((poly.size().height == 4) && (cv.isContourConvex(poly))) {
      //PERSPECTIVE CORRECTION
      let dsize = new cv.Size(this.working_copy.cols,
                              this.working_copy.rows);
      let srcTri = [[poly.intAt(0),poly.intAt(1)],
                    [poly.intAt(2),poly.intAt(3)],
                    [poly.intAt(4),poly.intAt(5)],
                    [poly.intAt(6),poly.intAt(7)]];
      srcTri = cv.matFromArray(4, 1, cv.CV_32FC2,
                              this.order_matrix(srcTri).flat());
      let M = cv.getPerspectiveTransform(srcTri, dstTri);
      cv.warpPerspective(this.original_picture, this.working_copy, M,
                        dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT,
                        new cv.Scalar());
      let w = rotatedRect.size.width;
      let h = rotatedRect.size.height;
      if (rotatedRect.angle < -45) {
        w = rotatedRect.size.height;
        h = rotatedRect.size.width;
      }
      M = cv.getPerspectiveTransform(dstTri, (cv.matFromArray(4, 1,
                                    cv.CV_32FC2, [0,0,w,0,w,h,0,h])));
      cv.warpPerspective(this.working_copy, this.working_copy, M,
                        (new cv.Size(w,h)), cv.INTER_LINEAR,
                        cv.BORDER_CONSTANT, new cv.Scalar());
    } else {
      let dsize = new cv.Size(this.working_copy.cols,
                              this.working_copy.rows);
      let srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, 
                        [0,0,
                        this.working_copy.cols,0,
                        this.working_copy.cols,this.working_copy.rows,
                        0,this.working_copy.rows]);
      let M = cv.getPerspectiveTransform(dstTri, srcTri);
      cv.warpPerspective(this.original_picture, this.working_copy, M,
                        dsize, cv.INTER_LINEAR,cv.BORDER_CONSTANT,
                        new cv.Scalar());
    }
  }
}
export { Picture as OCV };
