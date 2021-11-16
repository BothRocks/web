let classifier;
let imageModelURL = 'https://teachablemachine.withgoogle.com/models/EQctlfbNA/';

let threshold = 0.90;
let steadyFrames = 5;

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
let curSample;
let nxtSample;
const sampleNames = ["maquina", "piedra", "planta", "animalito"];
let audioStarted = false;
let isPlaying = false;
let startBtnElement;
let countdown;

let score;
let scoreElement;

if (isMobileDevice()) {
    var div_warning = document.querySelector("#show-on-mobile");
    div_warning.classList.remove("d-none");
    div_warning.classList.add("d-block");
}

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
            // STOP
            await Tone.Transport.stop();
            startBtnElement.innerHTML = 'Empieza a jugar';
            infoElement.html('&nbsp;');
        } else {
            // PLAY
            await Tone.Transport.start();
            score = 0;
            countdown = 1;
            updateScore();
            curSample = randIdx(true);
            startBtnElement.innerHTML = 'Detén la partida';
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
    players["intro"] = "/assets/disfraz/samples/intro.wav";
    kit = new Tone.Players(players, () => {
        console.log("Samples are ready");
    }).toDestination();
    
    Tone.Transport.bpm.value = 137;

    // Intro 
    Tone.Transport.schedule((time) => {
        kit.player("intro").start(time);
    }, "0");

    // Countdown 
    Tone.Transport.scheduleRepeat((time) => {
        infoElement.html(countdown);
        countdown += 1;
    }, "4n", "0", "1m");

    // Main loop 
    Tone.Transport.scheduleRepeat((time) => {
        sampleName = sampleNames[curSample];
        nxtSample = randIdx(false);
        infoElement.html(data[sampleName].caps);
        if (nxtSample==3) {
            sampleName = sampleName + "_ani";  
        }
        curSample = nxtSample;
        kit.player(sampleName).start(time);
    }, "2m", "1m");

    

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

function randIdx(start) {
    return Math.floor(Math.random() * (start?3:4));
}

function updateScore(){
    scoreElement.html(score);
}


// Ver esto para la parada instantanea del player
// this.playerToggle = () => {
//     if(this.player.playing) {
//       Tone.Transport.pause();
//       this.channel.master.gain.value = 0;
//       this.play_toggle.classList.remove('active');
//     } else {
//       Tone.Transport.start();
//       this.channel.master.gain.value = 1;
//       this.play_toggle.classList.add('active');
//     }
//     this.player.playing = !this.player.playing;
//   };