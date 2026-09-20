import { Router } from 'express';
import { EscalationController } from './escalations.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Admin or Cron worker trigger
router.post(
  '/trigger-sla-check',
  authorize(Role.ADMIN, Role.SUPER_ADMIN),
  EscalationController.triggerSlaCheck
);

export const escalationRoutes = router;
