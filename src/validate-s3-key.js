'use strict';

module.exports = {
  /**
   * Validate the S3 file key for an WebM recording.
   *
   * @param {String} s3Key - URI decoded S3 key
   *
   * @throws {Error} Validation Error
   */
  webmRecording(s3Key) {
    // A valid S3 key looks like:
    // "audio/:workspaceId/:standupId/:recordingId.webm"
    const isValid = /^audio\/[a-zA-Z-0-9_-]{7,14}\/[a-zA-Z-0-9_-]{7,14}\/[a-zA-Z-0-9_-]{7,14}\.webm$/.test(
      s3Key
    );

    if (!isValid) {
      throw new Error(
        'Invalid S3 key, format must be "audio/:workspaceId/:standupId/:recordingId.webm"'
      );
    }
  },

  /**
   * Validate the S3 file for an MP3 recording.
   *
   * @param {String} s3Key - URI decoded S3 key
   *
   * @throws {Error} Validation Error
   */
  mp3Recording(s3Key) {
    // A valid S3 key looks like:
    // "audio/:workspaceId/:standupId/:recordingId.mp3"
    const isValid = /^audio\/[a-zA-Z-0-9_-]{7,14}\/[a-zA-Z-0-9_-]{7,14}\/[a-zA-Z-0-9_-]{7,14}\.mp3$/.test(
      s3Key
    );

    if (!isValid) {
      throw new Error(
        'Invalid S3 key, format must be "audio/:workspaceId/:standupId/:recordingId.mp3"'
      );
    }
  }
};
