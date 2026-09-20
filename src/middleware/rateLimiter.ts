import { Request, Response, NextFunction } from 'express';
import { RateLimitError } from '../utils/errors';
import { config } from '../config';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const ipBuckets = new Map<string, RateLimitRecord>();

// Cleanup stale buckets periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of ipBuckets.entries()) {
    if (now > record.resetTime) {
      ipBuckets.delete(key);
    }
  }
}, 60000);

export function rateLimiter(windowMs: number = config.RATE_LIMIT_WINDOW_MS, maxRequests: number = config.RATE_LIMIT_MAX) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    // In testing environment, bypass rate limits
    if (config.NODE_ENV === 'test') {
      return next();
    }

    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    const record = ipBuckets.get(ip);

    if (!record || now > record.resetTime) {
      ipBuckets.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (record.count >= maxRequests) {
      return next(new RateLimitError(`Rate limit exceeded. Maximum ${maxRequests} requests per window.`));
    }

    record.count++;
    next();
  };
}
