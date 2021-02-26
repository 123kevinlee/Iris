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
let peakDetect;
let mic;

let songFile = 'songs/sirduke.mp3';
let smoothingValue = .9;
let bins = 4096;
//let peakThreshold = .001;
let logger;
let newSongLoading = false;

//variable for beat detection ellipse
let ellipseWidth = 100;

function preload() {
  song = loadSound(songFile);
  song.amp(1);
}

function setup() {
  //instantiate logging object
  logger = new Logger(songFile, bins, smoothingValue);

  createCanvas(windowWidth - 50, windowHeight - 50);

  //creates the color pickers
  for (let i = 0; i < 12; i++) {
    let colorArr = Constants.originalNoteColorObjects[Constants.notes[i]];
    let colorObj = color(colorArr[0], colorArr[1], colorArr[2]);
    let colorPicker = createColorPicker(colorObj);
    colorPicker.position(width * .023, height * .1 + (i * 50));
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
  saveButton.mousePressed(() => logger.createLog());

  resetLogButton = createButton('reset log');
  resetLogButton.mousePressed(() => logger.resetLog());

  fft = new p5.FFT(smoothingValue, bins);
  //peakDetect = new p5.PeakDetect(20, 20000, peakThreshold, 20);

  //mic stuff
  //mic = new p5.AudioIn();
  //mic.start();
  //fft.setInput(mic);
}

function draw() {
  noStroke();
  background(255, 255, 255);

  textSize(14);
  fill('black');
  text('Song:', 10, height - 6);

  //Note names for color pickers
  for (let i = 0; i < Constants.notes.length; i++) {
    text(Constants.notes[i] + ': ', width * .01, height * .1 + (i * 50) + 18)
  }

  //waits until song is loaded
  if (song.isLoaded() && newSongLoading) {
    togglePlayButton.html('play');
    togglePlayButton.removeAttribute('disabled');
    newSongLoading = false;
  } else if (!song.isPlaying()) {
    togglePlayButton.html('play');
  }

  fft.analyze();

  let ap = new AudioProcessing(fft);
  let energy = ap.analyzeNotes();
  let distinctNotes = ap.getDistinctNotes();

  let distinctNotesS = '';
  let w = width / (energy.length * energy[0].length);
  for (let i = 0; i < distinctNotes.length; i++) {
    distinctNotesS += Constants.notes[distinctNotes[i][1]] + distinctNotes[i][0];

    let note = Constants.notes[distinctNotes[i][1]] + distinctNotes[i][0];
    let baseNote = note.substring(0, note.length - 1);
    let octave = note.substring(note.length - 1);

    let colorObject = Constants.noteColorObjects[baseNote];
    let j = Constants.noteColorOffset[baseNote];
    let amp = energy[octave][j];

    let h = map(amp, 0, 255, height, 0);
    let r = map(amp, 0, 255, 0, 140);
    fill(colorObject[0], colorObject[1], colorObject[2], 255 - octave * 15);
    circle(w * (octave * 12 + j) - 50, h, r);
  }

  //logs fft values if there is a song playing
  if (song.isPlaying()) {
    //logger.logPush(highAmpJ, noteName, energy, backgroundNotes, peaks);
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

//converts color object to rgb int array
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
      break;
    case 'Chopin Fantaisie Impromptu':
      songFile = 'songs/chopinfantasie.mp3';
      break;
    case 'Harry Potter':
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
    default:
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