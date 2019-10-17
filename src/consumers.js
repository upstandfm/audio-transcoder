'use strict';

const S3 = require('aws-sdk/clients/s3');
const DynamoDB = require('aws-sdk/clients/dynamodb');
const processMessages = require('./process-messages');
const validateS3Key = require('./validate-s3-key');
const recordings = require('./recordings');
const ffmpeg = require('./ffmpeg');

const {
  S3_RECORDINGS_BUCKET_NAME,
  S3_TRANSCODED_RECORDINGS_BUCKET_NAME,
  DYNAMODB_STANDUPS_TABLE_NAME
} = process.env;

const s3Client = new S3();

// For more info see:
// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#constructor-property
const documentClient = new DynamoDB.DocumentClient({
  convertEmptyValues: true
});

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
 * Lambda SNS Topic subscriber that transcodes a WebM audio recording o mp3
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
module.exports.ffmpegWebmToMp3 = async (event, context) => {
  try {
    console.log('event: ', JSON.stringify(event));

    await processMessages.forEverySnsS3Record(event, async (err, s3) => {
      if (err) {
        // Failed to process SNS S3 event record
        _handleError(context, err);
        return;
      }

      let s3Key;

      if (s3.object && s3.object.key) {
        // Keys are sent as URI encoded strings
        // If keys are not decoded, they will not be found in their buckets
        s3Key = decodeURIComponent(s3.object.key);
      }

      validateS3Key.standupAudioRecording(s3Key);

      const webmRecording = await recordings.getObject(
        s3Client,
        S3_RECORDINGS_BUCKET_NAME,
        s3Key
      );

      if (!webmRecording || !webmRecording.Body) {
        console.log('No recording object found for key: ', s3Key);
        return;
      }

      const mp3Blob = ffmpeg.convertWebmToMp3(webmRecording.Body, s3Key);

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
    });
  } catch (err) {
    // Failed to transcode WebM to mp3
    _handleError(context, err);
  }
};

/**
 * Lambda SNS Topic subscriber that creates a recording item in DB.
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
module.exports.createRecording = async (event, context) => {
  try {
    console.log('event: ', JSON.stringify(event));

    await processMessages.forEverySnsS3Record(event, async (err, s3) => {
      if (err) {
        // Failed to process SNS S3 event records
        _handleError(context, err);
        return;
      }

      let s3Key;

      if (s3.object && s3.object.key) {
        // Keys are sent as URI encoded strings
        // If keys are not decoded, they will not be found in their buckets
        s3Key = decodeURIComponent(s3.object.key);
      }

      validateS3Key.standupAudioRecording(s3Key);

      // A valid S3 key looks like:
      // "audio/standups/:standupId/DD-MM-YYYY/:userId/:filename.webm"
      const [, , standupId, dateKey, userId, file] = s3Key.split('/');
      const [filename] = file.split('.');

      await recordings.createItem(
        documentClient,
        DYNAMODB_STANDUPS_TABLE_NAME,
        standupId,
        dateKey,
        userId,
        filename
      );
    });
  } catch (err) {
    // Failed to create recording item with status
    _handleError(context, err);
  }
};
