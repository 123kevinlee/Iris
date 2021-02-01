//Kevin Lee

//Elements
let toggle;
let saveButton;
let resetLogButton;
let songSelect;

//p5 objects
let song;
let fft;
let peakDetectFft;
let peakDetect;

let songFile = 'sounds/chopinop9n1.mp3';
let smoothingValue = .9;
let bins = 4096;
let peakThreshold = .001;
let log;

let ellipseWidth = 100;


let noteFrequencies = {
  'c0': 16.35,
  'c♯0': 17.32,
  'd0': 18.35,
  'e♭0': 19.45,
  'e0': 20.60,
  'f0': 21.83,
  'f#0': 23.12,
  'g0': 24.50,
  'a♭0': 25.96,
  'a0': 27.50,
  'b♭0': 29.14,
  'b0': 30.87
}
let noteKeys = Object.keys(noteFrequencies);

let noteColorObjects = {
  'c': [254, 254, 9],
  'c♯': [156, 250, 16],
  'd': [11, 202, 29],
  'e♭': [22, 241, 199],
  'e': [7, 49, 249],
  'f': [94, 5, 252],
  'f#': [207, 1, 241],
  'g': [11, 0, 10],
  'a♭':[100, 2, 1],
  'a': [248, 5, 14],
  'b♭': [242, 56, 19],
  'b': [241, 103, 28]
}

let noteColorOffset = {
  'c': 0,
  'c♯': 1,
  'd': 2,
  'e♭': 3,
  'e': 4,
  'f': 5,
  'f#': 6,
  'g': 7,
  'a♭':8,
  'a': 9,
  'b♭': 10,
  'b': 11
}

let newSong = false;

function preload() {
  song = loadSound(songFile);
  song.amp(1);
  //load sound and set volume to half
}

function setup() {
  createCanvas(windowWidth-50, windowHeight-50);

  toggle = createButton('toggle');
  toggle.html('play');
  toggle.mousePressed(toggleSound);

  songSelect = createSelect();
  songSelect.position(50, windowHeight-70);
  songSelect.option('Chopin Op9 No1');
  //songSelect.option('Chopin Fantaisie Impromptu');
  songSelect.option('Harry Potter');
  songSelect.option('Sir Duke by Stevie Wonder');
  songSelect.option('La La Land: City of Stars');
  songSelect.option('Believer by Imagine Dragons');
  songSelect.option('Bflat Note');
  songSelect.selected('Chopin Op9 No1');
  songSelect.changed(songSelected);
  //mic = new p5.AudioIn();
  //mic.start();
  fft = new p5.FFT(smoothingValue, bins);
  peakDetect = new p5.PeakDetect(20, 20000, peakThreshold, 20);
  //fft.setInput(mic);

  saveButton = createButton('download log');
  saveButton.mousePressed(createLog);

  resetLogButton = createButton('reset log');
  resetLogButton.mousePressed(resetLog);

  logSetup();
}

function songSelected() {
  let item =  songSelect.value();
  song.stop();
  switch (item) {
    case 'Chopin Op9 No1':
        songFile = 'sounds/chopinop9n1.mp3';
        song = loadSound(songFile);
        song.amp(1);
        break;
      case 'Chopin Fantaisie Impromptu':
        songFile = 'sounds/chopinfantasie.mp3';
        song = loadSound(songFile);
        song.amp(1);
        break;
      case 'Harry Potter':
        songFile = 'sounds/hp.mp3';
        song = loadSound(songFile);
        song.amp(1);
        break;
      case 'Bflat Note':
        songFile = 'sounds/bflat.mp3';
        song = loadSound(songFile);
        song.amp(1);
        break;
      case 'Sir Duke by Stevie Wonder':
        songFile = 'sounds/sirduke.mp3'
        song = loadSound(songFile);
        song.amp(1);
        break;
      case 'La La Land: City of Stars':
        songFile = 'sounds/cityofstars.mp3';
        song = loadSound(songFile);
        song.amp(1);
        break;
      case 'Believer by Imagine Dragons':
        songFile = 'sounds/believer.mp3';
        song = loadSound(songFile);
        song.amp(1);
        break;
    default:
      break;
  }
  toggle.attribute('disabled', '');
  toggle.html('loading...');
  newSong = true;
}

function draw() {
  noStroke();
  background(255, 255,255);

  textSize(14);
  fill('black');
  text('Song:', 5, windowHeight-57);

  if(song.isLoaded() && newSong){
    toggle.html('play');
    toggle.removeAttribute('disabled');
    newSong = false;
  }

  fft.analyze();
  peakDetect.update(fft);

  //console.log(peakDetect.isDetected);
  if (peakDetect.isDetected) {
    ellipseWidth = 500;
  } else {
    ellipseWidth *= 0.95;
  }

  //fill(255, 255, 255);
  //ellipse(width / 2, height / 2, ellipseWidth, ellipseWidth);

  let energy = analyzeNotes();
  //console.table(energy);
  //console.log(songTime);

  let highAmpI = 0; //--- i = octaves
  let highAmpJ = 0; //--- j = notes in octave
  let highX = 0; //--- x = position of highest note
  let highAmp = 0; //highest amp

  let w = width / (energy.length * energy[0].length);

  let count = 0;
  //--- traverses 2D array to determine the loudest frequency
  for (let i = 0; i < energy.length; i++) {
    for (let j = 0; j < energy[i].length; j++) {
      let ampH = map(energy[i][j], 0, 255, 0, height);
      if (energy[i][j] > energy[highAmpI][highAmpJ]) {
        highAmpI = i;
        highAmpJ = j;
        highX = count;
        highAmp = ampH;
      }
      //--- temp fix to c4 and b3 having the same energy
      //--- basically will choose higher note if amplitude is the same between two adjacent notes in different octaves
      if (highAmpI != i) {
        if (energy[i][j] >= energy[highAmpI][highAmpJ]) {
          highAmpI = i;
          highAmpJ = j;
          highX = count;
          highAmp = ampH;
        }
      }

      //--- create linear graph of amplitudes with note domain
      count++;
      //fill(i * 30 + 30, i * 30 + 30, i * 30 + 30);
      //noStroke();
      //rect(w * count, height - ampH, w - 5, ampH);
    }
  }

  let loudestAmp = energy[highAmpI][highAmpJ];

  let colorObject = noteColorObjects[noteKeys[highAmpJ].substring(0, noteKeys[highAmpJ].length - 1)];
  //console.log(color);

  textSize(64);
  fill(colorObject[0],colorObject[1],colorObject[2],255-highAmpI*15);

  let noteName;
  if(highAmp != 0){
    noteName = noteKeys[highAmpJ].substring(0, noteKeys[highAmpJ].length - 1) + highAmpI;
    //text(noteName, 150, 150);
    circle(w * highX - 50, (height - highAmp)*1.25, highAmp/3);
  }
  
  let backgroundNotes = '';

  let peaks = getPeaks(energy, loudestAmp);
  //console.log(peaks);

  for (let k = 0; k < peaks.length; k++) {
    backgroundNotes += noteKeys[peaks[k].split('-')[1]].substring(0, noteKeys[peaks[k].split('-')[1]].length - 1) + peaks[k].split('-')[0] + ' ';
    
    let note = noteKeys[peaks[k].split('-')[1]].substring(0, noteKeys[peaks[k].split('-')[1]].length - 1) + peaks[k].split('-')[0];
    let baseNote = note.substring(0,note.length-1);
    let octave = note.substring(note.length-1);
    let j = noteColorOffset[baseNote];
    let colorObject = noteColorObjects[noteKeys[j].substring(0, noteKeys[j].length - 1)];
    let amp = energy[octave][j];
    fill(colorObject[0],colorObject[1],colorObject[2],255-octave*15);
    circle(w * (octave*12+j) - 50, (height - amp), amp/3);
  }

  fill(255, 155, 0);
  //text(backgroundNotes, 150, 200);

  if (song.isPlaying()) {
    logPush(highAmpJ, noteName, energy, backgroundNotes, peaks)
  }
}

//--- Toggle sound on and off
function toggleSound() {
  if (song.isPlaying()) {
    song.pause();
    log += 'break\n\n';
    toggle.html('play');
  } else {
    song.play();
    toggle.html('pause');
  }
}

//--- returns a 2D array with the amplitude of each note frequency in each octave
function analyzeNotes() {
  let octaves = 8; //--- 8 octaves on a piano
  let final = [];
  for (let i = 0; i <= octaves; i++) {
    var temp = [];
    for (let j = 0; j < noteKeys.length; j++) {
      temp.push(fft.getEnergy(getOctaveFrequency(noteFrequencies[noteKeys[j]], i)));
    }
    final.push(temp);
  }
  return final;
}

//--- returns frequency of note in a set octave -- note frequencies increase by a factor of 2 each octave
function getOctaveFrequency(baseFreq, octave) {
  return baseFreq * (Math.pow(2, octave));
}

function getPeaks(energy, amp) {
  let peaks = [];
  let filter = amp * .5;

  for (let i = 0; i < energy.length; i++) {
    for (let j = 0; j < energy[i].length; j++) {
      let before = j > 0 ? j - 1 : null;
      let after = j < energy[i].length - 1 ? j + 1 : null;
      if (before != null && after != null) {
        if (energy[i][before] < energy[i][j] && energy[i][j] < energy[i][after] && energy[i][j] > filter) {
          peaks.push(i + '-' + (j + 1));
          //console.log(energy[i][j]);
        }
      }
    }
  }

  return peaks;
}

function logSetup() {
  log += 'File: ' + songFile.substring(songFile.indexOf('/') + 1, songFile.indexOf('.')) + '\n';
  log += 'Bin Size: ' + bins + '\n';
  log += 'Smoothing Value: ' + smoothingValue + '\n\n';
}

function resetLog() {
  log = '';
  logSetup();
}

function createLog() {
  log = log.replace('undefined', '');
  let fileWriter = createWriter('log.txt');
  fileWriter.write(log);
  fileWriter.close();
}

let previousTime = -125;

function logPush(noteIndex, note, energy, backgroundNotes, peaks) {
  try {
    function write() {
      log += `${timestamp}: ${note}[${noteIndex}]\n`;
      log += `Background: ${backgroundNotes}\n`;
      log += `Peaks: ${peaks}\n`;
      for (let i = 0; i <= energy.length; i++) {
        log += `    ${i} - ${energy[i].toString()}\n`;
      }
      log += '\n\n';
    }

    let date = new Date();
    let milliseconds = date.getMilliseconds();
    let seconds = date.getSeconds();
    let minutes = date.getMinutes();
    let hour = date.getHours();

    let timestamp = `${hour}:${minutes}:${seconds}:${milliseconds}`;

    if (previousTime == 0) {
      previousTime = milliseconds;
    } else if (milliseconds > previousTime && milliseconds - previousTime > 125) {
      previousTime = milliseconds;
      write();

    } else if (milliseconds < previousTime && (1000 - previousTime) + milliseconds > 125) {
      previousTime = milliseconds;
      write();
    }
  } catch (e) {
    //console.log(e);
    //--- wierd undefined bug that doesn't seem to cause any issues
  }
}

/*--------------------
TODO:

add comments
---------------------*/