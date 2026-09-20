import { prisma } from '../../prisma/client';
import { UpdateBusinessProfileInput, AddTeamMemberInput } from './business.dto';
import { NotFoundError, ConflictError, BadRequestError } from '../../utils/errors';

export class BusinessService {
  static async getBusinessDetails(businessId: string) {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, email: true, firstName: true, lastName: true },
            },
          },
        },
        subscriptions: {
          include: { plan: true },
        },
      },
    });

    if (!business) {
      throw new NotFoundError('Business profile not found');
    }

    return business;
  }

  static async updateBusiness(businessId: string, input: UpdateBusinessProfileInput) {
    return prisma.business.update({
      where: { id: businessId },
      data: input,
    });
  }

  static async listMembers(businessId: string) {
    return prisma.businessMember.findMany({
      where: { businessId },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, status: true },
        },
      },
    });
  }

  static async addMember(businessId: string, input: AddTeamMemberInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() },
    });

    if (!user) {
      throw new NotFoundError(`User with email ${input.email} does not exist. They must register an account first.`);
    }

    const existingMember = await prisma.businessMember.findUnique({
      where: {
        businessId_userId: {
          businessId,
          userId: user.id,
        },
      },
    });

    if (existingMember) {
      throw new ConflictError('User is already a member of this business team');
    }

    return prisma.businessMember.create({
      data: {
        businessId,
        userId: user.id,
        role: input.role,
        title: input.title,
      },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });
  }

  static async removeMember(businessId: string, memberUserId: string) {
    const member = await prisma.businessMember.findUnique({
      where: {
        businessId_userId: {
          businessId,
          userId: memberUserId,
        },
      },
    });

    if (!member) {
      throw new NotFoundError('Team member not found in this business');
    }

    return prisma.businessMember.delete({
      where: { id: member.id },
    });
  }
}
