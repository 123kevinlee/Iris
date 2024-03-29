//Kevin Lee - Research Project - 2021

//HTML Elements
let togglePlayButton;
let saveButton;
let resetLogButton;
let fileInput;
let inputFile;
let songSelectDropdown;
let resetColorButton;
let colorPickers = [];
let songLabel;

//p5 objects
let song;
let fft;
let peakDetect;
let mic;
let fontRegular;

let songFile = 'songs/experience.mp3';
let smoothingValue = .9;
let bins = 4096;
let logger;
let newSongLoading = false;
let startingAmps = [];
let usingMic = false;

function preload() {
  song = loadSound(songFile);
  song.amp(1);
}

function setup() {
  //instantiate logging object
  logger = new Logger(songFile, bins, smoothingValue);

  createCanvas(windowWidth - 50, windowHeight - 50, WEBGL);

  //creates the color pickers
  for (let i = 0; i < 12; i++) {
    let colorArr = Constants.originalNoteColorObjects[Constants.notes[i]];
    let colorObj = color(colorArr[0], colorArr[1], colorArr[2]);
    let colorPicker = createColorPicker(colorObj);
    colorPicker.position(width * .023, height * .1 + (i * 50));
    colorPicker.input(changeColorAssocation);
    colorPickers.push(colorPicker);

    //creates the note label for colorpickers
    let colorPickerLabel = createElement('p', Constants.notes[i] + ': ');
    colorPickerLabel.position(width * .01, height * .1 + (i * 50) - 14);
  }

  //creates Reset Colors button
  resetColorButton = createButton('Reset Colors');
  resetColorButton.mousePressed(resetColors);
  resetColorButton.position(width * .01, height * .1 + (12 * 50));

  //creates song selection dropodown
  songSelectDropdown = createSelect();
  songSelectDropdown.position(50, height - 20);
  songSelectDropdown.option('Experience by Ludovico Einaudi');
  songSelectDropdown.option('La La Land: Mia and Sebestian\'s Theme');
  songSelectDropdown.option('Yesterday by The Beatles');
  songSelectDropdown.option('Chopin Nocturne Op9 No1');
  songSelectDropdown.option('Sir Duke by Stevie Wonder');
  songSelectDropdown.option('Believer by Imagine Dragons');
  songSelectDropdown.option('Bflat Note');
  songSelectDropdown.option('Custom');
  songSelectDropdown.option('Mic Input');
  //songSelectDropdown.option('Chopin Fantaisie Impromptu');
  //songSelectDropdown.option('Harry Potter Theme');
  //songSelectDropdown.option('La La Land: City of Stars');
  songSelectDropdown.selected('Experience by Ludovico Einaudi');
  songSelectDropdown.changed(songSelectDropdowned);

  input = createFileInput(handleFile);
  input.position(320, height - 20);

  //creates song selector label
  songLabel = createElement('p', 'Song:');
  songLabel.position(10, height - 37);

  //creates play/pause button
  togglePlayButton = createButton('togglePlayButton');
  togglePlayButton.html('play');
  togglePlayButton.mousePressed(togglePlayButtonSound);

  //creates download log button
  saveButton = createButton('download log');
  saveButton.mousePressed(() => logger.createLog());

  //creates reset log button
  resetLogButton = createButton('reset log');
  resetLogButton.mousePressed(() => logger.resetLog());

  //initialize FFT object
  fft = new p5.FFT(smoothingValue, bins);

  //microphone setup
  mic = new p5.AudioIn();
}

function draw() {
  noStroke();
  background(12, 15, 23);
  orbitControl(); //allows for mouse control of movement in 3d plane

  //waits until song is loaded before allowing interaction
  if (song.isLoaded() && newSongLoading) {
    togglePlayButton.html('play');
    togglePlayButton.removeAttribute('disabled');
    newSongLoading = false;
  } else if (!song.isPlaying()) {
    togglePlayButton.html('play');
  }


  fft.analyze(); //fft analyze current moment in song

  let ap = new AudioProcessing(fft);
  let energy = ap.analyzeNotes(); //get amplitudes of chromatic notes
  let distinctNotes = ap.getDistinctNotes(); //get distinct notes


  //logic for setting initial amplitude for each note

  //removes notes that are no longer distinct
  if (startingAmps.length > 0 && distinctNotes.length > 0) {
    for (let i = 0; i < startingAmps.length; i++) {
      let containsNote = false;
      for (let j = 0; j < distinctNotes.length; j++) {
        if (startingAmps[i][0] == distinctNotes[j][0] && startingAmps[i][1] == distinctNotes[j][1]) {
          containsNote = true;
        }
      }
      if (!containsNote) {
        startingAmps.splice(i, 1);
      }
    }
  }

  //adds notes that are newly distinct
  if (distinctNotes.length > 0) {
    for (let i = 0; i < distinctNotes.length; i++) {
      let containsNote = false;
      if (startingAmps.length > 0) {
        for (let j = 0; j < startingAmps.length; j++) {
          if (distinctNotes[i][0] == startingAmps[j][0] && distinctNotes[i][1] == startingAmps[j][1]) {
            containsNote = true;
          }
        }
      }

      if (!containsNote) {
        let o = distinctNotes[i][0];
        let n = distinctNotes[i][1];
        let e = energy[o][n];
        startingAmps.push([o, n, e]);
      }
    }
  }

  let distinctNotesS = '';

  let w = width / (energy.length * energy[0].length); //get note position intervals
  for (let i = 0; i < distinctNotes.length; i++) {
    distinctNotesS += Constants.notes[distinctNotes[i][1]] + distinctNotes[i][0] + ', ';

    //get note name
    let note = Constants.notes[distinctNotes[i][1]] + distinctNotes[i][0];
    let baseNote = note.substring(0, note.length - 1);
    let octave = note.substring(note.length - 1);

    //get color and position variables
    let colorObject = Constants.noteColorObjects[baseNote];
    let j = Constants.noteColorOffset[baseNote];
    let amp = energy[octave][j];

    //map position variables to position

    //find initial amplitude value
    let h = 0;
    for (let c = 0; c < startingAmps.length; c++) {
      if (distinctNotes[i][0] == startingAmps[c][0] && distinctNotes[i][1] == startingAmps[c][1]) {
        h = map(startingAmps[c][2], 0, 255, height, 0);
      }
    }

    //cuberoot amp -> radius relationship
    let amprFunction = ampToRadius(amp);
    let amprFunctionLimit = ampToRadius(255);
    let er = map(amprFunction, 0, amprFunctionLimit, 0, 40);

    let r = map(amp, 0, 255, -600, 600); //linear relationship for amp -> radius

    //create sphere for note
    push();
    //lighting settings
    ambientLight(255 - octave * 15);
    let brightness = amp / 2;
    directionalLight(brightness, brightness, brightness, 0, 0, -10000);
    specularMaterial(colorObject[0], colorObject[1], colorObject[2]);

    let wiggle = Math.random(-10, 10);

    translate(w * (octave * 12 + j) - 50 - width / 2 + wiggle, h - height / 2 + wiggle, r);
    shininess(1);
    sphere(er);
    pop();
  }

  //logs fft values if there is a song playing
  if (song.isPlaying()) {
    //console.log(song.currentTime());
    //console.log(ap.baseNotes);
    logger.logPush(energy, distinctNotesS);
  }
}

//--- togglePlayButton sound on and off
function togglePlayButtonSound() {
  if (song.isPlaying()) {
    song.pause();
    logger.logAdd('break\n\n');
    togglePlayButton.html('play');
  } else {
    song.play();
    togglePlayButton.html('pause');
  }
}

//resets color association to default
function resetColors() {
  //removes existing color pickers from the dom
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

//updates color association to chosen colors in color pickers
function changeColorAssocation() {
  for (let i = 0; i < colorPickers.length; i++) {
    Constants.noteColorObjects[Constants.notes[i]] = colorToRGBArray(colorPickers[i].color());
  }
}

//--- Switch songs
function songSelectDropdowned() {
  let item = songSelectDropdown.value();
  song.stop();

  if (usingMic) {
    mic.stop();
    fft.setInput();
    usingMic = false;
  }


  switch (item) {
    case 'Chopin Nocturne Op9 No1':
      songFile = 'songs/chopinop9n1.mp3';
      break;
    case 'Chopin Fantaisie Impromptu':
      songFile = 'songs/chopinfantasie.mp3';
      break;
    case 'Harry Potter Theme':
      songFile = 'songs/hp.mp3';
      break;
    case 'Bflat Note':
      songFile = 'songs/bflat.mp3';
      break;
    case 'Sir Duke by Stevie Wonder':
      songFile = 'songs/sirduke.mp3'
      break;
    case 'La La Land: City of Stars':
      songFile = 'songs/cityofstars.mp3';
      break;
    case 'La La Land: Mia and Sebestian\'s Theme':
      songFile = 'songs/mstheme.mp3';
      break;
    case 'Believer by Imagine Dragons':
      songFile = 'songs/believer.mp3';
      break;
    case 'Experience by Ludovico Einaudi':
      songFile = 'songs/experience.mp3';
      break;
    case 'Yesterday by The Beatles':
      songFile = 'songs/yesterday.mp3';
      break;
    case 'Custom':
      songFile = inputFile;
      break;
    case 'Mic Input':
      usingMic = true;
      mic.start();
      fft.setInput(mic);
      break;
    default:
      songFile = 'songs/experience.mp3';
      break;
  }

  song = loadSound(songFile);
  song.amp(1);
  logger = new Logger(songFile, bins, smoothingValue);

  //disables play button until the song is loaded
  togglePlayButton.attribute('disabled', '');
  togglePlayButton.html('loading...');
  newSongLoading = true;
}

function handleFile(file) {
  if (file.type == 'audio') {
    inputFile = file;
    songSelectDropdown.selected('Custom');
    songSelectDropdowned();
  } else {
    alert('Please select an audio file!');
  }
}

//Calculates circle radius using a predetermined function
function ampToRadius(amp) {
  let r = Math.round(20 * negSquareRoot(amp - 175, 1 / 3) + 113); //https://www.desmos.com/calculator/hle1uqlc99
  return r;
  //return amp < 150 ? 1 * amp : 2 * amp - 150; //piecewise function
}

//function that fixes javascript bug that returns NaN when taking the power of a negative 
function negSquareRoot(x, y) {
  if (x > 0) {
    return Math.pow(x, y)
  }
  return -1 * Math.pow(-x, y)
}

//converts color object to rgb int array
function colorToRGBArray(color) {
  let colorS = color.toString();
  colorS = colorS.substring(colorS.indexOf('(') + 1, colorS.length - 3);
  let rgbArray = colorS.split(',').map(Number);;
  return rgbArray;
}