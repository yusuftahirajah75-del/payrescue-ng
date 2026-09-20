import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { ApiResponseHandler } from '../utils/apiResponse';
import { logger } from '../utils/logger';

export function errorHandlerMiddleware(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = res.locals.requestId || 'req_unknown';

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    ApiResponseHandler.error(res, 'VALIDATION_ERROR', 'Request validation failed', 422, details);
    return;
  }

  // Handle Custom Domain Operational Errors
  if (err instanceof AppError) {
    ApiResponseHandler.error(res, err.code, err.message, err.statusCode, err.details);
    return;
  }

  // Handle Body-Parser / JSON syntax errors
  if (err instanceof SyntaxError && 'body' in err) {
    ApiResponseHandler.error(res, 'INVALID_JSON', 'Malformed JSON payload provided', 400);
    return;
  }

  // Handle Prisma Known Request Errors
  if (err.code && typeof err.code === 'string' && err.code.startsWith('P')) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'field';
      ApiResponseHandler.error(
        res,
        'DUPLICATE_ENTRY',
        `A record with this ${target} already exists.`,
        409
      );
      return;
    }
    if (err.code === 'P2025') {
      ApiResponseHandler.error(res, 'RECORD_NOT_FOUND', 'Requested database record was not found.', 404);
      return;
    }
  }

  // Unexpected Unhandled Internal Error
  logger.error({ err, requestId, path: req.originalUrl, method: req.method }, 'Unhandled internal server error');

  ApiResponseHandler.error(
    res,
    'INTERNAL_SERVER_ERROR',
    process.env.NODE_ENV === 'production'
      ? 'An unexpected internal error occurred. Please contact support.'
      : err.message || 'Internal server error',
    500
  );
}
