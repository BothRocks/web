let classifier;
let imageModelURL = 'https://teachablemachine.withgoogle.com/models/EQctlfbNA/';

let threshold = 0.85;

var video;
var canvasWidth;

let flippedVideo;

let labelElement;
let currentLabel, counter;

var data = {
    'maquina' :
    {
        full: 'Eres una máquina',
    },
    'piedra' : 
    {
        full: 'Eres una piedra',
    },
    'planta' : 
    {
        full: 'Eres una planta',
    },
    'animalito' :
    {
        full: 'Eres un animalito',
    },
}

function preload() {
    classifier = ml5.imageClassifier(imageModelURL + 'model.json', gotModel);
}

function setup() {

    canvasWidth = isMobileDevice() ? 180 : 320

    var canvas = createCanvas(canvasWidth, 240);
    canvas.parent('canvas-placeholder');

    labelElement = select('#class_label');
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
            } else {
                labelElement.html('Enfoca a algo');
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
    labelElement.html('Enfoca a algo');
}