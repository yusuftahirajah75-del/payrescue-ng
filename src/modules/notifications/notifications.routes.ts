import { Router } from 'express';
import { NotificationsController } from './notifications.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', NotificationsController.list);
router.patch('/:id/read', NotificationsController.markRead);
router.post('/read-all', NotificationsController.markAllRead);

export const notificationRoutes = router;
