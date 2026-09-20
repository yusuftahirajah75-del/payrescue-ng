import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';

export function idempotency() {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Only check idempotency on mutating operations (POST, PUT, PATCH)
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
      return next();
    }

    const idempotencyKey = req.headers['idempotency-key'] as string | undefined;

    if (!idempotencyKey) {
      return next();
    }

    try {
      const existing = await prisma.idempotencyKey.findUnique({
        where: { key: idempotencyKey },
      });

      if (existing) {
        if (existing.expiresAt > new Date()) {
          // Return cached response directly
          res.setHeader('X-Idempotent-Replay', 'true');
          res.status(existing.responseStatus).json(existing.responseBody);
          return;
        } else {
          // Expired key, remove
          await prisma.idempotencyKey.delete({ where: { key: idempotencyKey } });
        }
      }

      // Intercept res.json to capture response
      const originalJson = res.json.bind(res);
      res.json = (body: any): Response => {
        // Only cache successful or non-server-error responses
        if (res.statusCode < 500) {
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
          prisma.idempotencyKey
            .create({
              data: {
                key: idempotencyKey,
                requestPath: req.originalUrl,
                responseStatus: res.statusCode,
                responseBody: body,
                expiresAt,
              },
            })
            .catch(() => {});
        }
        return originalJson(body);
      };

      next();
    } catch {
      // In case of DB lookup failure on idempotency, proceed without blocking
      next();
    }
  };
}
