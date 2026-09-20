import { Prisma, SubscriptionStatus } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { PaystackAdapter } from './paystack.adapter';
import { NotFoundError, BadRequestError } from '../../utils/errors';

export class BillingService {
  static async listPlans() {
    return prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { monthlyPriceNgn: 'asc' },
    });
  }

  static async initializeSubscription(businessId: string, planCode: string, callbackUrl: string) {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });
    if (!business) {
      throw new NotFoundError('Business not found');
    }

    const plan = await prisma.plan.findUnique({
      where: { code: planCode },
    });
    if (!plan) {
      throw new NotFoundError('Selected subscription plan does not exist');
    }

    const amountInKobo = Math.round(Number(plan.monthlyPriceNgn) * 100);

    const checkout = await PaystackAdapter.initializeSubscriptionCheckout({
      email: business.contactEmail,
      amountInKobo,
      planCode: plan.code,
      callbackUrl,
    });

    return checkout;
  }

  static async handlePaystackWebhook(event: string, data: any) {
    if (event === 'charge.success') {
      const { reference, amount, customer, plan } = data;
      const amountNgn = amount / 100;

      // Locate invoice or create payment record
      const invoice = await prisma.invoice.findFirst({
        where: { invoiceNumber: reference },
      });

      if (invoice) {
        await prisma.$transaction([
          prisma.invoice.update({
            where: { id: invoice.id },
            data: { status: 'PAID', amountPaid: new Prisma.Decimal(amountNgn), paidAt: new Date() },
          }),
          prisma.payment.create({
            data: {
              invoiceId: invoice.id,
              paymentReference: reference,
              paystackReference: data.id ? String(data.id) : reference,
              amount: new Prisma.Decimal(amountNgn),
              status: 'SUCCESS',
              channel: data.channel || 'card',
              paidAt: new Date(),
              gatewayResponse: data,
            },
          }),
        ]);
      }
    }

    return { processed: true };
  }

  static async getBusinessSubscription(businessId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: { businessId, status: SubscriptionStatus.ACTIVE },
      include: {
        plan: true,
        invoices: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return subscription;
  }

  static async checkEntitlement(businessId: string, metric: 'CASES_CREATED' | 'RECON_ROWS'): Promise<boolean> {
    const subscription = await prisma.subscription.findFirst({
      where: { businessId, status: SubscriptionStatus.ACTIVE },
      include: { plan: true },
    });

    // Default to free tier limits if no active subscription
    const maxCases = subscription ? subscription.plan.maxCasesPerMonth : 3;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    if (metric === 'CASES_CREATED') {
      const count = await prisma.rescueCase.count({
        where: {
          businessId,
          createdAt: { gte: startOfMonth },
        },
      });
      return count < maxCases;
    }

    return true;
  }
}
