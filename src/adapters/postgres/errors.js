/**
 * Walks error.cause chain to find a PG driver error with a SQLSTATE code.
 * Works for drizzle + postgres.js or node-postgres (pg).
 */
function findPgError(err) {
  let e = err;
  while (e) {
    if (e.code && typeof e.code === 'string' && e.code.length === 5) return e;
    e = e.cause;
  }
  return null;
}

const PG = {
  UNIQUE: '23505',
  FK: '23503',
  NOT_NULL: '23502',
  CHECK: '23514',
  BAD_TEXT: '22P02',
  STRING_TRUNC: '22001',
  SERIALIZATION: '40001',
  DEADLOCK: '40P01',
};

function pgErrorToHttp(pgErr) {
  switch (pgErr?.code) {
    case PG.UNIQUE:
      return { status: 409, code: 'unique_violation' };
    case PG.FK:
      return { status: 409, code: 'foreign_key_violation' };
    case PG.NOT_NULL:
    case PG.CHECK:
    case PG.BAD_TEXT:
    case PG.STRING_TRUNC:
      return { status: 422, code: 'invalid_input' };
    case PG.SERIALIZATION:
    case PG.DEADLOCK:
      return {
        status: 503,
        code: 'transient_db_error',
      };
    default:
      return { status: 500, code: 'db_error' };
  }
}

module.exports = { findPgError, pgErrorToHttp, PG };
