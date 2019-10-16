'use strict';

module.exports = {
  /**
   * Process every "valid" SNS event record, where the SNS event is triggered
   * by S3.
   *
   * @param {Object} event - SNS message event
   * @param {Function} asyncCb - Async callback function
   *
   * @return {Promise}
   *
   * For more info on SNS message see:
   * https://docs.aws.amazon.com/lambda/latest/dg/with-sns.html
   *
   * The "asyncCb" is called with an "err" object or "s3" object.
   */
  async forEverySnsS3Record(event, asyncCb) {
    if (!event) {
      throw new Error('Event object is required');
    }

    if (!asyncCb || typeof asyncCb !== 'function') {
      throw new Error('Async callback function is required');
    }

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
        console.log('Invalid SNS Message: ', err);
        await asyncCb(new Error('Invalid SNS Message, JSON parse Error'));
        continue;
      }

      // An S3 Event message contains a "Records" list!
      // For more info see:
      // https://docs.aws.amazon.com/AmazonS3/latest/dev/notification-content-structure.html
      const { Records: MsgRecords } = msg;

      if (!MsgRecords || !MsgRecords.length) {
        console.log('No S3 event Records');
        continue;
      }

      for (const MsgRecord of MsgRecords) {
        const { s3 } = MsgRecord;

        if (!s3) {
          console.log('Not an S3 event');
          continue;
        }

        await asyncCb(null, s3);
      }
    }
  }
};
