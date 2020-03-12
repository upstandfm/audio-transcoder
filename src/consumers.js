'use strict';

const S3 = require('aws-sdk/clients/s3');
const DynamoDB = require('aws-sdk/clients/dynamodb');
const processMessages = require('./process-messages');
const schema = require('./schema');
const recordings = require('./recordings');
const ffmpeg = require('./ffmpeg');

const {
  S3_RECORDINGS_BUCKET_NAME,
  S3_TRANSCODED_RECORDINGS_BUCKET_NAME,
  WORKSPACES_TABLE_NAME
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
 * Lambda SNS Topic subscriber that transcodes a WebM audio recording to MP3
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

      const webmRecording = await recordings.getObject(
        s3Client,
        S3_RECORDINGS_BUCKET_NAME,
        s3Key
      );

      if (!webmRecording || !webmRecording.Body) {
        // When there's no recording data, we stop processing this SNS record
        const err = new Error(`No audio data for key "${s3Key}"`);
        _handleError(context, err);
        return;
      }

      try {
        schema.validateMetadata(webmRecording.Metadata);
      } catch (err) {
        // When the metadata is invalid, we stop processing this SNS record
        _handleError(context, err);
        return;
      }

      const mp3Blob = ffmpeg.convertWebmToMp3(webmRecording.Body);
      const outputKey = s3Key.replace('webm', 'mp3');
      await recordings.putObject(
        s3Client,
        S3_TRANSCODED_RECORDINGS_BUCKET_NAME,
        outputKey,
        'audio/mpeg',
        mp3Blob,
        webmRecording.Metadata
      );
    });
  } catch (err) {
    // Failed to transcode WebM to mp3
    _handleError(context, err);
  }
};

/**
 * Lambda SNS Topic subscriber that creates a recording item in DB a new audio
 * recording was uploaded.
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

      const metadata = await recordings.getMetadata(
        s3Client,
        S3_RECORDINGS_BUCKET_NAME,
        s3Key
      );

      try {
        schema.validateMetadata(metadata);
      } catch (err) {
        // When the metadata is invalid, we stop processing this SNS record
        _handleError(context, err);
        return;
      }

      await recordings.createItem({
        client: documentClient,
        tableName: WORKSPACES_TABLE_NAME,
        userId: metadata['user-id'],
        workspaceId: metadata['workspace-id'],
        channelId: metadata['channel-id'],
        recordingId: metadata['recording-id'],
        date: metadata.date,
        name: metadata.name
      });
    });
  } catch (err) {
    // Failed to create recording item
    _handleError(context, err);
  }
};

/**
 * Lambda SNS Topic subscriber that updates a recording item in DB when an
 * audio recording has been transcoded.
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
module.exports.updateRecording = async (event, context) => {
  try {
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

      const metadata = await recordings.getMetadata(
        s3Client,
        S3_TRANSCODED_RECORDINGS_BUCKET_NAME,
        s3Key
      );

      try {
        schema.validateMetadata(metadata);
      } catch (err) {
        // When the metadata is invalid, we stop processing this SNS record
        _handleError(context, err);
        return;
      }

      await recordings.updateItem({
        client: documentClient,
        tableName: WORKSPACES_TABLE_NAME,
        s3Key,
        userId: metadata['user-id'],
        workspaceId: metadata['workspace-id'],
        channelId: metadata['channel-id'],
        recordingId: metadata['recording-id'],
        date: metadata.date
      });
    });
  } catch (err) {
    // Failed to update recording item status + key
    _handleError(context, err);
  }
};
