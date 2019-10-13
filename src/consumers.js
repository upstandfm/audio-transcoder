'use strict';

const S3 = require('aws-sdk/clients/s3');
const validateS3Key = require('./validate-s3-key');
const recordings = require('./recordings');
const ffmpeg = require('./ffmpeg');

const {
  S3_RECORDINGS_BUCKET_NAME,
  S3_TRANSCODED_RECORDINGS_BUCKET_NAME
} = process.env;

const s3Client = new S3();

/**
 * Error handler.
 *
 * @param {Object} context - AWS Lambda context
 * @param {Object} err - Error
 */
function _handleError(context, err) {
  // Provided by Serverless Framework
  if (context && context.captureError) {
    context.captureError(err);
  }
}

/**
 * Lambda SNS Topic subscriber that transcodes an audio recording into mp3
 * using FFmpeg.
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
module.exports.ffmpegToMp3 = async (event, context) => {
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

      // An SNS Event Message is a JSON string!
      const { Message } = Sns;

      if (!Message) {
        console.log('No SNS Message in event record');
        continue;
      }

      let msg;

      try {
        msg = JSON.parse(Message);
      } catch (err) {
        console.log('Invalid SNS Message');
        _handleError(context, err);
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

        const recordingsObject = await recordings.getObject(
          s3Client,
          S3_RECORDINGS_BUCKET_NAME,
          s3Key
        );

        const mp3Blob = ffmpeg.convertToMp3(recordingsObject.Body, s3Key);

        // A valid S3 key will look like:
        // "audio/standups/:standupId/DD-MM-YYYY/:userId/:filename.webm"
        const outputKey = s3Key.replace('webm', 'mp3');

        await recordings.putObject(
          s3Client,
          S3_TRANSCODED_RECORDINGS_BUCKET_NAME,
          outputKey,
          'audio/mpeg',
          mp3Blob
        );
      }
    }
  } catch (err) {
    console.log('transcode to mp3 failed ', err);
    _handleError(context, err);
  }
};
