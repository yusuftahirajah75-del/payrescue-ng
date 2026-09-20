import { Router } from 'express';
import { ProvidersController } from './providers.controller';
import { validateRequest } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { Role } from '@prisma/client';
import { createProviderSchema, updateProviderSchema } from './providers.dto';

const router = Router();

// Public listing
router.get('/', ProvidersController.list);
router.get('/:id', ProvidersController.getById);

// Admin-only management
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest({ body: createProviderSchema }),
  ProvidersController.create
);

router.put(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest({ body: updateProviderSchema }),
  ProvidersController.update
);

export const providerRoutes = router;
