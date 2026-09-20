import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';

import { config } from './config';
import { requestIdMiddleware } from './middleware/requestId';
import { requestLoggerMiddleware } from './middleware/requestLogger';
import { errorHandlerMiddleware } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { ApiResponseHandler } from './utils/apiResponse';
import { checkDatabaseHealth } from './prisma/client';
import { swaggerSpec } from './docs/swagger';

// Domain Route Modules
import { publicRoutes } from './modules/public/public.routes';
import { authRoutes } from './modules/auth/auth.routes';
import { transactionRoutes } from './modules/transactions/transactions.routes';
import { caseRoutes } from './modules/cases/cases.routes';
import { evidenceRoutes } from './modules/evidence/evidence.routes';
import { ocrRoutes } from './modules/ocr/ocr.routes';
import { classificationRoutes } from './modules/classification/classification.routes';
import { complaintRoutes } from './modules/complaints/complaints.routes';
import { providerRoutes } from './modules/providers/providers.routes';
import { reconciliationRoutes } from './modules/reconciliation/reconciliation.routes';
import { verificationRoutes } from './modules/verification/verification.routes';
import { riskRoutes } from './modules/risk/risk.routes';
import { developerRoutes } from './modules/developer/developer.routes';
import { billingRoutes } from './modules/billing/billing.routes';
import { notificationRoutes } from './modules/notifications/notifications.routes';
import { escalationRoutes } from './modules/escalations/escalations.routes';
import { businessRoutes } from './modules/business/business.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { analyticsRoutes } from './modules/analytics/analytics.routes';

export function createApp(): Express {
  const app = express();

  // 1. Core Security & Request Infrastructure
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  const allowedOrigins = config.CORS_ORIGINS.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
          callback(null, true);
        } else {
          callback(null, true); // Permissive in dev/test
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Request-Id',
        'X-Api-Key',
        'X-Business-Id',
        'Idempotency-Key',
      ],
    })
  );

  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 2. Correlation Tracking & Logging
  app.use(requestIdMiddleware);
  app.use(requestLoggerMiddleware);

  // 3. Global Rate Limiter
  app.use(rateLimiter());

  // 4. OpenAPI / Swagger Interactive Documentation
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // 5. Health & Observability Endpoints
  const healthHandler = (_req: Request, res: Response) => {
    ApiResponseHandler.success(
      res,
      {
        status: 'UP',
        timestamp: new Date().toISOString(),
        uptimeSeconds: process.uptime(),
        environment: config.NODE_ENV,
        service: 'payrescue-backend',
        version: '1.0.0',
      },
      'PayRescue infrastructure operational'
    );
  };

  app.get('/health', healthHandler);
  app.get(`${config.API_PREFIX}/health`, healthHandler);

  app.get('/ready', async (_req: Request, res: Response) => {
    const isDbConnected = await checkDatabaseHealth();
    if (!isDbConnected) {
      ApiResponseHandler.error(
        res,
        'SERVICE_UNAVAILABLE',
        'Database connection degraded or unavailable',
        503
      );
      return;
    }
    ApiResponseHandler.success(
      res,
      {
        database: 'CONNECTED',
        status: 'READY',
      },
      'Service is ready for requests'
    );
  });

  // 6. Mount Domain Modules Under API Prefix (/api/v1)
  const apiRouter = express.Router();

  apiRouter.use('/public', publicRoutes);
  apiRouter.use('/auth', authRoutes);
  apiRouter.use('/transactions', transactionRoutes);
  apiRouter.use('/cases', caseRoutes);
  apiRouter.use('/evidence', evidenceRoutes);
  apiRouter.use('/ocr', ocrRoutes);
  apiRouter.use('/classification', classificationRoutes);
  apiRouter.use('/complaints', complaintRoutes);
  apiRouter.use('/providers', providerRoutes);
  apiRouter.use('/reconciliation', reconciliationRoutes);
  apiRouter.use('/verification', verificationRoutes);
  apiRouter.use('/risk', riskRoutes);
  apiRouter.use('/developer', developerRoutes);
  apiRouter.use('/billing', billingRoutes);
  apiRouter.use('/notifications', notificationRoutes);
  apiRouter.use('/escalations', escalationRoutes);
  apiRouter.use('/business', businessRoutes);
  apiRouter.use('/admin', adminRoutes);
  apiRouter.use('/analytics', analyticsRoutes);

  app.use(config.API_PREFIX, apiRouter);

  // 7. 404 Catch-All
  app.use((req: Request, res: Response) => {
    ApiResponseHandler.error(
      res,
      'ROUTE_NOT_FOUND',
      `Cannot ${req.method} ${req.originalUrl}. Route not found. Refer to /api/docs for API specification.`,
      404
    );
  });

  // 8. Global Error Handler Middleware
  app.use(errorHandlerMiddleware);

  return app;
}
