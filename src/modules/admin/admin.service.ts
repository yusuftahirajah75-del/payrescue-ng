import { prisma } from '../../prisma/client';
import { AccountStatus } from '@prisma/client';
import { NotFoundError } from '../../utils/errors';

export class AdminService {
  static async listUsers(query: { page?: number; limit?: number; role?: string; search?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.role) {
      where.role = query.role;
    }
    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          status: true,
          emailVerified: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      items: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async updateUserStatus(userId: string, status: AccountStatus, adminId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updated = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { status },
      }),
      prisma.auditLog.create({
        data: {
          userId: adminId,
          action: 'USER_STATUS_CHANGE',
          entityType: 'User',
          entityId: userId,
          changes: { from: user.status, to: status },
        },
      }),
    ]);

    return updated[0];
  }

  static async listAuditLogs(limit: number = 50) {
    return prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, role: true } },
      },
    });
  }

  static async listSettings() {
    return prisma.systemSetting.findMany({
      orderBy: { key: 'asc' },
    });
  }

  static async updateSetting(key: string, value: string) {
    return prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  static async listFeatureFlags() {
    return prisma.featureFlag.findMany({
      orderBy: { name: 'asc' },
    });
  }

  static async updateFeatureFlag(name: string, isEnabled: boolean) {
    return prisma.featureFlag.upsert({
      where: { name },
      update: { isEnabled },
      create: { name, isEnabled },
    });
  }
}
