'use strict';

const validateS3Key = require('./validate-s3-key');

describe('validateS3Key', () => {
  describe('webmRecording(s3Key)', () => {
    const validType = 'audio';
    const validWorkspaceId = 'z_1Edx5-p';
    const validStandupId = 'J0W4Z1uE';
    const validRecordingId = 'XQyaVFWe';
    const validFileExtension = 'webm';

    const errMsg =
      'Invalid S3 key, format must be "audio/:workspaceId/:standupId/:recordingId.webm"';

    it('throws with no key', () => {
      expect(() => {
        validateS3Key.webmRecording();
      }).toThrow(new Error(errMsg));
    });

    it('throws with invalid type', () => {
      expect(() => {
        validateS3Key.webmRecording(
          `image/${validWorkspaceId}/${validStandupId}/${validRecordingId}.${validFileExtension}`
        );
      }).toThrow(new Error(errMsg));
    });

    it('throws with invalid workspace ID', () => {
      expect(() => {
        validateS3Key.webmRecording(
          `${validType}/.!*&^@$#/${validStandupId}/${validRecordingId}.${validFileExtension}`
        );
      }).toThrow(new Error(errMsg));
    });

    it('throws with invalid standup ID', () => {
      expect(() => {
        validateS3Key.webmRecording(
          `${validType}/${validWorkspaceId}/%&$#*+(%/${validRecordingId}.${validFileExtension}`
        );
      }).toThrow(new Error(errMsg));
    });

    it('throws with invalid recording ID', () => {
      expect(() => {
        validateS3Key.webmRecording(
          `${validType}/${validWorkspaceId}/${validStandupId}/&#!()=,!.${validFileExtension}`
        );
      }).toThrow(new Error(errMsg));
    });

    it('throws with invalid file extension', () => {
      expect(() => {
        validateS3Key.webmRecording(
          `${validType}/${validWorkspaceId}/${validStandupId}/${validRecordingId}.mp4`
        );
      }).toThrow(new Error(errMsg));
    });

    it('does not throw for valid key', () => {
      expect(() => {
        validateS3Key.webmRecording(
          `${validType}/${validWorkspaceId}/${validStandupId}/${validRecordingId}.${validFileExtension}`
        );
      }).not.toThrow(new Error(errMsg));
    });
  });

  describe('mp3Recording(s3Key)', () => {
    const validType = 'audio';
    const validWorkspaceId = 'z_1Edx5-p';
    const validStandupId = 'J0W4Z1uE';
    const validRecordingId = 'XQyaVFWe';
    const validFileExtension = 'mp3';

    const errMsg =
      'Invalid S3 key, format must be "audio/:workspaceId/:standupId/:recordingId.mp3"';

    it('throws with no key', () => {
      expect(() => {
        validateS3Key.mp3Recording();
      }).toThrow(new Error(errMsg));
    });

    it('throws with invalid type', () => {
      expect(() => {
        validateS3Key.mp3Recording(
          `image/${validWorkspaceId}/${validStandupId}/${validRecordingId}.${validFileExtension}`
        );
      }).toThrow(new Error(errMsg));
    });

    it('throws with invalid workspace ID', () => {
      expect(() => {
        validateS3Key.mp3Recording(
          `${validType}/!@#$%^&*/${validStandupId}/${validRecordingId}.${validFileExtension}`
        );
      }).toThrow(new Error(errMsg));
    });

    it('throws with invalid standup ID', () => {
      expect(() => {
        validateS3Key.mp3Recording(
          `${validType}/${validWorkspaceId}/!@#$,+~*^/${validRecordingId}.${validFileExtension}`
        );
      }).toThrow(new Error(errMsg));
    });

    it('throws with invalid recording ID', () => {
      expect(() => {
        validateS3Key.mp3Recording(
          `${validType}/${validWorkspaceId}/${validStandupId}/@%^$&!*+|!.${validFileExtension}`
        );
      }).toThrow(new Error(errMsg));
    });

    it('throws with invalid file extension', () => {
      expect(() => {
        validateS3Key.mp3Recording(
          `${validType}/${validWorkspaceId}/${validStandupId}/${validRecordingId}.mp4`
        );
      }).toThrow(new Error(errMsg));
    });

    it('does not throw for valid key', () => {
      expect(() => {
        validateS3Key.mp3Recording(
          `${validType}/${validWorkspaceId}/${validStandupId}/${validRecordingId}.${validFileExtension}`
        );
      }).not.toThrow(new Error(errMsg));
    });
  });
});
