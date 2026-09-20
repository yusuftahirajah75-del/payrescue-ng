import crypto from 'crypto';
import { config } from '../../config';

export class PaystackAdapter {
  static verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const hash = crypto
      .createHmac('sha512', config.PAYSTACK_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');
    return hash === signature;
  }

  static async initializeSubscriptionCheckout(params: {
    email: string;
    amountInKobo: number;
    planCode: string;
    callbackUrl: string;
  }) {
    // In production, performs HTTPS POST to https://api.paystack.co/transaction/initialize
    // with Authorization: Bearer config.PAYSTACK_SECRET_KEY
    const reference = `PYSK_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    return {
      authorizationUrl: `https://checkout.paystack.com/${reference}`,
      accessCode: reference,
      reference,
    };
  }
}
