class AudioProcessing {
  constructor(fft) {
    this.fft = fft;
    this.energy = [];
  }

  analyzeNotes() {
    let octaves = 8; //--- 8 octaves on a piano
    let final = [];
    for (let i = 0; i <= octaves; i++) {
      var temp = [];
      for (let j = 0; j < Constants.noteKeys.length; j++) {
        temp.push(this.fft.getEnergy(this.getOctaveFrequency(Constants.noteFrequencies[Constants.noteKeys[j]], i)));
      }
      final.push(temp);
    }
    this.energy = final;
    return final;
  }

  getOctaveFrequency(baseFreq, octave) {
    return baseFreq * (Math.pow(2, octave));
  }

  getPeaks(amp) {
    let energy = this.energy;
    //console.log(energy);
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
}