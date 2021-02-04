class Logger{
    constructor(songFile, bins, smoothingValue){
        this.logBody = '';
        this.previousTime = - 125;
        this.songFile = songFile;
        this.bins = bins;
        this.smoothingValue = smoothingValue;

        this.logSetup();
    }

    logSetup() {
        this.logBody += 'File: ' + this.songFile.substring(this.songFile.indexOf('/') + 1, this.songFile.indexOf('.')) + '\n';
        this.logBody += 'Bin Size: ' + this.bins + '\n';
        this.logBody += 'Smoothing Value: ' + this.smoothingValue + '\n\n';
    }
      
    resetLog() {
      this.logBody = '';
      this.logSetup();
      //console.log(this.songFile);

      //this.logBody += 'File: ' + this.songFile.substring(this.songFile.indexOf('/') + 1, this.songFile.indexOf('.')) + '\n';
      //this.logBody += 'Bin Size: ' + this.bins + '\n';
      //this.logBody += 'Smoothing Value: ' + this.smoothingValue + '\n\n';
    }
      
    logAdd(string){
        this.logBody += string;
    }

    logPush(noteIndex, note, energy, backgroundNotes, peaks) {
        //console.log('ENERGY:' + energy);
        
    
        let date = new Date();
        let milliseconds = date.getMilliseconds();
        let seconds = date.getSeconds();
        let minutes = date.getMinutes();
        let hour = date.getHours();
    
        let timestamp = `${hour}:${minutes}:${seconds}:${milliseconds}`;
    
        if (this.previousTime == 0) {
          this.previousTime = milliseconds;
        } else if (milliseconds > this.previousTime && milliseconds - this.previousTime > 125) {
          this.previousTime = milliseconds;

          this.logBody += `${timestamp}: ${note}[${noteIndex}]\n`;
          this.logBody += `Background: ${backgroundNotes}\n`;
          this.logBody += `Peaks: ${peaks}\n`;
          for (let i = 0; i < energy.length; i++) {
            this.logBody += `    ${i} - ${energy[i].toString()}\n`;
          }
          this.logBody += '\n\n';
    
        } else if (milliseconds < this.previousTime && (1000 - this.previousTime) + milliseconds > 125) {
          this.previousTime = milliseconds;
          
          this.logBody += `${timestamp}: ${note}[${noteIndex}]\n`;
            this.logBody += `Background: ${backgroundNotes}\n`;
            this.logBody += `Peaks: ${peaks}\n`;
            for (let i = 0; i < energy.length; i++) {
              this.logBody += `    ${i} - ${energy[i].toString()}\n`;
            }
            this.logBody += '\n\n';
        }

        // function write(logBody) {
        //     logBody += `${timestamp}: ${note}[${noteIndex}]\n`;
        //     logBody += `Background: ${backgroundNotes}\n`;
        //     logBody += `Peaks: ${peaks}\n`;
        //     for (let i = 0; i < energy.length; i++) {
        //       logBody += `    ${i} - ${energy[i].toString()}\n`;
        //     }
        //     logBody += '\n\n';
        //   }
    }

    getLogBody(){
        return this.logBody;
    }
}

