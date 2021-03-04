class Logger {
  constructor(songFile, bins, smoothingValue) {
    this.logBody = '';
    this.previousTime = -125;
    this.songFile = songFile;
    this.bins = bins;
    this.smoothingValue = smoothingValue;

    this.logSetup();
  }

  //creates new blank log
  resetLog() {
    this.logBody = '';
    this.logSetup();
  }

  logSetup() {
    try {
      this.logBody += 'File: ' + this.songFile.substring(this.songFile.indexOf('/') + 1, this.songFile.indexOf('.')) + '\n';
    } catch (error) {
      this.logBody += 'File: ' + this.songFile + '\n';
    }

    this.logBody += 'Bin Size: ' + this.bins + '\n';
    this.logBody += 'Smoothing Value: ' + this.smoothingValue + '\n\n';
  }

  //adds single string to the log
  logAdd(string) {
    this.logBody += string;
  }

  //adds new log entry
  logPush(energy, peaks) {
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

      this.logBody += `${timestamp}\n`;
      this.logBody += `Peaks: ${peaks}\n`;
      for (let i = 0; i < energy.length; i++) {
        this.logBody += `    ${i} - ${energy[i].toString()}\n`;
      }
      this.logBody += '\n\n';

    } else if (milliseconds < this.previousTime && (1000 - this.previousTime) + milliseconds > 125) {
      this.previousTime = milliseconds;

      this.logBody += `${timestamp}\n`;
      this.logBody += `Peaks: ${peaks}\n`;
      for (let i = 0; i < energy.length; i++) {
        this.logBody += `    ${i} - ${energy[i].toString()}\n`;
      }
      this.logBody += '\n\n';
    }
  }

  //returns log
  getLogBody() {
    return this.logBody;
  }

  //downloads log
  createLog() {
    let logBody = this.logBody;
    logBody = logBody.replace('undefined', '');
    let fileWriter = createWriter('log.txt');
    fileWriter.write(logBody);
    fileWriter.close();
  }
}