import { Prisma, TransactionStatus } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { CreatePaymentRequestInput, VerifyPaymentClaimInput } from './verification.dto';
import { NotFoundError, BadRequestError } from '../../utils/errors';

export class VerificationService {
  static async createPaymentRequest(businessId: string, input: CreatePaymentRequestInput) {
    const requestReference = `PR-REQ-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const expiresAt = new Date(Date.now() + input.expiresInMinutes * 60 * 1000);

    const request = await prisma.paymentRequest.create({
      data: {
        businessId,
        requestReference,
        expectedAmount: new Prisma.Decimal(input.expectedAmount),
        currency: input.currency || 'NGN',
        payerIdentifier: input.payerIdentifier,
        description: input.description,
        expiresAt,
      },
    });

    return request;
  }

  static async verifyPayment(businessId: string, input: VerifyPaymentClaimInput) {
    let paymentRequest = null;

    if (input.paymentRequestId) {
      paymentRequest = await prisma.paymentRequest.findFirst({
        where: { id: input.paymentRequestId, businessId },
      });
      if (!paymentRequest) {
        throw new NotFoundError('Payment request record not found for this merchant.');
      }
    }

    const cleanRef = input.claimedReference.trim();

    // Look for actual recorded transaction in database
    const transaction = await prisma.transaction.findFirst({
      where: {
        businessId,
        publicReference: cleanRef,
      },
    });

    let isConfirmed = false;
    let confidenceLevel = 'UNVERIFIED';
    let reason = 'No bank settlement transaction found matching this reference in merchant ledger.';
    let verifiedAmount: Prisma.Decimal | null = null;

    if (transaction) {
      verifiedAmount = transaction.amount;

      if (transaction.status === TransactionStatus.SUCCESS) {
        // Compare with expected amount if available
        const expected = paymentRequest ? Number(paymentRequest.expectedAmount) : input.claimedAmount;

        if (expected && Math.abs(Number(transaction.amount) - expected) < 0.01) {
          isConfirmed = true;
          confidenceLevel = 'HIGH';
          reason = 'Transaction reference and credited amount matched successful ledger record.';
        } else if (expected) {
          confidenceLevel = 'MEDIUM';
          reason = `Transaction reference found, but amount differs: Expected ₦${expected}, Found ₦${transaction.amount}.`;
        } else {
          isConfirmed = true;
          confidenceLevel = 'HIGH';
          reason = 'Transaction reference confirmed successful in settlement ledger.';
        }
      } else {
        confidenceLevel = 'LOW';
        reason = `Transaction found with status ${transaction.status}. Payment has not settled.`;
      }
    }

    // Save Verification Audit Result
    const verificationResult = await prisma.$transaction(async (tx) => {
      const created = await tx.verificationResult.create({
        data: {
          paymentRequestId: paymentRequest?.id,
          transactionId: transaction?.id,
          claimedReference: cleanRef,
          verifiedAmount,
          isConfirmed,
          confidenceLevel,
          reason,
          auditDetails: {
            queriedAt: new Date().toISOString(),
            payerIdentifier: paymentRequest?.payerIdentifier,
          },
        },
      });

      if (isConfirmed && paymentRequest) {
        await tx.paymentRequest.update({
          where: { id: paymentRequest.id },
          data: { isFulfilled: true },
        });
      }

      return created;
    });

    return verificationResult;
  }
}
