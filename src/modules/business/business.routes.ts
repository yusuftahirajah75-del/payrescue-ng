import { Router } from 'express';
import { BusinessController } from './business.controller';
import { authenticate } from '../../middleware/auth';
import { tenantIsolation } from '../../middleware/tenant';
import { validateRequest } from '../../middleware/validate';
import { updateBusinessProfileSchema, addTeamMemberSchema } from './business.dto';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/:businessId', tenantIsolation(), BusinessController.getDetails);

router.put(
  '/:businessId',
  tenantIsolation([Role.BUSINESS_OWNER, Role.BUSINESS_ADMIN]),
  validateRequest({ body: updateBusinessProfileSchema }),
  BusinessController.update
);

router.get('/:businessId/members', tenantIsolation(), BusinessController.listMembers);

router.post(
  '/:businessId/members',
  tenantIsolation([Role.BUSINESS_OWNER, Role.BUSINESS_ADMIN]),
  validateRequest({ body: addTeamMemberSchema }),
  BusinessController.addMember
);

router.delete(
  '/:businessId/members/:userId',
  tenantIsolation([Role.BUSINESS_OWNER]),
  BusinessController.removeMember
);

export const businessRoutes = router;
