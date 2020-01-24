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
   * @param {Object} metadata - S3 object user-defined metadata
   *
   * @return {Promise} Resolves with S3 Object data
   *
   * For more information see:
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
   */
  putObject(client, bucketName, key, mimeType, blob, metadata) {
    const params = {
      Bucket: bucketName,
      Key: key,
      ContentType: mimeType,
      Body: blob,
      ServerSideEncryption: 'AES256',
      Metadata: metadata
    };

    return client.putObject(params).promise();
  },

  /**
   * Create a recording item.
   *
   * @param {Object} Options
   *
   * @param {Object} Options.client - DynamoDB document client
   * @param {String} Options.tableName
   * @param {String} Options.userId
   * @param {String} Options.workspaceId
   * @param {String} Options.standupId
   * @param {String} Options.recordingId
   * @param {String} Options.date - Date of format "YYYY-MM-DD"
   * @param {String} Options.name
   *
   * @return {Promise} Resolves with DynamoDB Object data
   *
   * For more information see:
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
   */
  createItem({
    client,
    tableName,
    userId,
    workspaceId,
    standupId,
    recordingId,
    date,
    name
  }) {
    const now = new Date().toISOString();
    const params = {
      TableName: tableName,
      Item: {
        pk: `workspace#${workspaceId}#standup#${standupId}`,
        sk: `update#${date}#user#${userId}#recording#${recordingId}`,
        id: recordingId,
        createdBy: userId,
        createdAt: now,
        updatedAt: now,
        name: name,
        transcodingStatus: 'transcoding',
        transcodedFileKey: ''
      }
    };

    return client.put(params).promise();
  },

  /**
   * Update a recording item.
   *
   * @param {Object} Options
   *
   * @param {Object} Options.client - DynamoDB document client
   * @param {String} Options.tableName
   * @param {String} Options.s3Key - S3 storage key (i.e. the storage "path")
   * @param {String} Options.userId
   * @param {String} Options.workspaceId
   * @param {String} Options.standupId
   * @param {String} Options.recordingId
   * @param {String} Options.date - Date of format "YYYY-MM-DD"
   * @param {String} Options.name
   *
   * @return {Promise} Resolves with DynamoDB Object data
   *
   * For more information see:
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#update-property
   */
  updateItem({
    client,
    tableName,
    s3Key,
    userId,
    workspaceId,
    standupId,
    recordingId,
    date
  }) {
    const params = {
      TableName: tableName,
      Key: {
        pk: `workspace#${workspaceId}#standup#${standupId}`,
        sk: `update#${date}#user#${userId}#recording#${recordingId}`
      },
      ExpressionAttributeNames: {
        '#ua': 'updatedAt',
        '#ts': 'transcodingStatus',
        '#k': 'transcodedFileKey'
      },
      ExpressionAttributeValues: {
        ':ua': new Date().toISOString(),
        ':ts': 'completed',
        ':k': s3Key
      },
      UpdateExpression: 'set #ua = :ua, #ts = :ts, #k = :k'
    };

    return client.update(params).promise();
  }
};
