import { Router } from 'express';
import { TransactionsController } from './transactions.controller';
import { validateRequest } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { Role } from '@prisma/client';
import { createTransactionSchema, updateTransactionStatusSchema } from './transactions.dto';

const router = Router();

router.use(authenticate);

router.post('/', validateRequest({ body: createTransactionSchema }), TransactionsController.create);
router.get('/', TransactionsController.list);
router.get('/:id', TransactionsController.getById);
router.patch(
  '/:id/status',
  authorize(Role.ADMIN, Role.SUPER_ADMIN, Role.SUPPORT_AGENT),
  validateRequest({ body: updateTransactionStatusSchema }),
  TransactionsController.updateStatus
);

export const transactionRoutes = router;
