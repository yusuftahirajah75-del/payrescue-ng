import { Router } from 'express';
import { ClassificationController } from './classification.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);
router.post('/classify', ClassificationController.classify);

export const classificationRoutes = router;
