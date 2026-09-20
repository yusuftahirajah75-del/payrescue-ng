import { Router } from 'express';
import { BillingController } from './billing.controller';
import { authenticate } from '../../middleware/auth';
import { tenantIsolation } from '../../middleware/tenant';

const router = Router();

// Paystack Webhook (Publicly exposed to Paystack)
router.post('/webhook', BillingController.handleWebhook);

// Public Plans
router.get('/plans', BillingController.getPlans);

// Business Subscription Endpoints (Authenticated)
router.use(authenticate);

router.get('/:businessId/subscription', tenantIsolation(), BillingController.getSubscription);
router.post('/:businessId/subscribe', tenantIsolation(), BillingController.subscribe);

export const billingRoutes = router;
