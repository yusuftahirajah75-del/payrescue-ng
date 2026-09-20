import { z } from 'zod';
import { ProviderCategory } from '@prisma/client';

export const createProviderSchema = z.object({
  code: z.string().min(2, 'Provider code is required (e.g. GTBANK, MTN_NG)'),
  name: z.string().min(2, 'Provider name is required'),
  category: z.nativeEnum(ProviderCategory),
  logoUrl: z.string().url().optional(),
  website: z.string().url().optional(),
  supportEmail: z.string().email().optional(),
  supportPhone: z.string().optional(),
  complaintPortalUrl: z.string().url().optional(),
  escalationChannels: z.record(z.any()).optional(),
  slaHours: z.number().int().positive().default(72),
  requiredEvidence: z.array(z.string()).default(['DEBIT_ALERT', 'TRANSACTION_RECEIPT']),
  complaintTemplate: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateProviderSchema = createProviderSchema.partial();

export type CreateProviderInput = z.infer<typeof createProviderSchema>;
export type UpdateProviderInput = z.infer<typeof updateProviderSchema>;
