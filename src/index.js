const {ipcRenderer} = require('electron');
const dialog = require('electron').remote.dialog;
const selectDirBtn = document.getElementById('select-image');
const revert = document.getElementById('revert');
const deviderBtn = document.getElementById('devider');
const contrastBtn = document.getElementById('contrast');
let filePath = "";
let lvl;
var devider = 2;
var dvdr = false;
var contrast = false;
var area1 = [];
var area2 = [];
var area3 = [];
var area4 = [];
var area5 = [];
var area6 = [];
var area7 = [];
var area8 = [];
var a1 = 0;
var a2 = 0;
var a3 = 0;
var a4 = 0;
var a5 = 0;
var a6 = 0;
var a7 = 0;
var a8 = 0;

deviderBtn.addEventListener('click', (event) => {
  if(!(filePath == "")){
    haarTdata = [];
    a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8 = 0;
    area1=[],area2=[],area3=[],area4=[],area5=[],area6=[],area7=[],area8=[];
    if (!dvdr){
      dvdr = true;
      devider = Math.SQRT2;
      handleImage(filePath);
    } else {
      dvdr = false;
      devider = 2;
      handleImage(filePath);
    };
    var text = document.getElementById('devider').firstChild;
    text.data = text.data == "Divider: 2" ? "Divider: sqrt(2)" : "Divider: 2";
  }
});

contrastBtn.addEventListener('click', (event) => {
  if(!(filePath == "")){
    if (!contrast) {
      contrast = true;
    } else {
      contrast = false;
    }
    haarTdata = [];
    a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8 = 0;
    area1=[],area2=[],area3=[],area4=[],area5=[],area6=[],area7=[],area8=[];
    performHaarT(document.getElementById('originalImage'), lvl);
  }
});

revert.addEventListener('click', (event) => {
  if(!(filePath == "")){
    contrast = false;
    haarTdata = [];
    a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8 = 0;
    area1=[],area2=[],area3=[],area4=[],area5=[],area6=[],area7=[],area8=[];
    dvdr = false;
    devider = 2;
    var text = document.getElementById('devider').firstChild;
    text.data = "Divider: 2";
    handleImage(filePath);
  }
});

selectDirBtn.addEventListener('click', (event) => {
  contrast = false;
  haarTdata = [];
  a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8 = 0;
  area1=[],area2=[],area3=[],area4=[],area5=[],area6=[],area7=[],area8=[];
  dvdr = false;
  devider = 2;
  var text = document.getElementById('devider').firstChild;
  text.data = "Divider: 2";
  ipcRenderer.send('open-file-dialog')
});

ipcRenderer.on('selected-file', (event, path) => {
  filePath = path;
  handleImage(path);
});

function checkElementExists(id, rootElement){
  if (document.contains(document.getElementById(id))) {
    document.getElementById(id).remove();
  }
};

function createCanvas(id, rootElement) {
  checkElementExists(id, rootElement);
  var newCanvas = document.createElement("canvas");
  newCanvas.id = id;
  document.getElementById(rootElement).appendChild(newCanvas);
};

window.addEventListener("load", function(){
  var slider = document.querySelector("input[type='range']");
  slider.addEventListener("change", function(){
    haarTdata = [];
    a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8 = 0;
    area1=[],area2=[],area3=[],area4=[],area5=[],area6=[],area7=[],area8=[];
    var text = document.getElementById('devider').firstChild;
    text.data = "Divider: 2";
    performHaarT(document.getElementById('originalImage'), this.value);
  });
});


function blob2canvas(blob, w, h,b){
  var id = "originalImage";
  var rootElement = "original-image";
  createCanvas(id, rootElement);
  var canvas = document.getElementById('originalImage');
  canvas.classList.add("card-img");
  canvas.width = w;
  canvas.height = h;
  var img = new Image(),
  url = URL.createObjectURL(blob);
  var ctx = canvas.getContext('2d');
  img.onload = function () {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    if(b){
      performHaarT(canvas, 1);
    };
  };
  img.src = url;
};

function resize(canvas,w,h) {
  if (w+h > 1024){
    nw = 512;
    nh = 512;
  }else if(w+h > 512){
    nw = 256;
    nh = 256;
  }else if (w > h) {
    if (w > 256) {
      nw = 512;
      nh = 512;
    } else {
      nw = 256;
      nh = 256;
    }
  } else {
    if (h > 256) {
      nw = 512;
      nh = 512;
    } else {
      nw = 256;
      nh = 256;
    }
  }
  canvas.toBlob(function(blob) {
    blob2canvas(blob, nw, nh, true);
  });
};

function checkResizeNeeded(w, h){
  const options = {
    type: 'question',
    buttons: ['Ok'],
    defaultId: 2,
    title: 'Image will be resized',
    message: "",
  };

  if((h - w) != 0){
    options.message = "The selected image is not square. The image will be resized.";
    dialog.showMessageBox(null, options);
    return true;
  } else if(((h + w) % 2 != 0)){
    options.message = "The width and height of the selected image are not a power of 2. The image will be resized.";
    dialog.showMessageBox(null, options);
    return true;
  } else if(((h + w) < 512)){
    options.message = "The selected image is to small. The image will be resized.";
    dialog.showMessageBox(null, options);
    return true;
  } else if(((h + w) > 1024)){
    options.message = "The selected image is to large. The image will be resized.";
    dialog.showMessageBox(null, options);
    return true;
  }else {
    return false;
  }
};

function getImgData(c){
  var ctxd = c.getContext('2d');
  imgData = ctxd.getImageData(0,0,c.width,c.height);
  return imgData;
};

function handleImage(path){
  var rng = document.getElementById("slider");
  rng.value = 1;
  var Tiff = require('tiff.js');
  var fs = require('fs');
  var id = "originalImage";
  var rootElement = "original-image";
  checkElementExists(id, rootElement);
  if((/\.(tif|tiff)$/i).test(path)){
    var input = fs.readFileSync(path[0]);
    tiff = new Tiff({ buffer: input });
    var tiffCanvas = tiff.toCanvas();
    tiffCanvas.id = id;
    tiffCanvas.classList.add("card-img");
    document.getElementById(rootElement).appendChild(tiffCanvas);
    resizeNeeded = checkResizeNeeded(tiff.width(),tiff.height());
    if(resizeNeeded){
      resize(tiffCanvas, tiff.width(),tiff.height());
    }else{
      performHaarT(tiffCanvas, 1);
    };
  } else {
    createCanvas(id, rootElement);
    var img = new Image();
    img.src = path[0];
    img.onload = function () {
      var canvas = document.getElementById(id);
      var ctx = canvas.getContext('2d');
      canvas.classList.add("card-img");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      canvas.toBlob(function(blob) {
        blob2canvas(blob, img.width, img.height, false);
      });
      resizeNeeded = checkResizeNeeded(img.width,img.height);
      if(resizeNeeded){
        resize(canvas, img.width,img.height);
      }else{
        performHaarT(canvas, 1);
      };
    };
  };
};

function OneDHaarTransformF(HaarMatrix) {
  var hMLen = HaarMatrix.length/2;
  var tempHaar = [];
  for (var i = 0; i < hMLen; i++)
  {
    var sum = (HaarMatrix[2*i] + HaarMatrix[2*i + 1]) / 2;
    var diff = ( (HaarMatrix[2*i] - HaarMatrix[2*i + 1]) / devider);
    tempHaar[i] = sum;
    tempHaar[i + hMLen] = diff;
  };
  for (var i = 0; i < HaarMatrix.length; i++) {
      HaarMatrix[i] = tempHaar[i];
  };
};

function OneDHaarTransformB(HaarMatrix) {
  var hMLen = HaarMatrix.length/2;
  var tempHaar = [];
  for (var i = 0; i < hMLen; i++)
  {
    var sum = (HaarMatrix[i] + (HaarMatrix[i + hMLen]));
    var diff = (HaarMatrix[i] - (HaarMatrix[i + hMLen]));
    tempHaar[2*i] = sum;
    tempHaar[2*i + 1] = diff;
  };
  for (var i = 0; i < HaarMatrix.length; i++) {
      HaarMatrix[i] = tempHaar[i];
  };
};

function drawArray(arr, height, width, id, rootElement) {
  createCanvas(id, rootElement);
  var tcanvas = document.getElementById(id);
  tcanvas.classList.add("card-img");
  tcanvas.width = width;
  tcanvas.height = height;
  var ctx = tcanvas.getContext('2d');
  ctx.width = width;
  ctx.height = height;

  var dataImage = ctx.createImageData(width, height);
  if (dataImage.data.set) {
    dataImage.data.set(arr);
  } else {
    arr.forEach(function(val, i) {
      dataImage.data[i] = val;
    });
  }
  ctx.putImageData(dataImage, 0, 0);
};

function performHaarT(canvas, MaxStepHaar) {
  var msh = MaxStepHaar;
  lvl = MaxStepHaar;
  var imgd = getImgData(canvas);
  var pix = imgd.data;
  var width = imgd.width;
  var height = imgd.height;
  var currWidth = imgd.width;
  var currHeight = imgd.height;
  var Haar = [];
  var tempHaar = [];
  var altpix = [];

  for (var row = 0; row < height; row++) {
      Haar[row] = [];
      for (var col = 0; col < width; col++) {
          Haar[row][col] = [];
          for (var i = 0; i < 4; i++) {
              Haar[row][col][i] = pix[4*(row*width + col + i)];
          };
      };
  };

  while( (currWidth > 1 || currHeight > 1) && (MaxStepHaar >= 1) ) {
      MaxStepHaar = MaxStepHaar - 1;

      if (currWidth > 1) {
          for(var row = 0; row < currHeight; row++) {
              for (var i = 0; i < 3; i++) {
                  for(col = 0; col < currWidth; col++) {
                      tempHaar[col] = Haar[row][col][i];
                  };

                  OneDHaarTransformF(tempHaar);

                  for(col = 0; col < currWidth; col++) {
                      Haar[row][col][i] = tempHaar[col];
                  };
              };
          };
      };

      tempHaar = [];
      if (currHeight > 1) {
          for(var col = 0; col < currWidth; col++) {
              for (var i = 0; i < 3; i++) {
                  for(row = 0; row < currHeight; row++) {
                      tempHaar[row] = Haar[row][col][i];
                  };

                  OneDHaarTransformF(tempHaar);

                  for(row = 0; row < currHeight; row++) {
                      Haar[row][col][i] = tempHaar[row];
                  };
              };
          };
      };
      tempHaar = [];

      if (currHeight > 1) {currHeight  = currHeight/2};
      if (currWidth > 1)  {currWidth = currWidth/2};
  };

  altpix = normalizeArray(Haar, height, width);

  var id = "transformedImage";
  var rootElement = "transformed-image";

  if(contrast){
    altpix = betterContrast(altpix, width*4, height);
  }

  drawArray(altpix, height, width, id, rootElement);
  haarTdata = deepCopy(Haar);
  performHaarTBack(msh);
};

function performHaarTBack(MaxStepHaar) {
  var Haar = deepCopy(haarTdata);

  var width = Haar.length;
  var height = Haar.length;
  var currWidth = width;
  var currHeight = height;
  var tempHaar = [];
  var altpix = [];

  for(m = MaxStepHaar; m > 0; m--) {

    if (MaxStepHaar > 1) {
      currHeight  = Haar.length/(Math.pow(2, m)/2);
      currWidth = Haar.length/(Math.pow(2, m)/2);
    };


    tempHaar = [];
    if (currHeight > 1) {
        for(var col = 0; col < currWidth; col++) {
            for (var i = 0; i < 3; i++) {
                for(row = 0; row < currHeight; row++) {
                    tempHaar[row] = Haar[row][col][i];
                };

                OneDHaarTransformB(tempHaar);

                for(row = 0; row < currHeight; row++) {
                    Haar[row][col][i] = tempHaar[row];
                };
            };
        };
    };
    tempHaar = [];

    if (currWidth > 1) {
      for(var row = 0; row < currHeight; row++) {
          for (var i = 0; i < 3; i++) {
              for(col = 0; col < currWidth; col++) {
                  tempHaar[col] = Haar[row][col][i];
              };

              OneDHaarTransformB(tempHaar);

              for(col = 0; col < currWidth; col++) {
                  Haar[row][col][i] = tempHaar[col];
              };
          };
      };
    };
  };

  altpix = normalizeArray(Haar, height, width);

  var id = "restoredImage";
  var rootElement = "restored-image";
  drawArray(altpix, height, width, id, rootElement);
  eventL();
};

function eventL(){
  var e = document.getElementById('transformedImage'),
  elemLeft = e.offsetLeft,
  elemTop = e.offsetTop,
  context = e.getContext('2d'),
  elements = [];

  e.addEventListener('click', function(event) {
    var xVal = event.pageX - elemLeft,
    yVal = event.pageY - elemTop;
    event.stopPropagation();
    event.preventDefault();
    partRepl(xVal, yVal,event).then(function() {
      //this function is executed after function1
      performHaarTBack(lvl);
    });
  }, false);
};

function indexFromXY(x, y, arrayWidth) {
  return (y * arrayWidth) + x;
};

function fillArray(array, xStart, yStart, width, height, arrayWidth, value) {
  for(var x = xStart; x < xStart + width; x++) {
    for(var y = yStart; y < yStart + height; y++) {
        array[indexFromXY(x, y, arrayWidth)] = value;
    };
  };
};

function writeBackArray(destArray, xStart, yStart, width, height, arrayWidth, srcArray) {
  for(var x = xStart; x < xStart + width; x++) {
    for(var y = yStart; y < yStart + height; y++) {
        destArray[indexFromXY(x, y, arrayWidth)] = srcArray.shift();
    };
  };
};

function writeArray(array, xStart, yStart, width, height, arrayWidth) {
  var outPut = [];
  for(var x = xStart; x < xStart + width; x++) {
    for(var y = yStart; y < yStart + height; y++) {
      outPut.push(array[indexFromXY(x, y, arrayWidth)]);
    };
  };
  return outPut;
};

function partRepl(x,y,callback){
  //$(".clearfix").show();
  var id = "transformedImage";
  var rootElement = "transformed-image";
  var width = haarTdata.length*4;
  var height = haarTdata.length;
  var myArray = normalizeArray(deepCopy(haarTdata), height, width/4);

  if(lvl == 2){
    if(x > 450 && x < 515 && y > 160 && y < 225){
      if (a1 == 0) {
        a1=1;
        area1 = writeArray(myArray, 0, 0, width/4, height/4, width);
        fillArray(myArray, 0, 0, width/4, height/4, width, 0);
      }else if (a1 == 1){
        a1=0;
        writeBackArray(myArray, 0, 0, width/4, height/4, width, area1);
      };
    }else if(x > 515 && x < 580 && y > 160 && y < 225){
      if (a2 == 0) {
        a2=1;
        area2 = writeArray(myArray, width/4, 0, width/4, height/4, width);
        fillArray(myArray, width/4, 0, width/4, height/4, width, 0);
      }else if (a2 == 1){
        a2 =0;
        writeBackArray(myArray, width/4, 0, width/4, height/4, width, area2);
      };
    }else if(x > 450 && x < 515 && y > 225 && y < 290){
      if (a3 == 0) {
        a3=1;
        area3 = writeArray(myArray, 0, height/4, width/4, height/4, width);
        fillArray(myArray, 0, height/4, width/4, height/4, width, 0);
      }else if (a3 == 1){
        a3=0;
        writeBackArray(myArray, 0, height/4, width/4, height/4, width, area3);
      };
    }else if(x > 515 && x < 580 && y > 225 && y < 290){
      if (a4 == 0) {
        a4=1;
        area4 = writeArray(myArray, width/4, height/4, width/4, height/4, width);
        fillArray(myArray, width/4, height/4, width/4, height/4, width, 0);
      }else if (a4 == 1){
        a4=0;
        writeBackArray(myArray, width/4, height/4, width/4, height/4, width, area4);
      };
    }else if(x > 450 && x < 580 && y > 290 && y < 410){
      if (a5 == 0) {
        a5=1;
        area5 = writeArray(myArray, 0, height/2, width/2, height/2, width);
        fillArray(myArray, 0, height/2, width/2, height/2, width, 0);
      }else if (a5 == 1){
        a5=0;
        writeBackArray(myArray, 0, height/2, width/2, height/2, width, area5);
      };
    }else if(x > 580 && x < 710 && y > 290 && y < 410){
      if (a6 == 0) {
        a6=1;
        area6 = writeArray(myArray, width/2, height/2, width/2, height/2, width);
        fillArray(myArray, width/2, height/2, width/2, height/2, width, 0);
      }else if (a6 == 1){
        a6=0;
        writeBackArray(myArray, width/2, height/2, width/2, height/2, width, area6);
      };
    }else if(x > 580 && x < 710 && y > 160 && y < 290){
      if (a7 == 0) {
        a7=1;
        area7 = writeArray(myArray, width/2, 0, width/2, height/2, width);
        fillArray(myArray, width/2, 0, width/2, height/2, width, 0);
      }else if (a7 == 1){
        a7=0;
        writeBackArray(myArray, width/2, 0, width/2, height/2, width, area7);
      };
    };
  } else{
    if(x > 450 && x < 580 && y > 160 && y < 290){
      if (a8 == 0) {
        a8=1;
        area8 = writeArray(myArray, 0, 0, width/2, height/2, width);
        fillArray(myArray, 0, 0, width/2, height/2, width, 0);
      }else if (a8 == 1){
        a8=0;
        writeBackArray(myArray, 0, 0, width/2, height/2, width, area8);
      };
    }else if(x > 450 && x < 580 && y > 290 && y < 410){
      if (a5 == 0) {
        a5=1;
        area5 = writeArray(myArray, 0, height/2, width/2, height/2, width);
        fillArray(myArray, 0, height/2, width/2, height/2, width, 0);
      }else if (a5 == 1){
        a5=0;
        writeBackArray(myArray, 0, height/2, width/2, height/2, width, area5);
      };
    }else if(x > 580 && x < 710 && y > 290 && y < 410){
      if (a6 == 0) {
        a6=1;
        area6 = writeArray(myArray, width/2, height/2, width/2, height/2, width);
        fillArray(myArray, width/2, height/2, width/2, height/2, width, 0);
      }else if (a6 == 1){
        a6=0;
        writeBackArray(myArray, width/2, height/2, width/2, height/2, width, area6);
      };
    }else if(x > 580 && x < 710 && y > 160 && y < 290){
      if (a7 == 0) {
        a7=1;
        area7 = writeArray(myArray, width/2, 0, width/2, height/2, width);
        fillArray(myArray, width/2, 0, width/2, height/2, width, 0);
      }else if (a7 == 1){
        a7=0;
        writeBackArray(myArray, width/2, 0, width/2, height/2, width, area7);
      };
    };
  };
  haarTdata =  deepCopy(chunkArray(myArray, height, width/4));

  if(a1 == 1){
    fillArray(myArray, 0, 0, width/4, height/4, width, 0);
  };
  if(a2 == 1){
    fillArray(myArray, width/4, 0, width/4, height/4, width, 0);
  };
  if(a3 == 1){
    fillArray(myArray, 0, height/4, width/4, height/4, width, 0);
  };
  if(a4 == 1){
    fillArray(myArray, width/4, height/4, width/4, height/4, width, 0);
  };
  if(a5 == 1){
    fillArray(myArray, 0, height/2, width/2, height/2, width, 0);
  };
  if(a6 == 1){
    fillArray(myArray, width/2, height/2, width/2, height/2, width, 0);
  };
  if(a7 == 1){
    fillArray(myArray, width/2, 0, width/2, height/2, width, 0);
  };
  if(a8 == 1){
    fillArray(myArray, 0, 0, width/2, height/2, width, 0);
  };

  if(contrast){
    myArray = betterContrast(myArray, width, height);
  }

  drawArray(myArray, height, width/4, id, rootElement);
  return new Promise(function (resolve, reject){
    resolve("success"); //if the action succeeded
    reject("error"); //if the action did not succeed
  });
};

function betterContrast(array, width, height){
  var contrastData = [];
  if (lvl == 2) {
    contrastData = writeArray(array, 0, 0, width/4, height/4, width);
    for (let index = 0; index < array.length; index++) {
      array[index] = array[index] + 55;
    };
    writeBackArray(array, 0, 0, width/4, height/4, width, contrastData);
  } else{
    contrastData = writeArray(array, 0, 0, width/2, height/2, width);
    for (let index = 0; index < array.length; index++) {
      array[index] = array[index] + 55;
    };
    writeBackArray(array, 0, 0, width/2, height/2, width, contrastData);
  }
  return array
}

function chunkArray(myArray, height, width){
  var Haar = [];

  for (var row = 0; row < height; row++) {
    Haar[row] = [];
    for (var col = 0; col < width; col++) {
      Haar[row][col] = [];
      for (var i = 0; i < 4; i++) {
        Haar[row][col][i] = myArray[4*(row*width + col)];
      };
    };
  }
  return Haar;
};

function normalizeArray(Haar, height, width){
  var altpix = [];

  for (var row = 0; row < height; row++) {
    for (var col = 0; col < width; col++) {
      altpix[4*(row*width + col) ] = Haar[row][col][0];
      altpix[4*(row*width + col)+1 ] = Haar[row][col][1];
      altpix[4*(row*width + col)+2 ] =  Haar[row][col][2];
      altpix[4*(row*width + col)+3 ] =  255;
    };
  };
  return altpix;
};

function deepCopy(obj) {
  if (typeof obj == 'object') {
    if (Array.isArray(obj)) {
      var l = obj.length;
      var r = new Array(l);
      for (var i = 0; i < l; i++) {
        r[i] = deepCopy(obj[i]);
      }
      return r;
    } else {
      var r = {};
      r.prototype = obj.prototype;
      for (var k in obj) {
        r[k] = deepCopy(obj[k]);
      }
      return r;
    }
  }
  return obj;
};
