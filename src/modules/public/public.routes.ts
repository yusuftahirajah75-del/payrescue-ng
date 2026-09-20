import { Router } from 'express';
import { z } from 'zod';
import { PublicController } from './public.controller';
import { validateRequest } from '../../middleware/validate';

const router = Router();

const contactSchema = {
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Valid email is required'),
    subject: z.string().min(3, 'Subject is required'),
    message: z.string().min(10, 'Message must be at least 10 characters'),
  }),
};

router.get('/platform', PublicController.getPlatform);
router.get('/features', PublicController.getFeatures);
router.get('/pricing', PublicController.getPricing);
router.get('/faq', PublicController.getFaq);
router.get('/providers', PublicController.getProviders);
router.get('/status', PublicController.getStatus);
router.post('/contact', validateRequest(contactSchema), PublicController.contactSupport);

export const publicRoutes = router;
