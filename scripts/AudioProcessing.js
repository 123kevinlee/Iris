class AudioProcessing {
  constructor(fft) {
    this.fft = fft;
    this.energy = [];
    this.baseNotes = new Set();
  }

  //returns array of amplitudes for chromatic notes
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

  //returns frequencies for notes above octave 0
  getOctaveFrequency(baseFreq, octave) {
    return baseFreq * (Math.pow(2, octave));
  }

  //returns array of distinct notes
  getDistinctNotes() {
    let energy = this.energy;
    let distinctNotes = [];
    this.baseNotes.clear();

    for (let i = 0; i < energy.length; i++) {
      for (let j = 0; j < energy[i].length; j++) {
        let before = 0;
        let after = 0;
        let before1 = 0;
        let after1 = 0;


        //notes directly surrounding
        if (j > 0) {
          before = energy[i][j - 1];
        } else if (i > 0) {
          before = energy[i - 1][energy[i - 1].length - 1];
        }

        if (j < energy[i].length - 1) {
          after = energy[i][j + 1]
        } else if (i < energy.length - 1) {
          after = energy[i + 1][0];
        }

        //notes one away
        if (j > 1) {
          before1 = energy[i][j - 2];
        } else if (i > 0) {
          before1 = energy[i - 1][energy[i - 1].length - 2];
        }

        if (j < energy[i].length - 2) {
          after = energy[i][j + 2]
        } else if (i < energy.length - 1) {
          after = energy[i + 1][1];
        }

        if (before < energy[i][j] && before1 < energy[i][j] && energy[i][j] > after && energy[i][j] > after1) {
          let amnt = 0;
          let cap = 2;
          for (let h = 0; h < distinctNotes.length; h++) {
            if (j == distinctNotes[h][1]) {
              amnt = Math.min(amnt + 1, cap);
              if (amnt == cap && energy[i][j] > energy[distinctNotes[h][0]][distinctNotes[h][1]]) {
                distinctNotes.splice(h, 1);
                distinctNotes.push([i, j]);
              }
            }
          }
          if (amnt < cap) {
            distinctNotes.push([i, j]);
            this.baseNotes.add(Constants.notes[j]);
          }
        }
      }
    }

    return distinctNotes;
  }
}