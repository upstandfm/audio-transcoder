'use strict';

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
   * Get an S3 Object's metadata.
   *
   * @param {Object} client - S3 client
   * @param {String} bucketName - Name of the S3 bucket
   * @param {String} key - S3 storage key (i.e. the storage "path")
   *
   * @return {Promise} Resolves with S3 Object data
   *
   * For more information see:
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#headObject-property
   */
  getMetadata(client, bucketName, key) {
    const params = {
      Bucket: bucketName,
      Key: key
    };

    return client
      .headObject(params)
      .promise()
      .then(res => res.Metadata);
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
   * @param {String} tableName
   * @param {Object} metadata - S3 object user-defined metadata
   *
   * @return {Promise} Resolves with DynamoDB Object data
   *
   * For more information see:
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
   */
  createItem(client, tableName, metadata = {}) {
    const now = new Date().toISOString();
    const params = {
      TableName: tableName,
      Item: {
        pk: `workspace#${metadata.workspaceId}#standup#${metadata.standupId}`,
        sk: `update#${metadata.date}#user#${metadata.userId}#recording#${metadata.recordingId}`,
        id: metadata.recordingId,
        createdBy: metadata.userId,
        createdAt: now,
        updatedAt: now,
        name: metadata.name,
        transcodingStatus: 'transcoding',
        transcodedFileKey: ''
      }
    };

    return client.put(params).promise();
  },

  /**
   * Update a recording item status and key.
   *
   * @param {Object} client - DynamoDB document client
   * @param {String} tableName - Name of the DynamoDB Table
   * @param {String} s3Key - S3 storage key (i.e. the storage "path")
   *
   * @return {Promise} Resolves with DynamoDB Object data
   *
   * For more information see:
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#update-property
   */
  updateItemStatusAndKey(client, tableName, s3Key) {
    // A valid S3 key looks like:
    // "audio/standups/:standupId/DD-MM-YYYY/:userId/:recordingId.mp3"
    const [, , standupId, dateKey, userId, file] = s3Key.split('/');
    const [recordingId] = file.split('.');

    const params = {
      TableName: tableName,
      Key: {
        pk: `standup#${standupId}`,
        sk: `update#${dateKey}#user#${userId}#recording#${recordingId}`
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
