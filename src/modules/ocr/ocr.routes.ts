import { Router } from 'express';
import { OcrController } from './ocr.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);
router.post('/extract/:evidenceId', OcrController.extract);

export const ocrRoutes = router;
