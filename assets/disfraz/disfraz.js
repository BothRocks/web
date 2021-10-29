let classifier;
let imageModelURL = 'https://teachablemachine.withgoogle.com/models/EQctlfbNA/';

let threshold = 0.85;
let steadyFrames = 6;

let video;
let canvasWidth;
let flippedVideo;
let infoElement;
let currentLabel, counter;
let data = {
    'maquina' :
    {
        full: 'Eres una máquina',
        caps: 'Máquina',
    },
    'piedra' : 
    {
        full: 'Eres una piedra',
        caps: 'Piedra',
    },
    'planta' : 
    {
        full: 'Eres una planta',
        caps: 'Planta',
    },
    'animalito' :
    {
        full: 'Eres un animalito',
        caps: 'Animalito',
    },
}

let players;
let kit;
let curSample = randIdx();
let nxtSample;
const sampleNames = ["animalito", "maquina", "piedra", "planta"];
let audioStarted = false;
let isPlaying = false;
let startBtnElement;

let score;
let scoreElement;

function preload() {
    classifier = ml5.imageClassifier(imageModelURL + 'model.json', gotModel);
}

function setup() {

    canvasWidth = isMobileDevice() ? 180 : 320

    var canvas = createCanvas(canvasWidth, 240);
    canvas.parent('canvas-placeholder');

    infoElement = select('#class_label');
    currentLabel='';
    counter = 0;

    scoreElement= select('#score');
    score = 0n;
    
    startBtnElement = document.querySelector("#btn_start");

    startBtnElement.addEventListener("click", async () => {
        if (!audioStarted) {
            await Tone.start();
            audioStarted = true;
            console.log("Audio is ready");
        }
        if (isPlaying) {
            await Tone.Transport.stop();
            console.log("Transport stop");
        } else {
            await Tone.Transport.start();
            console.log("Transport start");
            score = 0;
            updateScore();
        }
        isPlaying = !isPlaying;
    });

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
    
    players = sampleNames.reduce(function(map, obj) {
        map[obj] = "/assets/disfraz/samples/" + obj + ".wav";
        map[obj+"_ani"] = "/assets/disfraz/samples/" + obj + "_ani.wav";
        return map;
    }, {});
    kit = new Tone.Players(players, () => {
        console.log("Samples are ready");
    }).toDestination();
    
    Tone.Transport.bpm.value = 137;
    Tone.Transport.scheduleRepeat((time) => {
        sampleName = sampleNames[curSample];
        nxtSample = randIdx();
        infoElement.html(data[sampleName].caps);
        if (nxtSample==0) {
            sampleName = sampleName + "_ani";  
        }
        curSample = nxtSample;
        kit.player(sampleName).start(time);
    }, "2m");
    
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
        counter = steadyFrames;
        currentLabel = newLabel;
    } else {
        if (counter>0) {
            counter--;
        } else {
            if (newLabel!='' && infoElement.html()==data[newLabel].caps){
                score++;
                updateScore();
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
    infoElement.html('&nbsp;');
    startBtnElement.classList.remove("disabled");
}

function randIdx() {
    return Math.floor(Math.random() * 4);
}


function updateScore(){
    scoreElement.html(score);
}