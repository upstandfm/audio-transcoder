'use strict';

const shortid = require('shortid');

module.exports = {
  /**
   * Get an Object from an S3 bucket.
   *
   * @param {Object} client - S3 client
   * @param {String} bucketName - Name of the S3 bucket
   * @param {String} key - S3 storage key (i.e. the storage "path")
   *
   * @return {Promise} Resolves with S3 Object data
   *
   * For more information see:
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property
   */
  getObject(client, bucketName, key) {
    const params = {
      Bucket: bucketName,
      Key: key
    };

    return client.getObject(params).promise();
  },

  /**
   * Create an Object in an S3 bucket.
   *
   * @param {Object} client - S3 client
   * @param {String} bucketName - Name of the S3 bucket
   * @param {String} key - S3 storage key (i.e. the storage "path")
   * @param {String} mimeType
   * @param {Object} blob
   *
   * @return {Promise} Resolves with S3 Object data
   *
   * For more information see:
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
   */
  putObject(client, bucketName, key, mimeType, blob) {
    const params = {
      Bucket: bucketName,
      Key: key,
      ContentType: mimeType,
      Body: blob,
      ServerSideEncryption: 'AES256'
    };

    return client.putObject(params).promise();
  },

  /**
   * Create a recording item.
   *
   * @param {Object} client - DynamoDB document client
   * @param {String} tableName - Name of the DynamoDB Table
   * @param {String} s3Key - S3 storage key (i.e. the storage "path")
   *
   * @return {Promise} Resolves with DynamoDB Object data
   *
   * For more information see:
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
   */
  createItem(client, tableName, s3Key) {
    // A valid S3 key looks like:
    // "audio/standups/:standupId/DD-MM-YYYY/:userId/:filename.webm"
    const [, , standupId, dateKey, userId, file] = s3Key.split('/');
    const [filename] = file.split('.');

    const recordingId = shortid.generate();
    const now = Date.now();
    const params = {
      TableName: tableName,
      Item: {
        pk: `standup#${standupId}`,
        sk: `update#${dateKey}#user#${userId}#recording#${filename}`,
        recordingId,
        standupId,
        userId,
        filename,
        createdAt: now,
        updatedAt: now,
        status: 'transcoding',
        transcodedFileKey: ''
      }
    };

    return client.put(params).promise();
  },

  /**
   * Update a recording item.
   *
   * @param {Object} client - DynamoDB document client
   * @param {String} tableName - Name of the DynamoDB Table
   * @param {String} s3Key - S3 storage key (i.e. the storage "path")
   *
   * @return {Promise} Resolves with DynamoDB Object data
   *
   * For more information see:
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
   */
  updateItem(client, tableName, s3Key) {
    // A valid S3 key looks like:
    // "audio/standups/:standupId/DD-MM-YYYY/:userId/:filename.mp3"
    const [, , standupId, dateKey, userId, file] = s3Key.split('/');
    const [filename] = file.split('.');

    const params = {
      TableName: tableName,
      Key: {
        pk: `standup#${standupId}`,
        sk: `update#${dateKey}#user#${userId}#recording#${filename}`
      },
      ExpressionAttributeNames: {
        '#ua': 'updatedAt',
        '#s': 'status',
        '#k': 'transcodedFileKey'
      },
      ExpressionAttributeValues: {
        ':ua': Date.now(),
        ':s': 'completed',
        ':k': s3Key
      },
      UpdateExpression: 'set #ua = :ua, #s = :s, #k = :k'
    };

    return client.update(params).promise();
  }
};
