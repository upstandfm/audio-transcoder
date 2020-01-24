'use strict';

const Joi = require('@hapi/joi');

const defaultJoi = Joi.defaults(_schema =>
  _schema.options({
    stripUnknown: true
  })
);

const _metadata = defaultJoi.object().keys({
  'user-id': Joi.string().required(),

  // The IDs below consist of 7 to 14 URL friendly characters, for more info
  // see: https://github.com/dylang/shortid
  'workspace-id': Joi.string()
    .regex(/^[a-zA-Z-0-9_-]{7,14}$/, 'workspaceId')
    .required(),
  'standup-id': Joi.string()
    .regex(/^[a-zA-Z-0-9_-]{7,14}$/, 'standupId')
    .required(),
  'recording-id': Joi.string()
    .regex(/^[a-zA-Z-0-9_-]{7,14}$/, 'recordingId')
    .required(),

  // A valid date has format "YYYY-MM-DD"
  date: Joi.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date')
    .required(),

  name: Joi.string()
    // Empty string is not allowed by default
    // For more info see:
    // https://hapi.dev/family/joi/?v=16.1.8#string
    .empty('')
    .regex(/[a-zA-Z0-9 ]*/, 'name')
    .max(70)
});

module.exports = {
  validateMetadata(data = {}) {
    const { error: schemaErr, value } = _metadata.validate(data);

    // For Joi "schemaErr" see:
    // https://github.com/hapijs/joi/blob/master/API.md#validationerror
    if (schemaErr) {
      const info = schemaErr.details.map(e => e.message).join(' ');
      throw new Error(`Invalid Metadata: ${info}`);
    }

    return value;
  }
};
