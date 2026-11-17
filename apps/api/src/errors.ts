export type ErrorCode = 'VALIDATION_ERROR' | 'INVALID_JSON' | 'NOT_FOUND' | 'INTERNAL_ERROR';

/** An error that is safe to show to the client: its message and code go in the response. */
export class AppError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export interface ErrorBody {
  error: { code: ErrorCode; message: string };
}

export function toErrorBody(code: ErrorCode, message: string): ErrorBody {
  return { error: { code, message } };
}
