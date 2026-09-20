import { prisma } from '../../prisma/client';
import { CreateProviderInput, UpdateProviderInput } from './providers.dto';
import { ConflictError, NotFoundError } from '../../utils/errors';
import { ProviderCategory } from '@prisma/client';

export class ProvidersService {
  static async createProvider(input: CreateProviderInput) {
    const existing = await prisma.provider.findUnique({
      where: { code: input.code.toUpperCase().trim() },
    });

    if (existing) {
      throw new ConflictError(`Provider with code ${input.code} already exists.`);
    }

    const provider = await prisma.provider.create({
      data: {
        code: input.code.toUpperCase().trim(),
        name: input.name.trim(),
        category: input.category,
        logoUrl: input.logoUrl,
        website: input.website,
        supportEmail: input.supportEmail,
        supportPhone: input.supportPhone,
        complaintPortalUrl: input.complaintPortalUrl,
        escalationChannels: input.escalationChannels as any,
        slaHours: input.slaHours,
        requiredEvidence: input.requiredEvidence,
        complaintTemplate: input.complaintTemplate,
        isActive: input.isActive,
      },
    });

    return provider;
  }

  static async listProviders(query: { category?: ProviderCategory; isActive?: boolean; search?: string }) {
    const where: any = {};
    if (query.category) {
      where.category = query.category;
    }
    if (typeof query.isActive === 'boolean') {
      where.isActive = query.isActive;
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const providers = await prisma.provider.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        services: {
          where: { isActive: true },
        },
      },
    });

    return providers;
  }

  static async getProviderById(id: string) {
    const provider = await prisma.provider.findUnique({
      where: { id },
      include: { services: true },
    });

    if (!provider) {
      throw new NotFoundError('Provider not found');
    }

    return provider;
  }

  static async updateProvider(id: string, input: UpdateProviderInput) {
    await this.getProviderById(id);

    const updated = await prisma.provider.update({
      where: { id },
      data: {
        ...input,
        code: input.code ? input.code.toUpperCase().trim() : undefined,
        escalationChannels: input.escalationChannels as any,
      },
    });

    return updated;
  }
}
