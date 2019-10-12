'use strict';

const ElasticTranscoder = require('aws-sdk/clients/elastictranscoder');
const transcoder = require('./transcoder');
const validateS3Key = require('./validate-s3-key');

const {
  ELASTIC_TRANSCODER_REGION,
  TRANSCODE_AUDIO_RECORDINGS_PIPELINE_ID,
  TRANSCODER_AAC_64_PRESET_ID,
  TRANSCODER_AAC_64_PRESET_FILE_EXTENSION
} = process.env;

const transcoderClient = new ElasticTranscoder({
  region: ELASTIC_TRANSCODER_REGION
});

/**
 * Lambda SNS Topic subscriber that schedules an AWS Elastic Transcoder job to
 * convert an audio recording into m4a.
 *
 * The SNS Topic trigger is an S3 notification.
 *
 * @param {Object} event - SNS message event
 * @param {Object} context - AWS lambda context
 *
 * For more info on SNS message see:
 * https://docs.aws.amazon.com/lambda/latest/dg/with-sns.html
 *
 * For more info on AWS lambda context see:
 * https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 *
 */
module.exports.convertToM4a = async (event, context) => {
  try {
    const { Records } = event;

    if (!Records || !Records.length) {
      console.log('No event Records');
      return;
    }

    for (const Record of Records) {
      const { Sns } = Record;

      if (!Sns) {
        console.log('Not an SNS event');
        continue;
      }

      // An S3 Event Message is a JSON string!
      const { Message } = Sns;

      if (!Message) {
        console.log('No Sns Message in event record');
        continue;
      }

      let msg;
      try {
        msg = JSON.parse(Message);
      } catch (err) {
        console.log('Invalid Sns Message');
        continue;
      }

      // An S3 Event message contains a "Records" list!
      // For more info see:
      // https://docs.aws.amazon.com/AmazonS3/latest/dev/notification-content-structure.html
      const { Records: MsgRecords } = msg;

      if (!MsgRecords || !MsgRecords.length) {
        console.log('No Message Records');
        continue;
      }

      for (const MsgRecord of MsgRecords) {
        const { s3 } = MsgRecord;

        if (!s3) {
          console.log('Not an S3 event');
          continue;
        }

        let s3Key;
        if (s3.object && s3.object.key) {
          // Keys are sent as URI encoded strings
          // If keys are not decoded, they will not be found in their buckets
          s3Key = decodeURIComponent(s3.object.key);
        }

        validateS3Key.standupAudioRecording(s3Key);

        const jobData = await transcoder.scheduleJob(
          transcoderClient,
          TRANSCODE_AUDIO_RECORDINGS_PIPELINE_ID,
          TRANSCODER_AAC_64_PRESET_ID,
          TRANSCODER_AAC_64_PRESET_FILE_EXTENSION,
          s3Key
        );

        console.log('scheduled job: ', jobData);
      }
    }
  } catch (err) {
    console.log('transcode to m4a failed ', err);

    // Provided by Serverless Framework
    if (context && context.captureError) {
      context.captureError(err);
    }
  }
};
