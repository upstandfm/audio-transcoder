'use strict';

const processMessages = require('./process-messages');

const invalidSnsEvent = {
  Records: [
    {
      Sns: {
        Message: '{'
      }
    }
  ]
};

const validS3Event = {
  Records: [
    {
      eventVersion: '2.1',
      eventSource: 'aws:s3',
      awsRegion: 'eu-central-1',
      eventTime: '2019-10-16T16:24:56.848Z',
      eventName: 'ObjectCreated:Put',
      userIdentity: {
        principalId: 'AWS:RWAGBMTEIUTYBB:'
      },
      requestParameters: { sourceIPAddress: '12.04.68.100' },
      responseElements: {
        'x-amz-request-id': 'F22EIDJF3',
        'x-amz-id-2': 'frU+sX8P5Lt7BJ4k8/pPRrUZWmz5YYWdkfkgd9K5Afcz0MaTuU='
      },
      s3: {
        s3SchemaVersion: '1.0',
        configurationId: '2dfg4d35-9ffkldlkd9-4fgld-9d37-08cdke363',
        bucket: {
          name: 'upstandfm-recordings',
          ownerIdentity: { principalId: 'ADJEJRQQD6C' },
          arn: 'arn:aws:s3:::upstandfm-recordings'
        },
        object: {
          key: 'audio/2wQ3xS/polkjUI/QyaVFWe.webm',
          size: 32452,
          eTag: '8jfjdkf9wkdlkfe25f15',
          sequencer: 'DA7SDKWKDFOS09'
        }
      }
    }
  ]
};

const validSnsEvent = {
  Records: [
    {
      EventSource: 'aws:sns',
      EventVersion: '1.0',
      EventSubscriptionArn:
        'arn:aws:sns:eu-central-1::new-s3-audio-recording:123qwe',
      Sns: {
        Type: 'Notification',
        MessageId: '1qa2ws',
        TopicArn: 'arn:aws:sns:eu-central-1::new-s3-audio-recording',
        Subject: 'Amazon S3 Notification',
        Message: JSON.stringify(validS3Event),
        Timestamp: '2019-10-16T16:24:56.947Z',
        SignatureVersion: '1',
        Signature:
          'SV1jir4D0pZdcMKPNrgaRj0BDFoUxTKbSDBBBmIRA3TR8xZxqv+dFkZFScw/8sx1IKS8bhVq6LdXnhbZi/3cl1SevU9vA5BnexT/rWux+tQ5M4vYYkaj/xaq5up3ifOrTs0N6UApsiC23BQvg5hISr3KJ9ExOgApIQcss50aNR9k2Sgc1Bqkq+6AuLl4xD7q3oyS10BIHkeyjBMn/Qdfg4wF6/zedtw0jPDw==',
        SigningCertUrl:
          'https://sns.eu-central-1.amazonaws.com/SimpleNotificationService-fjrit6550eofk33-edkgpe-dkwlelkr.pem',
        UnsubscribeUrl:
          'https://sns.eu-central-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:eu-central-1::new-s3-audio-recording:fk3',
        MessageAttributes: {}
      }
    }
  ]
};

describe('processMessages.forEverySnsS3Record(event, cb)', () => {
  it('throws error without event', async () => {
    try {
      await processMessages.forEverySnsS3Record();
    } catch (err) {
      expect(err).toHaveProperty('message', 'Event object is required');
    }
  });

  it('throws error without cb', async () => {
    try {
      await processMessages.forEverySnsS3Record({});
    } catch (err) {
      expect(err).toHaveProperty(
        'message',
        'Async callback function is required'
      );
    }
  });

  it('throws error when cb is not a function', async () => {
    try {
      await processMessages.forEverySnsS3Record({}, {});
    } catch (err) {
      expect(err).toHaveProperty(
        'message',
        'Async callback function is required'
      );
    }
  });

  it('calls cb with err with invalid event', async () => {
    await processMessages.forEverySnsS3Record(invalidSnsEvent, async err => {
      expect(err).toHaveProperty(
        'message',
        'Invalid SNS Message, JSON parse Error'
      );
    });
  });

  it('calls cb with s3 object', async () => {
    await processMessages.forEverySnsS3Record(
      validSnsEvent,
      async (err, s3) => {
        expect(err).toBe(null);
        expect(s3).not.toBe(null);
        expect(s3).toHaveProperty('object.key');
      }
    );
  });
});
