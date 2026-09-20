import { z } from 'zod';

export const createApiKeySchema = z.object({
  name: z.string().min(2, 'Key nickname/identifier is required'),
  environment: z.enum(['live', 'test']).default('test'),
  scopes: z.array(z.string()).default(['*']),
  rateLimit: z.number().int().positive().default(100),
});

export const createWebhookSchema = z.object({
  targetUrl: z.string().url('A valid HTTPS target URL is required'),
  subscribedEvents: z.array(z.string()).min(1, 'At least one event must be selected'),
});

export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
export type CreateWebhookInput = z.infer<typeof createWebhookSchema>;
