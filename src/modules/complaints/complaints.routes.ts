import { Router } from 'express';
import { ComplaintsController } from './complaints.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/generate/:caseId', ComplaintsController.generate);
router.post('/submit/:complaintId', ComplaintsController.recordSubmission);

export const complaintRoutes = router;
