import { Router } from 'express';
import { CasesController } from './cases.controller';
import { validateRequest } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { Role } from '@prisma/client';
import { createRescueCaseSchema, updateCaseStatusSchema, escalateCaseSchema } from './cases.dto';

const router = Router();

router.use(authenticate);

router.post('/', validateRequest({ body: createRescueCaseSchema }), CasesController.create);
router.get('/', CasesController.list);
router.get('/:id', CasesController.getById);

router.patch(
  '/:id/status',
  authorize(Role.ADMIN, Role.SUPER_ADMIN, Role.SUPPORT_AGENT, Role.BUSINESS_ADMIN, Role.BUSINESS_OWNER),
  validateRequest({ body: updateCaseStatusSchema }),
  CasesController.updateStatus
);

router.post(
  '/:id/escalate',
  validateRequest({ body: escalateCaseSchema }),
  CasesController.escalate
);

export const caseRoutes = router;
