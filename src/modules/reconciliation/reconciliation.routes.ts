import { Router } from 'express';
import multer from 'multer';
import { ReconciliationController } from './reconciliation.controller';
import { authenticate } from '../../middleware/auth';
import { tenantIsolation } from '../../middleware/tenant';
import { validateRequest } from '../../middleware/validate';
import { reconcileManualSchema } from './reconciliation.dto';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
});

router.use(authenticate);

// Protected per-business reconciliation endpoints
router.post(
  '/:businessId/csv',
  tenantIsolation(),
  upload.single('file'),
  ReconciliationController.reconcileCsv
);

router.post(
  '/:businessId/manual',
  tenantIsolation(),
  validateRequest({ body: reconcileManualSchema }),
  ReconciliationController.reconcileManual
);

router.get(
  '/:businessId/jobs/:jobId',
  tenantIsolation(),
  ReconciliationController.getJob
);

export const reconciliationRoutes = router;
