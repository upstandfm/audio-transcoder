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
  }
};
