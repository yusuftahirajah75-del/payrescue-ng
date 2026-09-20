import { Request, Response } from 'express';
import { BillingService } from './billing.service';
import { PaystackAdapter } from './paystack.adapter';
import { ApiResponseHandler } from '../../utils/apiResponse';
import { BadRequestError, UnauthorizedError } from '../../utils/errors';

export class BillingController {
  static async getPlans(req: Request, res: Response): Promise<void> {
    const plans = await BillingService.listPlans();
    ApiResponseHandler.success(res, plans, 'Plans retrieved.');
  }

  static async subscribe(req: Request, res: Response): Promise<void> {
    const { planCode, callbackUrl } = req.body;
    const checkout = await BillingService.initializeSubscription(
      req.businessId!,
      planCode,
      callbackUrl || 'http://localhost:3000/dashboard/billing'
    );
    ApiResponseHandler.success(res, checkout, 'Checkout initialized.');
  }

  static async getSubscription(req: Request, res: Response): Promise<void> {
    const sub = await BillingService.getBusinessSubscription(req.businessId!);
    ApiResponseHandler.success(res, sub, 'Subscription retrieved.');
  }

  static async handleWebhook(req: Request, res: Response): Promise<void> {
    const signature = req.headers['x-paystack-signature'] as string;
    const rawBody = JSON.stringify(req.body);

    if (process.env.NODE_ENV === 'production' && !PaystackAdapter.verifyWebhookSignature(rawBody, signature)) {
      throw new UnauthorizedError('Invalid Paystack webhook signature');
    }

    const { event, data } = req.body;
    await BillingService.handlePaystackWebhook(event, data);
    res.status(200).send({ status: 'success' });
  }
}
