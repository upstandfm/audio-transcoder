'use strict';

module.exports = {
  /**
   * Validate the S3 standup audio recording key.
   *
   * @param {String} s3Key - URI decoded S3 key
   *
   * @throws {Error} Validation Error
   */
  standupAudioRecording(s3Key) {
    // A valid S3 key looks like:
    // "audio/standups/:standupId/DD-MM-YYYY/:userId/:filename.webm"
    const isValid = /^audio\/standups\/.+\/\d\d?-\d\d?-\d\d\d\d\/.+\/\w+\.webm/.test(
      s3Key
    );

    if (!isValid) {
      console.log('invalid S3 key: ', s3Key);
      throw new Error(
        'Invalid S3 key, format must be "audio/standups/:standupId/DD-MM-YYYY/:userId/:filename.webm"'
      );
    }
  },

  /**
   * Validate the S3 standup transcoded audio recording key.
   *
   * @param {String} s3Key - URI decoded S3 key
   *
   * @throws {Error} Validation Error
   */
  standupTranscodedAudioRecording(s3Key) {
    // A valid S3 key looks like:
    // "audio/standups/:standupId/DD-MM-YYYY/:userId/:filename.mp3"
    const isValid = /^audio\/standups\/.+\/\d\d?-\d\d?-\d\d\d\d\/.+\/\w+\.mp3/.test(
      s3Key
    );

    if (!isValid) {
      console.log('invalid S3 key: ', s3Key);
      throw new Error(
        'Invalid S3 key, format must be "audio/standups/:standupId/DD-MM-YYYY/:userId/:filename.mp3"'
      );
    }
  }
};
