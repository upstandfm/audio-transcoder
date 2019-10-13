'use strict';

const { spawnSync } = require('child_process');
const { readFileSync, writeFileSync, unlinkSync } = require('fs');

module.exports = {
  /**
   * Transcode a WebM recording to mp3 with FFmpeg.
   *
   * @param {Object} webmBlob
   *
   * @return {Object} Transcoded mp3 blob
   */
  convertToMp3(webmBlob) {
    const now = Date.now();
    const input = `/tmp/${now}.webm`;
    const output = `/tmp/${now}.mp3`;

    // First write the input blob into "/tmp", so FFmpeg can read it when
    // transcoding
    writeFileSync(input, webmBlob);

    spawnSync(
      // Provided by the AWS Lambda Layer "ffmpeg"
      '/opt/ffmpeg/ffmpeg',
      ['-i', input, output],
      { stdio: 'inherit' }
    );

    const mp3Blob = readFileSync(output);

    // Clean all temporary files
    unlinkSync(input);
    unlinkSync(output);

    return mp3Blob;
  }
};
