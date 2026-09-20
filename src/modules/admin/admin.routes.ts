import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(authorize(Role.ADMIN, Role.SUPER_ADMIN));

router.get('/users', AdminController.listUsers);
router.patch('/users/:id/status', AdminController.updateUserStatus);
router.get('/audit-logs', AdminController.listAuditLogs);
router.get('/settings', AdminController.listSettings);
router.put('/settings/:key', AdminController.updateSetting);
router.get('/feature-flags', AdminController.listFeatureFlags);
router.put('/feature-flags/:name', AdminController.updateFeatureFlag);

export const adminRoutes = router;
