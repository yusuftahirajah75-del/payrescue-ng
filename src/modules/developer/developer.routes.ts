import { Router } from 'express';
import { DeveloperController } from './developer.controller';
import { authenticate } from '../../middleware/auth';
import { tenantIsolation } from '../../middleware/tenant';
import { validateRequest } from '../../middleware/validate';
import { createApiKeySchema, createWebhookSchema } from './developer.dto';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// API Keys Management
router.post(
  '/:businessId/keys',
  tenantIsolation([Role.BUSINESS_OWNER, Role.BUSINESS_ADMIN]),
  validateRequest({ body: createApiKeySchema }),
  DeveloperController.createKey
);

router.get(
  '/:businessId/keys',
  tenantIsolation(),
  DeveloperController.listKeys
);

router.delete(
  '/:businessId/keys/:id',
  tenantIsolation([Role.BUSINESS_OWNER, Role.BUSINESS_ADMIN]),
  DeveloperController.revokeKey
);

// Webhooks Management
router.post(
  '/:businessId/webhooks',
  tenantIsolation([Role.BUSINESS_OWNER, Role.BUSINESS_ADMIN]),
  validateRequest({ body: createWebhookSchema }),
  DeveloperController.createWebhook
);

router.get(
  '/:businessId/webhooks',
  tenantIsolation(),
  DeveloperController.listWebhooks
);

router.post(
  '/:businessId/webhooks/:id/test',
  tenantIsolation([Role.BUSINESS_OWNER, Role.BUSINESS_ADMIN]),
  DeveloperController.testWebhook
);

// Audit Logs
router.get(
  '/:businessId/logs',
  tenantIsolation(),
  DeveloperController.getLogs
);

export const developerRoutes = router;
