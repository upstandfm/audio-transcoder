'use strict';

const validateS3Key = require('./validate-s3-key');

describe('validateS3Key', () => {
  describe('standupAudioRecording(s3Key)', () => {
    const validType = 'audio';
    const validEntity = 'standups';
    const validEntityId = 'J0W4Z1uE';
    const validDateKey = '12-10-2019';
    const validUserId = 'auth0|5d5582168c110c8f790bh89e';
    const validRecordingId = 'XQyaVFWe';
    const validFileExtension = 'webm';

    const errMsg =
      'Invalid S3 key, format must be "audio/standups/:standupId/DD-MM-YYYY/:userId/:recordingId.webm"';

    it('throws with no key', () => {
      expect(() => {
        validateS3Key.standupAudioRecording();
      }).toThrow(new Error(errMsg));
    });

    it('throws with invalid type', () => {
      expect(() => {
        validateS3Key.standupAudioRecording(
          `image/${validEntity}/${validEntityId}/${validDateKey}/${validUserId}/${validRecordingId}.${validFileExtension}`
        );
      }).toThrow(new Error(errMsg));
    });

    it('throws with invalid entity', () => {
      expect(() => {
        validateS3Key.standupAudioRecording(
          `${validType}/books/${validEntityId}/${validDateKey}/${validUserId}/${validRecordingId}.${validFileExtension}`
        );
      }).toThrow(new Error(errMsg));
    });

    it('throws with invalid entity ID', () => {
      expect(() => {
        validateS3Key.standupAudioRecording(
          `${validType}/${validEntity}//${validDateKey}/${validUserId}/${validRecordingId}.${validFileExtension}`
        );
      }).toThrow(new Error(errMsg));
    });

    it('throws with invalid date key', () => {
      expect(() => {
        validateS3Key.standupAudioRecording(
          `${validType}/${validEntity}/${validEntityId}/111-2222-3/${validUserId}/${validRecordingId}.${validFileExtension}`
        );
      }).toThrow(new Error(errMsg));
    });

    it('throws with invalid user ID', () => {
      expect(() => {
        validateS3Key.standupAudioRecording(
          `${validType}/${validEntity}/${validEntityId}/${validDateKey}//${validRecordingId}.${validFileExtension}`
        );
      }).toThrow(new Error(errMsg));
    });

    it('throws with invalid recording ID', () => {
      expect(() => {
        validateS3Key.standupAudioRecording(
          `${validType}/${validEntity}/${validEntityId}/${validDateKey}/${validUserId}/.${validFileExtension}`
        );
      }).toThrow(new Error(errMsg));
    });

    it('throws with invalid file extension', () => {
      expect(() => {
        validateS3Key.standupAudioRecording(
          `${validType}/${validEntity}/${validEntityId}/${validDateKey}/${validUserId}/${validRecordingId}.mp4`
        );
      }).toThrow(new Error(errMsg));
    });

    it('does not throw for valid key', () => {
      expect(() => {
        validateS3Key.standupAudioRecording(
          `${validType}/${validEntity}/${validEntityId}/${validDateKey}/${validUserId}/${validRecordingId}.${validFileExtension}`
        );
      }).not.toThrow(new Error(errMsg));
    });
  });

  describe('standupTranscodedAudioRecording(s3Key)', () => {
    const validType = 'audio';
    const validEntity = 'standups';
    const validEntityId = 'J0W4Z1uE';
    const validDateKey = '12-10-2019';
    const validUserId = 'auth0|5d5582168c110c8f790bh89e';
    const validRecordingId = 'today';
    const validFileExtension = 'mp3';

    const errMsg =
      'Invalid S3 key, format must be "audio/standups/:standupId/DD-MM-YYYY/:userId/:recordingId.mp3"';

    it('throws with no key', () => {
      expect(() => {
        validateS3Key.standupTranscodedAudioRecording();
      }).toThrow(new Error(errMsg));
    });

    it('throws with invalid type', () => {
      expect(() => {
        validateS3Key.standupTranscodedAudioRecording(
          `image/${validEntity}/${validEntityId}/${validDateKey}/${validUserId}/${validRecordingId}.${validFileExtension}`
        );
      }).toThrow(new Error(errMsg));
    });

    it('throws with invalid entity', () => {
      expect(() => {
        validateS3Key.standupTranscodedAudioRecording(
          `${validType}/books/${validEntityId}/${validDateKey}/${validUserId}/${validRecordingId}.${validFileExtension}`
        );
      }).toThrow(new Error(errMsg));
    });

    it('throws with invalid entity ID', () => {
      expect(() => {
        validateS3Key.standupTranscodedAudioRecording(
          `${validType}/${validEntity}//${validDateKey}/${validUserId}/${validRecordingId}.${validFileExtension}`
        );
      }).toThrow(new Error(errMsg));
    });

    it('throws with invalid date key', () => {
      expect(() => {
        validateS3Key.standupTranscodedAudioRecording(
          `${validType}/${validEntity}/${validEntityId}/111-2222-3/${validUserId}/${validRecordingId}.${validFileExtension}`
        );
      }).toThrow(new Error(errMsg));
    });

    it('throws with invalid user ID', () => {
      expect(() => {
        validateS3Key.standupTranscodedAudioRecording(
          `${validType}/${validEntity}/${validEntityId}/${validDateKey}//${validRecordingId}.${validFileExtension}`
        );
      }).toThrow(new Error(errMsg));
    });

    it('throws with invalid recording ID', () => {
      expect(() => {
        validateS3Key.standupTranscodedAudioRecording(
          `${validType}/${validEntity}/${validEntityId}/${validDateKey}/${validUserId}/.${validFileExtension}`
        );
      }).toThrow(new Error(errMsg));
    });

    it('throws with invalid file extension', () => {
      expect(() => {
        validateS3Key.standupTranscodedAudioRecording(
          `${validType}/${validEntity}/${validEntityId}/${validDateKey}/${validUserId}/${validRecordingId}.mp4`
        );
      }).toThrow(new Error(errMsg));
    });

    it('does not throw for valid key', () => {
      expect(() => {
        validateS3Key.standupTranscodedAudioRecording(
          `${validType}/${validEntity}/${validEntityId}/${validDateKey}/${validUserId}/${validRecordingId}.${validFileExtension}`
        );
      }).not.toThrow(new Error(errMsg));
    });
  });
});
