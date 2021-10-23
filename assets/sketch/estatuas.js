let classifier;
let imageModelURL = 'https://teachablemachine.withgoogle.com/models/YoAJBxnN9/';

let threshold = 0.85;

var video;
var canvasWidth;

let flippedVideo;

let labelElement, dateElement;
let currentLabel, counter;

var data = {
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

}

function preload() {
    classifier = ml5.imageClassifier(imageModelURL + 'model.json');
}

function setup() {

    canvasWidth = isMobileDevice() ? 180 : 320

    var canvas = createCanvas(canvasWidth, 240);
    canvas.parent('canvas-placeholder');

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
    //   background(0);
    if (isMobileDevice()) {
        image(flippedVideo, 0, 0, canvasWidth, 240);
    } else {
        image(flippedVideo, 0, 0);
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
                select('#class_image').attribute('src', '/assets/img/' + results[0].label + '.jpg')
            } else {
                labelElement.html('Enfoca a una estatua');
                dateElement.html('');
                select('#class_image').attribute('src', '/assets/img/background.jpg')
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
};