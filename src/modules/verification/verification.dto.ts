import { z } from 'zod';

export const createPaymentRequestSchema = z.object({
  expectedAmount: z.number().positive('Expected amount must be greater than zero'),
  currency: z.string().default('NGN'),
  payerIdentifier: z.string().optional(),
  description: z.string().optional(),
  expiresInMinutes: z.number().int().positive().default(60),
});

export const verifyPaymentClaimSchema = z.object({
  paymentRequestId: z.string().uuid().optional(),
  claimedReference: z.string().min(3, 'Claimed transaction reference or Session ID is required'),
  claimedAmount: z.number().positive().optional(),
});

export type CreatePaymentRequestInput = z.infer<typeof createPaymentRequestSchema>;
export type VerifyPaymentClaimInput = z.infer<typeof verifyPaymentClaimSchema>;
