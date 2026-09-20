import { z } from 'zod';
import { Role } from '@prisma/client';

export const updateBusinessProfileSchema = z.object({
  name: z.string().min(2).optional(),
  registrationNumber: z.string().optional(), // CAC RC Number
  taxIdentificationNo: z.string().optional(), // TIN
  contactPhone: z.string().optional(),
  websiteUrl: z.string().url().optional(),
});

export const addTeamMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum([Role.BUSINESS_ADMIN, Role.BUSINESS_AGENT]).default(Role.BUSINESS_AGENT),
  title: z.string().optional(),
});

export type UpdateBusinessProfileInput = z.infer<typeof updateBusinessProfileSchema>;
export type AddTeamMemberInput = z.infer<typeof addTeamMemberSchema>;
