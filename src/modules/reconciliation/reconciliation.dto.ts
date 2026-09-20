import { z } from 'zod';

export const reconcileManualSchema = z.object({
  claims: z.array(
    z.object({
      claimedReference: z.string().min(3, 'Claimed reference is required'),
      claimedAmount: z.number().positive('Amount must be positive'),
      transactionDate: z.string().optional(),
      senderIdentifier: z.string().optional(),
      customerEmail: z.string().optional(),
    })
  ),
  sourceFileName: z.string().optional().default('MANUAL_API_SUBMISSION'),
});

export type ReconcileManualInput = z.infer<typeof reconcileManualSchema>;
