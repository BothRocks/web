let classifier;
let imageModelURL = 'https://teachablemachine.withgoogle.com/models/YoAJBxnN9/';

let video;
const devices = [];

let flippedVideo;

let labelElement;
let currentLabel, counter;

var data = {
    'campoamor' : 
    {
        full: 'Ramón de Campoamor',
    },
    'chueca' : 
    {
        full: 'Federico Chueca',
    },
    'codorniu' :
    {
        full: 'Ricardo Codorníu',
    },
    'cortezo' :
    {
        full: 'Doctor Cortezo',
    },
    'romero' :
    {
        full: 'Julio Romero de Torres',
    },

}

function preload() {
    classifier = ml5.imageClassifier(imageModelURL + 'model.json');
}

function setup() {

    var canvas = createCanvas(320, 240);
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
    video = createCapture(VIDEO);
    video.size(320, 240);
    video.hide();      

    flippedVideo = ml5.flipImage(video);
    classifyVideo();

}

function draw() {
  background(0);
  image(flippedVideo, 0, 0);
  
}

function classifyVideo() {
  flippedVideo = ml5.flipImage(video);
  classifier.classify(flippedVideo, gotResult);
  flippedVideo.remove();
}

function gotResult(error, results) {

    if (error) {
      console.error(error);
      return;
    }

    let newLabel = (results[0].confidence > 0.65) ? results[0].label : '';
    if (newLabel != currentLabel) {
        counter = 10;
        currentLabel = newLabel;
    } else {
        if (counter>0) {
            counter--;
        } else {
            if (newLabel!='') {
                labelElement.html(data[newLabel].full);
                select('#class_image').attribute('src', '/assets/img/' + results[0].label + '.jpg')
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

