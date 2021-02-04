//Kevin Lee - Research Project - 2021

//HTML Elements
let togglePlayButton;
let saveButton;
let resetLogButton;
let songSelectDropdown;
let resetColorButton;
let colorPickers = [];

//p5 objects
let song;
let fft;
let peakDetectFft;
let peakDetect;
let mic;

let songFile = 'songs/sirduke.mp3';
let smoothingValue = .9;
let bins = 4096;
let peakThreshold = .001;
let log;

let ellipseWidth = 100;

let newSongLoading = false;

function preload() {
  song = loadSound(songFile);
  song.amp(1);
}

function setup() {
  createCanvas(windowWidth - 50, windowHeight - 50);

  for (let i = 0; i < 12; i++) {
    let colorArr = Constants.originalNoteColorObjects[Constants.notes[i]];
    let colorObj = color(colorArr[0], colorArr[1], colorArr[2]);
    let colorPicker = createColorPicker(colorObj);
    colorPicker.position(width * .022, height * .1 + (i * 50));
    colorPicker.input(changeColorAssocation);
    colorPickers.push(colorPicker);
  }

  resetColorButton = createButton('Reset Colors');
  resetColorButton.mousePressed(resetColors);
  resetColorButton.position(width * .01, height * .1 + (12 * 50));

  songSelectDropdown = createSelect();
  songSelectDropdown.position(50, height - 20);
  songSelectDropdown.option('Sir Duke by Stevie Wonder');
  songSelectDropdown.option('Chopin Op9 No1');
  //songSelectDropdown.option('Chopin Fantaisie Impromptu');
  songSelectDropdown.option('Harry Potter');
  songSelectDropdown.option('La La Land: City of Stars');
  songSelectDropdown.option('La La Land: Mia and Sebestian\'s Theme');
  songSelectDropdown.option('Believer by Imagine Dragons');
  songSelectDropdown.option('Bflat Note');
  songSelectDropdown.selected('Sir Duke by Stevie Wonder');
  songSelectDropdown.changed(songSelectDropdowned);

  togglePlayButton = createButton('togglePlayButton');
  togglePlayButton.html('play');
  togglePlayButton.mousePressed(togglePlayButtonSound);

  saveButton = createButton('download log');
  saveButton.mousePressed(createLog);

  resetLogButton = createButton('reset log');
  resetLogButton.mousePressed(resetLog);

  logSetup();

  //mic = new p5.AudioIn();
  //mic.start();
  fft = new p5.FFT(smoothingValue, bins);
  peakDetect = new p5.PeakDetect(20, 20000, peakThreshold, 20);
  //fft.setInput(mic);
}

function draw() {
  noStroke();
  background(255, 255, 255);

  textSize(14);
  fill('black');
  text('Song:', 10, height - 6);
  //text('C:', width * .01, height * .03 + 18);

  for (let i = 0; i < Constants.notes.length; i++) {
    text(Constants.notes[i] + ': ', width * .01, height * .1 + (i * 50) + 18)
  }

  if (song.isLoaded() && newSongLoading) {
    togglePlayButton.html('play');
    togglePlayButton.removeAttribute('disabled');
    newSongLoading = false;
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

  let ap = new AudioProcessing(fft);
  let energy = ap.analyzeNotes();
  //let energy = analyzeNotes();
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

  let colorObject = Constants.noteColorObjects[Constants.noteKeys[highAmpJ].substring(0, Constants.noteKeys[highAmpJ].length - 1)];
  //console.log(color);

  textSize(64);
  fill(colorObject[0], colorObject[1], colorObject[2], 255 - highAmpI * 15);

  let noteName;
  if (highAmp != 0) {
    noteName = Constants.noteKeys[highAmpJ].substring(0, Constants.noteKeys[highAmpJ].length - 1) + highAmpI;
    //text(noteName, 150, 150);
    circle(w * highX - 50, (height - highAmp) * 1.25, highAmp / 3);
  }

  let backgroundNotes = '';

  //let peaks = getPeaks(energy, loudestAmp);
  let peaks = ap.getPeaks(loudestAmp);
  //console.log(peaks);

  for (let k = 0; k < peaks.length; k++) {
    backgroundNotes += Constants.noteKeys[peaks[k].split('-')[1]].substring(0, Constants.noteKeys[peaks[k].split('-')[1]].length - 1) + peaks[k].split('-')[0] + ' ';

    let note = Constants.noteKeys[peaks[k].split('-')[1]].substring(0, Constants.noteKeys[peaks[k].split('-')[1]].length - 1) + peaks[k].split('-')[0];
    let baseNote = note.substring(0, note.length - 1);
    let octave = note.substring(note.length - 1);
    let j = Constants.noteColorOffset[baseNote];
    let colorObject = Constants.noteColorObjects[Constants.noteKeys[j].substring(0, Constants.noteKeys[j].length - 1)];
    let amp = energy[octave][j];
    fill(colorObject[0], colorObject[1], colorObject[2], 255 - octave * 15);
    circle(w * (octave * 12 + j) - 50, (height - amp), amp / 3);
  }

  fill(255, 155, 0);
  //text(backgroundNotes, 150, 200);

  if (song.isPlaying()) {
    logPush(highAmpJ, noteName, energy, backgroundNotes, peaks)
  }
}

//--- togglePlayButton sound on and off
function togglePlayButtonSound() {
  if (song.isPlaying()) {
    song.pause();
    log += 'break\n\n';
    togglePlayButton.html('play');
  } else {
    song.play();
    togglePlayButton.html('pause');
  }
}

function changeColorAssocation() {
  for (let i = 0; i < colorPickers.length; i++) {
    Constants.noteColorObjects[Constants.notes[i]] = colorToRGBArray(colorPickers[i].color());
  }
}

function resetColors() {
  for (let i = 0; i < colorPickers.length; i++) {
    colorPickers[i].remove();
  }
  colorPickers = [];

  for (let i = 0; i < 12; i++) {
    let colorArr = Constants.originalNoteColorObjects[Constants.notes[i]];
    let colorObj = color(colorArr[0], colorArr[1], colorArr[2]);
    let colorPicker = createColorPicker(colorObj);
    colorPicker.position(width * .022, height * .1 + (i * 50));
    colorPicker.input(changeColorAssocation);
    colorPickers.push(colorPicker);
  }

  changeColorAssocation();
}

function colorToRGBArray(color) {
  let colorS = color.toString();
  colorS = colorS.substring(colorS.indexOf('(') + 1, colorS.length - 3);
  let rgbArray = colorS.split(',').map(Number);;
  return rgbArray;
}

//--- Switch songs
function songSelectDropdowned() {
  let item = songSelectDropdown.value();
  song.stop();
  switch (item) {
    case 'Chopin Op9 No1':
      songFile = 'songs/chopinop9n1.mp3';
      song = loadSound(songFile);
      song.amp(1);
      break;
    case 'Chopin Fantaisie Impromptu':
      songFile = 'songs/chopinfantasie.mp3';
      song = loadSound(songFile);
      song.amp(1);
      break;
    case 'Harry Potter':
      songFile = 'songs/hp.mp3';
      song = loadSound(songFile);
      song.amp(1);
      break;
    case 'Bflat Note':
      songFile = 'songs/bflat.mp3';
      song = loadSound(songFile);
      song.amp(1);
      break;
    case 'Sir Duke by Stevie Wonder':
      songFile = 'songs/sirduke.mp3'
      song = loadSound(songFile);
      song.amp(1);
      break;
    case 'La La Land: City of Stars':
      songFile = 'songs/cityofstars.mp3';
      song = loadSound(songFile);
      song.amp(1);
      break;
    case 'La La Land: Mia and Sebestian\'s Theme':
      songFile = 'songs/mstheme.mp3';
      song = loadSound(songFile);
      song.amp(1);
      break;
    case 'Believer by Imagine Dragons':
      songFile = 'songs/believer.mp3';
      song = loadSound(songFile);
      song.amp(1);
      break;
    default:
      break;
  }
  togglePlayButton.attribute('disabled', '');
  togglePlayButton.html('loading...');
  newSongLoading = true;
}

// //--- returns a 2D array with the amplitude of each note frequency in each octave
// function analyzeNotes() {
//   let octaves = 8; //--- 8 octaves on a piano
//   let final = [];
//   for (let i = 0; i <= octaves; i++) {
//     var temp = [];
//     for (let j = 0; j < Constants.noteKeys.length; j++) {
//       temp.push(fft.getEnergy(getOctaveFrequency(Constants.noteFrequencies[Constants.noteKeys[j]], i)));
//     }
//     final.push(temp);
//   }
//   return final;
// }

// //--- returns frequency of note in a set octave -- note frequencies increase by a factor of 2 each octave
// function getOctaveFrequency(baseFreq, octave) {
//   return baseFreq * (Math.pow(2, octave));
// }

// function getPeaks(energy, amp) {
//   let peaks = [];
//   let filter = amp * .5;

//   for (let i = 0; i < energy.length; i++) {
//     for (let j = 0; j < energy[i].length; j++) {
//       let before = j > 0 ? j - 1 : null;
//       let after = j < energy[i].length - 1 ? j + 1 : null;
//       if (before != null && after != null) {
//         if (energy[i][before] < energy[i][j] && energy[i][j] < energy[i][after] && energy[i][j] > filter) {
//           peaks.push(i + '-' + (j + 1));
//           //console.log(energy[i][j]);
//         }
//       }
//     }
//   }

//   return peaks;
// }

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