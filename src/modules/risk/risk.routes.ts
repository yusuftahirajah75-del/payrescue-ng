import { Router } from 'express';
import { RiskController } from './risk.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);
router.post('/evaluate', RiskController.evaluate);

export const riskRoutes = router;
