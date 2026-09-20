import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const requestId = res.locals.requestId;

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    logger.info(
      {
        requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs,
        ip: req.ip,
      },
      `${req.method} ${req.originalUrl} - ${res.statusCode} (${durationMs}ms)`
    );
  });

  next();
}
