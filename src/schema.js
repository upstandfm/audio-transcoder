'use strict';

const Joi = require('@hapi/joi');

const defaultJoi = Joi.defaults(_schema =>
  _schema.options({
    stripUnknown: true
  })
);

const _metadata = defaultJoi.object().keys({
  userId: Joi.string().required(),

  // The IDs below consists of 7 to 14 URL friendly characters, for more info
  // see: https://github.com/dylang/shortid
  workspaceId: Joi.string()
    .regex(/^[a-zA-Z-0-9_-]{7,14}$/, 'workspaceId')
    .required(),
  standupId: Joi.string()
    .regex(/^[a-zA-Z-0-9_-]{7,14}$/, 'standupId')
    .required(),
  recordingId: Joi.string()
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

function _validate(data, schema) {
  const { error, value } = schema.validate(data);

  // For Joi "error" see:
  // https://github.com/hapijs/joi/blob/master/API.md#validationerror
  if (error) {
    const err = new Error('Invalid request data');
    err.statusCode = 400;
    err.details = error.details.map(e => e.message);
    throw err;
  }

  return value;
}

module.exports = {
  validateMetadata(data = {}) {
    return _validate(data, _metadata);
  }
};
