let classifier;
let imageModelURL = 'https://teachablemachine.withgoogle.com/models/YoAJBxnN9/';

let threshold = 0.85;

var video;
var canvasWidth;

let flippedVideo;

let labelElement, dateElement;
let currentLabel, counter;

let hideBtnElement;
let isCameraHidden;
let geomanist;

var data = {
    'berenguela' :
    {
        full: 'Berenguela de Castilla',
        dates: '(1179-1246)',
    },
    'campoamor' : 
    {
        full: 'Ramón de Campoamor',
        dates: '(1817-1901)',
    },
    'chueca' : 
    {
        full: 'Federico Chueca',
        dates: '(1846-1908)',
    },
    'codorniu' :
    {
        full: 'Ricardo Codorníu',
        dates: '(1846-1923)',
    },
    'cortezo' :
    {
        full: 'Doctor Cortezo',
        dates: '(1850-1933)',
    },
    'romero' :
    {
        full: 'Julio Romero de Torres',
        dates: '(1874-1930)',
    },
    'urraca' :
    {
        full: 'Urraca I de León',
        dates: '(1081-1126)',
    },

}

if (!isMobileDevice()) {
    var div_warning = document.querySelector("#show-on-desktop");
    div_warning.classList.remove("d-none");
    div_warning.classList.add("d-block");
}

function preload() {
    classifier = ml5.imageClassifier(imageModelURL + 'model.json', gotModel);
    geomanist = loadFont('/assets/fonts/geomanist-book-webfont.ttf');
}

function setup() {

    canvasWidth = isMobileDevice() ? 180 : 320

    var canvas = createCanvas(canvasWidth, 240);
    canvas.parent('canvas-placeholder');

    noStroke();
    textFont(geomanist);
    textSize(width / 17.3);

    isCameraHidden = false;
    hideBtnElement = document.querySelector("#btn_hide_cam");

    hideBtnElement.addEventListener("click", async () => {
        
        isCameraHidden = !isCameraHidden;
        if (isCameraHidden) {
            // SHOW
            hideBtnElement.innerHTML = 'Muestra el vídeo';
        } else {
            // HIDE
            hideBtnElement.innerHTML = 'Oculta el vídeo';
        }
    });    

    labelElement = select('#class_label');
    dateElement = select('#date_label');
    currentLabel='';
    counter = 0;

    var constraints = {
        audio: false,
        video: {
          facingMode: {
            exact: "environment"
          }
        }    
      };

    video = createCapture(isMobileDevice() ? constraints : VIDEO);
    video.size(canvasWidth, 240);
    video.hide();      

    if (isMobileDevice()) {
        flippedVideo = video
    } else {
        flippedVideo = ml5.flipImage(video);
    }
    
    classifyVideo();



}

function draw() {
    if(!isCameraHidden){
        if (isMobileDevice()) {
            image(flippedVideo, 0, 0, canvasWidth, 240);
        } else {
            image(flippedVideo, 0, 0);
        }
    } else {
        fill('#2f2605')
        rect(0,0,canvasWidth, 240);
        fill('#f9d826')
        text('Pulsa el botón para mostrar el vídeo', 10,height/2)
    }

}

function classifyVideo() {
    if (isMobileDevice()) {
        flippedVideo = video
    } else {
        flippedVideo = ml5.flipImage(video);
    }
  classifier.classify(flippedVideo, gotResult);
  flippedVideo.remove();
}

function gotResult(error, results) {

    if (error) {
      console.error(error);
      return;
    }

    let newLabel = (results[0].confidence > threshold) ? results[0].label : '';
    if (newLabel != currentLabel) {
        counter = 10;
        currentLabel = newLabel;
    } else {
        if (counter>0) {
            counter--;
        } else {
            if (newLabel!='') {
                labelElement.html(data[newLabel].full);
                dateElement.html(data[newLabel].dates);
                select('#class_image').attribute('src', '/assets/estatuas/' + results[0].label + '.jpg')
            } else {
                labelElement.html('Enfoca a una estatua');
                dateElement.html('');
                select('#class_image').attribute('src', '/assets/estatuas/background.jpg')
            }
        }
    }
    
    for (const result of results) {

        let element = select('#prg_' + result.label);
        
        confidence = int(result.confidence*100)     
        element.style('width', confidence + '%');
        element.attribute('ariaValueNow', confidence + '')
        element.html(confidence + '%')

    }

    classifyVideo();
}


//Gracias a https://coderwall.com/p/i817wa/one-line-function-to-detect-mobile-devices-with-javascript
function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
}

function gotModel(){
    labelElement.html('Enfoca a una estatua');
    dateElement.html('');
}