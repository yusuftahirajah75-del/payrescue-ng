import { Router } from 'express';
import multer from 'multer';
import { EvidenceController } from './evidence.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// File streaming endpoint
router.get('/files/*', EvidenceController.serveFile);

// Authenticated Evidence Endpoints
router.use(authenticate);
router.post('/upload', upload.single('file'), EvidenceController.upload);
router.get('/:id', EvidenceController.getById);

export const evidenceRoutes = router;
