/**
 * @implements {Domain.SessionEntity}
 */
class Session {
  /**
   * @param {Domain.SessionConstructorFields} fields
   */
  constructor(fields) {
    this.id = fields.id;
    this.fp = fields.fp;
    this.userId = fields.userId;
    this.userAgent = fields.userAgent;
    this.ipAddress = fields.ipAddress;
    this.lastSeenAt = fields.lastSeenAt
      ? new Date(fields.lastSeenAt)
      : new Date();
  }

  /**
   * @type {Domain.SessionEntity['updateLastSeen']}
   */
  updateLastSeen() {
    this.lastSeenAt = new Date();

    return this;
  }
}

module.exports = { Session };
