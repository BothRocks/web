let classifier;
let imageModelURL = 'https://teachablemachine.withgoogle.com/models/YoAJBxnN9/';

let video;
let flippedVideo;
let labelElement;
let currentLabel, counter;

var data = {
    'Campoamor' : 
    {
        short: 'campoamor',
        full: 'Ramón de Campoamor',
    },
    'Chueca' : 
    {
        short: 'chueca',
        full: 'Federico Chueca',
    },
    'Codorníu' :
    {
        short: 'codorniu',
        full: 'Ricardo Codorníu',
    },
    'Romero de Torres' :
    {
        short: 'romero',
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
                select('#class_image').attribute('src', '/assets/img/' + data[newLabel].short + '.jpg')
            }
        }
    }
    
    for (const result of results) {

        confidence = int(result.confidence*100)
        
        let element = select('#prg_' + data[result.label].short);
                         
        element.style('width', confidence + '%');
        element.attribute('ariaValueNow', confidence + '')
        element.html(confidence + '%')

    }

    classifyVideo();
}

