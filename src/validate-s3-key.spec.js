'use strict';

const validateS3Key = require('./validate-s3-key');

describe('validateS3Key', () => {
  describe('standupAudioRecording(s3Key)', () => {
    const validType = 'audio';
    const validEntity = 'standups';
    const validEntityId = 'J0W4Z1uE';
    const validDateKey = '12-10-2019';
    const validUserId = 'auth0|5d5582168c110c8f790bh89e';
    const validFilename = 'today';
    const validFileExtension = 'webm';

    const errMsg =
      'Invalid S3 key, format must be "audio/standups/:standupId/DD-MM-YYYY/:userId/:filename.webm"';

    it('throws with no key', () => {
      try {
        validateS3Key.standupAudioRecording();
      } catch (err) {
        expect(err).toHaveProperty('message', errMsg);
      }
    });

    it('throws with invalid type', () => {
      try {
        validateS3Key.standupAudioRecording(
          `image/${validEntity}/${validEntityId}/${validDateKey}/${validUserId}/${validFilename}.${validFileExtension}`
        );
      } catch (err) {
        expect(err).toHaveProperty('message', errMsg);
      }
    });

    it('throws with invalid entity', () => {
      try {
        validateS3Key.standupAudioRecording(
          `${validType}/books/${validEntityId}/${validDateKey}/${validUserId}/${validFilename}.${validFileExtension}`
        );
      } catch (err) {
        expect(err).toHaveProperty('message', errMsg);
      }
    });

    it('throws with invalid entity ID', () => {
      try {
        validateS3Key.standupAudioRecording(
          `${validType}/${validEntity}//${validDateKey}/${validUserId}/${validFilename}.${validFileExtension}`
        );
      } catch (err) {
        expect(err).toHaveProperty('message', errMsg);
      }
    });

    it('throws with invalid date key', () => {
      try {
        validateS3Key.standupAudioRecording(
          `${validType}/${validEntity}/${validEntityId}/111-2222-3/${validUserId}/${validFilename}.${validFileExtension}`
        );
      } catch (err) {
        expect(err).toHaveProperty('message', errMsg);
      }
    });

    it('throws with invalid user ID', () => {
      try {
        validateS3Key.standupAudioRecording(
          `${validType}/${validEntity}/${validEntityId}/${validDateKey}//${validFilename}.${validFileExtension}`
        );
      } catch (err) {
        expect(err).toHaveProperty('message', errMsg);
      }
    });

    it('throws with invalid filename', () => {
      expect(() => {
        validateS3Key.standupAudioRecording(
          `${validType}/${validEntity}/${validEntityId}/${validDateKey}/${validUserId}/.${validFileExtension}`
        );
      }).toThrow(new Error(errMsg));
    });

    it('throws with invalid file extension', () => {
      try {
        validateS3Key.standupAudioRecording(
          `${validType}/${validEntity}/${validEntityId}/${validDateKey}/${validUserId}/${validFilename}.mp4`
        );
      } catch (err) {
        expect(err).toHaveProperty('message', errMsg);
      }
    });

    it('does not throw for valid key', () => {
      try {
        validateS3Key.standupAudioRecording(
          `${validType}/${validEntity}/${validEntityId}/${validDateKey}/${validUserId}/${validFilename}.${validFileExtension}`
        );
      } catch (err) {
        expect(err).toHaveProperty('message', errMsg);
      }
    });
  });

  describe('standupTranscodedAudioRecording(s3Key)', () => {
    const validType = 'audio';
    const validEntity = 'standups';
    const validEntityId = 'J0W4Z1uE';
    const validDateKey = '12-10-2019';
    const validUserId = 'auth0|5d5582168c110c8f790bh89e';
    const validFilename = 'today';
    const validFileExtension = 'mp3';

    const errMsg =
      'Invalid S3 key, format must be "audio/standups/:standupId/DD-MM-YYYY/:userId/:filename.mp3"';

    it('throws with no key', () => {
      try {
        validateS3Key.standupTranscodedAudioRecording();
      } catch (err) {
        expect(err).toHaveProperty('message', errMsg);
      }
    });

    it('throws with invalid type', () => {
      try {
        validateS3Key.standupTranscodedAudioRecording(
          `image/${validEntity}/${validEntityId}/${validDateKey}/${validUserId}/${validFilename}.${validFileExtension}`
        );
      } catch (err) {
        expect(err).toHaveProperty('message', errMsg);
      }
    });

    it('throws with invalid entity', () => {
      try {
        validateS3Key.standupTranscodedAudioRecording(
          `${validType}/books/${validEntityId}/${validDateKey}/${validUserId}/${validFilename}.${validFileExtension}`
        );
      } catch (err) {
        expect(err).toHaveProperty('message', errMsg);
      }
    });

    it('throws with invalid entity ID', () => {
      try {
        validateS3Key.standupTranscodedAudioRecording(
          `${validType}/${validEntity}//${validDateKey}/${validUserId}/${validFilename}.${validFileExtension}`
        );
      } catch (err) {
        expect(err).toHaveProperty('message', errMsg);
      }
    });

    it('throws with invalid date key', () => {
      try {
        validateS3Key.standupTranscodedAudioRecording(
          `${validType}/${validEntity}/${validEntityId}/111-2222-3/${validUserId}/${validFilename}.${validFileExtension}`
        );
      } catch (err) {
        expect(err).toHaveProperty('message', errMsg);
      }
    });

    it('throws with invalid user ID', () => {
      try {
        validateS3Key.standupTranscodedAudioRecording(
          `${validType}/${validEntity}/${validEntityId}/${validDateKey}//${validFilename}.${validFileExtension}`
        );
      } catch (err) {
        expect(err).toHaveProperty('message', errMsg);
      }
    });

    it('throws with invalid filename', () => {
      expect(() => {
        validateS3Key.standupTranscodedAudioRecording(
          `${validType}/${validEntity}/${validEntityId}/${validDateKey}/${validUserId}/.${validFileExtension}`
        );
      }).toThrow(new Error(errMsg));
    });

    it('throws with invalid file extension', () => {
      try {
        validateS3Key.standupTranscodedAudioRecording(
          `${validType}/${validEntity}/${validEntityId}/${validDateKey}/${validUserId}/${validFilename}.mp4`
        );
      } catch (err) {
        expect(err).toHaveProperty('message', errMsg);
      }
    });

    it('does not throw for valid key', () => {
      try {
        validateS3Key.standupTranscodedAudioRecording(
          `${validType}/${validEntity}/${validEntityId}/${validDateKey}/${validUserId}/${validFilename}.${validFileExtension}`
        );
      } catch (err) {
        expect(err).toHaveProperty('message', errMsg);
      }
    });
  });
});
