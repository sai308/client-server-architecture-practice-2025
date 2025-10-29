export interface FastifyHttpError extends Error {
  code?: string;
  statusCode?: number;
  cause?: Error;
}

export declare class HttpException extends Error implements FastifyHttpError {
  constructor(statusCode: number, message?: string, cause?: Error);
  code: 'HTTP_EXCEPTION';
  statusCode: number;
  cause?: Error;
}

export declare function httpError(
  statusCode: number,
  message?: string,
  cause?: Error
): FastifyHttpError;
