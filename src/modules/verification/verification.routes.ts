import { Router } from 'express';
import { VerificationController } from './verification.controller';
import { authenticate } from '../../middleware/auth';
import { tenantIsolation } from '../../middleware/tenant';
import { validateRequest } from '../../middleware/validate';
import { createPaymentRequestSchema, verifyPaymentClaimSchema } from './verification.dto';

const router = Router();

router.use(authenticate);

router.post(
  '/:businessId/requests',
  tenantIsolation(),
  validateRequest({ body: createPaymentRequestSchema }),
  VerificationController.createRequest
);

router.post(
  '/:businessId/verify',
  tenantIsolation(),
  validateRequest({ body: verifyPaymentClaimSchema }),
  VerificationController.verify
);

export const verificationRoutes = router;
