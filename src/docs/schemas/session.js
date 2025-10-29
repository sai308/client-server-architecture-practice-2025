/** @type {Docs.JsonSchemaWithId} */
module.exports.sessionSchema = {
  $id: 'Session',
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    ipAddress: { type: 'string', minLength: 7, maxLength: 15 },
    userAgent: { type: 'string' },
    lastSeenAt: { type: 'string', format: 'date-time' },
    createdAt: { type: 'string', format: 'date-time' },
  },
  required: ['id', 'createdAt', 'lastSeenAt'],
  additionalProperties: false,
};
