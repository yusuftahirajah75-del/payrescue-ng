import { z } from 'zod';
import { CaseStatus, CasePriority, DisputeCategory, TransactionType } from '@prisma/client';

export const createRescueCaseSchema = z.object({
  title: z.string().min(5, 'Title is required (e.g. Debited for N10,000 NIP transfer without credit)'),
  description: z.string().min(10, 'Detailed description of what occurred is required'),
  category: z.nativeEnum(DisputeCategory),
  priority: z.nativeEnum(CasePriority).optional().default(CasePriority.MEDIUM),
  claimAmount: z.number().positive('Claim amount must be greater than zero'),
  currency: z.string().default('NGN'),
  expectedResolution: z.enum(['REFUND', 'SERVICE_VALUE', 'REVERSAL', 'STATUS_CONFIRMATION']).default('REVERSAL'),
  providerId: z.string().uuid().optional(),

  // Either existing transaction ID or transaction details to create on the fly:
  transactionId: z.string().uuid().optional(),
  transactionDetails: z
    .object({
      publicReference: z.string().min(3),
      transactionType: z.nativeEnum(TransactionType),
      transactionTimestamp: z.string().or(z.date()).transform((v) => new Date(v)),
      senderIdentifier: z.string().optional(),
      recipientIdentifier: z.string().optional(),
      channel: z.string().optional(),
    })
    .optional(),
});

export const updateCaseStatusSchema = z.object({
  status: z.nativeEnum(CaseStatus),
  summary: z.string().min(5, 'Summary / reason for status transition is required'),
  resolutionNotes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const escalateCaseSchema = z.object({
  reason: z.string().min(10, 'Reason for escalation is required'),
  targetRegulator: z.enum(['CBN', 'NCC', 'NERC', 'FCCPC', 'LEGAL']).default('CBN'),
});

export type CreateRescueCaseInput = z.infer<typeof createRescueCaseSchema>;
export type UpdateCaseStatusInput = z.infer<typeof updateCaseStatusSchema>;
export type EscalateCaseInput = z.infer<typeof escalateCaseSchema>;
