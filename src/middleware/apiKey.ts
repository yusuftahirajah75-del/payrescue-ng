import { Request, Response, NextFunction } from 'express';
import { CryptoUtils } from '../utils/crypto';
import { UnauthorizedError, ForbiddenError, RateLimitError } from '../utils/errors';
import { prisma } from '../prisma/client';

export interface ApiKeyContext {
  id: string;
  businessId: string;
  name: string;
  environment: string;
  scopes: string[];
  rateLimit: number;
}

declare global {
  namespace Express {
    interface Request {
      apiKey?: ApiKeyContext;
    }
  }
}

// In-memory sliding-window counter for API key rate limiting
const keyRequestCounters = new Map<string, { count: number; resetAt: number }>();

export function requireApiKey(requiredScope?: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let rawKey: string | undefined;

      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer pr_')) {
        rawKey = authHeader.split(' ')[1];
      } else if (typeof req.headers['x-api-key'] === 'string') {
        rawKey = req.headers['x-api-key'];
      }

      if (!rawKey) {
        throw new UnauthorizedError('Missing developer API key (use X-Api-Key or Authorization: Bearer pr_...)');
      }

      const hashedKey = CryptoUtils.sha256(rawKey);

      const apiKey = await prisma.apiKey.findUnique({
        where: { hashedKey },
        include: { business: true },
      });

      if (!apiKey || !apiKey.isActive) {
        throw new UnauthorizedError('Invalid or deactivated API key');
      }

      if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
        throw new UnauthorizedError('API key has expired');
      }

      // Check Scopes if required
      if (requiredScope && !apiKey.scopes.includes('*') && !apiKey.scopes.includes(requiredScope)) {
        throw new ForbiddenError(`API key lacks required scope: ${requiredScope}`);
      }

      // Rate limit check
      const now = Date.now();
      const currentWindow = keyRequestCounters.get(apiKey.id);
      if (!currentWindow || now > currentWindow.resetAt) {
        keyRequestCounters.set(apiKey.id, { count: 1, resetAt: now + 60000 });
      } else {
        if (currentWindow.count >= apiKey.rateLimit) {
          throw new RateLimitError(`API rate limit exceeded. Max ${apiKey.rateLimit} requests per minute.`);
        }
        currentWindow.count++;
      }

      // Record API Key context
      req.apiKey = {
        id: apiKey.id,
        businessId: apiKey.businessId,
        name: apiKey.name,
        environment: apiKey.environment,
        scopes: apiKey.scopes,
        rateLimit: apiKey.rateLimit,
      };
      req.businessId = apiKey.businessId;

      // Update lastUsedAt asynchronously
      prisma.apiKey
        .update({
          where: { id: apiKey.id },
          data: { lastUsedAt: new Date() },
        })
        .catch(() => {});

      // Record API Audit Log on response finish
      const start = Date.now();
      res.on('finish', () => {
        const durationMs = Date.now() - start;
        prisma.apiAuditLog
          .create({
            data: {
              apiKeyId: apiKey.id,
              method: req.method,
              path: req.originalUrl,
              ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
              statusCode: res.statusCode,
              durationMs,
              requestId: res.locals.requestId || 'unknown',
            },
          })
          .catch(() => {});
      });

      next();
    } catch (error) {
      next(error);
    }
  };
}
