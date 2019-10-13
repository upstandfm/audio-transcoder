'use strict';

module.exports = {
  /**
   * Schedule an AWS Elastic Transcoder Job to transcode an audio file.
   *
   * @param {Object} client - AWS Elastic Transcoder client
   * @param {String} pipelineId - AWS Elastic Transcoder pipeline ID
   * @param {String} presetId - AWS Elastic Transcoder output preset ID
   * @param {String} presetFileExtension
   * @param {String} s3Key
   *
   * @return {Promise} Resolves with scheduled job data
   */
  scheduleJob(client, pipelineId, presetId, presetFileExtension, s3Key) {
    const params = {
      PipelineId: pipelineId,
      Input: {
        Key: s3Key
      },
      Outputs: [
        {
          // Note 1: if a file with the specified name already exists in the
          // output bucket, the job fails!
          //
          // Note 2: a valid S3 key will look like:
          // "audio/standups/:standupId/DD-MM-YYYY/:userId/:filename.webm"
          Key: s3Key.replace('webm', presetFileExtension),
          PresetId: presetId
        }
      ]
    };

    return client.createJob(params).promise();
  }
};
