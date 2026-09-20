import { z } from 'zod';
import { TransactionType, TransactionStatus } from '@prisma/client';

export const createTransactionSchema = z.object({
  publicReference: z.string().min(3, 'Transaction reference/Session ID/RRN is required'),
  amount: z.number().positive('Transaction amount must be greater than zero'),
  currency: z.string().default('NGN'),
  transactionType: z.nativeEnum(TransactionType),
  providerId: z.string().uuid().optional(),
  merchantName: z.string().optional(),
  senderIdentifier: z.string().optional(),
  recipientIdentifier: z.string().optional(),
  channel: z.string().optional(),
  transactionTimestamp: z.string().or(z.date()).transform((val) => new Date(val)),
  claimedStatus: z.nativeEnum(TransactionStatus).optional().default(TransactionStatus.FAILED),
  rawMetadata: z.record(z.any()).optional(),
  source: z.string().optional().default('USER_ENTRY'),
});

export const updateTransactionStatusSchema = z.object({
  newStatus: z.nativeEnum(TransactionStatus),
  reason: z.string().min(5, 'Reason for status update is required'),
  actorType: z.enum(['USER', 'SYSTEM', 'PROVIDER', 'ADMIN']).default('SYSTEM'),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionStatusInput = z.infer<typeof updateTransactionStatusSchema>;
