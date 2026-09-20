import { Prisma, CaseStatus, Role } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { CreateRescueCaseInput, UpdateCaseStatusInput, EscalateCaseInput } from './cases.dto';
import { CryptoUtils } from '../../utils/crypto';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { TransactionsService } from '../transactions/transactions.service';

export class CasesService {
  static async createCase(
    input: CreateRescueCaseInput,
    user: { id: string; role: Role; firstName: string; lastName: string },
    businessId?: string
  ) {
    let transactionId = input.transactionId;

    // If transaction details provided instead of existing ID, create transaction first
    if (!transactionId && input.transactionDetails) {
      const txRecord = await TransactionsService.createTransaction(
        {
          publicReference: input.transactionDetails.publicReference,
          amount: input.claimAmount,
          currency: input.currency,
          transactionType: input.transactionDetails.transactionType,
          providerId: input.providerId,
          senderIdentifier: input.transactionDetails.senderIdentifier,
          recipientIdentifier: input.transactionDetails.recipientIdentifier,
          channel: input.transactionDetails.channel,
          transactionTimestamp: input.transactionDetails.transactionTimestamp,
          claimedStatus: 'FAILED',
          source: 'RESCUE_CASE_CREATION',
        },
        { userId: user.id, businessId }
      );
      transactionId = txRecord.id;
    }

    if (!transactionId) {
      throw new BadRequestError('Either transactionId or transactionDetails must be provided.');
    }

    // Calculate SLA deadline based on provider
    let slaDeadline: Date | null = null;
    let providerName = 'Unknown Provider';

    if (input.providerId) {
      const provider = await prisma.provider.findUnique({
        where: { id: input.providerId },
      });
      if (provider) {
        providerName = provider.name;
        slaDeadline = new Date(Date.now() + provider.slaHours * 60 * 60 * 1000);
      }
    }

    const caseNumber = CryptoUtils.generateCaseNumber();

    const rescueCase = await prisma.$transaction(async (prismaTx) => {
      const created = await prismaTx.rescueCase.create({
        data: {
          caseNumber,
          title: input.title.trim(),
          description: input.description.trim(),
          userId: user.id,
          businessId,
          transactionId,
          providerId: input.providerId,
          category: input.category,
          status: CaseStatus.OPEN,
          priority: input.priority || 'MEDIUM',
          claimAmount: new Prisma.Decimal(input.claimAmount),
          currency: input.currency || 'NGN',
          expectedResolution: input.expectedResolution,
          slaDeadline,
        },
        include: {
          transaction: true,
          provider: true,
        },
      });

      // Initial Case Event
      await prismaTx.caseEvent.create({
        data: {
          caseId: created.id,
          actorId: user.id,
          actorRole: user.role,
          fromStatus: null,
          toStatus: CaseStatus.OPEN,
          summary: 'Rescue case opened by user',
          metadata: { providerName, initialClaim: input.claimAmount },
        },
      });

      // Initial Timeline Record
      await prismaTx.caseTimelineRecord.create({
        data: {
          caseId: created.id,
          eventType: 'CASE_CREATED',
          title: 'Rescue Case Created',
          description: `Dispute filed regarding ${providerName} transaction for ${input.currency} ${input.claimAmount}.`,
          actorName: `${user.firstName} ${user.lastName}`,
        },
      });

      return created;
    });

    return rescueCase;
  }

  static async getCaseById(id: string, user: { id: string; role: Role }, businessId?: string) {
    const where: Prisma.RescueCaseWhereInput = { id };

    // Strict access control: regular users can only view their own cases
    if (user.role === Role.USER) {
      where.userId = user.id;
    } else if (businessId && user.role !== Role.SUPER_ADMIN && user.role !== Role.ADMIN) {
      where.businessId = businessId;
    }

    const rescueCase = await prisma.rescueCase.findFirst({
      where,
      include: {
        transaction: {
          include: { events: true },
        },
        provider: true,
        evidence: {
          orderBy: { createdAt: 'desc' },
          include: { ocrExtractions: true },
        },
        timelineRecords: {
          orderBy: { createdAt: 'asc' },
        },
        caseEvents: {
          orderBy: { createdAt: 'desc' },
        },
        complaints: {
          include: { submissions: true },
        },
        riskSignals: true,
      },
    });

    if (!rescueCase) {
      throw new NotFoundError('Rescue case not found or access denied.');
    }

    return rescueCase;
  }

  static async listCases(
    query: {
      page?: number;
      limit?: number;
      status?: CaseStatus;
      category?: string;
      search?: string;
    },
    user: { id: string; role: Role },
    businessId?: string
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.RescueCaseWhereInput = {};

    if (user.role === Role.USER) {
      where.userId = user.id;
    } else if (businessId && user.role !== Role.SUPER_ADMIN && user.role !== Role.ADMIN) {
      where.businessId = businessId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.category) {
      where.category = query.category as any;
    }

    if (query.search) {
      where.OR = [
        { caseNumber: { contains: query.search, mode: 'insensitive' } },
        { title: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, cases] = await Promise.all([
      prisma.rescueCase.count({ where }),
      prisma.rescueCase.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          provider: { select: { id: true, name: true, category: true } },
          transaction: { select: { publicReference: true, amount: true, currency: true } },
        },
      }),
    ]);

    return {
      items: cases,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async updateCaseStatus(
    id: string,
    input: UpdateCaseStatusInput,
    actor: { id: string; role: Role; firstName: string; lastName: string }
  ) {
    const rescueCase = await prisma.rescueCase.findUnique({ where: { id } });
    if (!rescueCase) {
      throw new NotFoundError('Rescue case not found');
    }

    const fromStatus = rescueCase.status;
    const toStatus = input.status;

    const updated = await prisma.$transaction(async (prismaTx) => {
      const dataToUpdate: Prisma.RescueCaseUpdateInput = {
        status: toStatus,
        resolutionNotes: input.resolutionNotes || rescueCase.resolutionNotes,
      };

      if (toStatus === CaseStatus.RESOLVED || toStatus === CaseStatus.PARTIALLY_RESOLVED) {
        dataToUpdate.resolvedAt = new Date();
      }
      if (toStatus === CaseStatus.CLOSED) {
        dataToUpdate.closedAt = new Date();
      }

      const caseResult = await prismaTx.rescueCase.update({
        where: { id },
        data: dataToUpdate,
      });

      // Immutable Case Event
      await prismaTx.caseEvent.create({
        data: {
          caseId: id,
          actorId: actor.id,
          actorRole: actor.role,
          fromStatus,
          toStatus,
          summary: input.summary,
          metadata: input.metadata as any,
        },
      });

      // Public Timeline Record
      await prismaTx.caseTimelineRecord.create({
        data: {
          caseId: id,
          eventType: `STATUS_${toStatus}`,
          title: `Case Status: ${toStatus.replace(/_/g, ' ')}`,
          description: input.summary,
          actorName: `${actor.firstName} ${actor.lastName} (${actor.role})`,
        },
      });

      return caseResult;
    });

    return updated;
  }

  static async escalateCase(
    id: string,
    input: EscalateCaseInput,
    actor: { id: string; role: Role; firstName: string; lastName: string }
  ) {
    const rescueCase = await prisma.rescueCase.findUnique({
      where: { id },
      include: { provider: true },
    });

    if (!rescueCase) {
      throw new NotFoundError('Rescue case not found');
    }

    const nextLevel = Math.min(2, rescueCase.escalationLevel + 1);

    const escalated = await prisma.$transaction(async (prismaTx) => {
      const updated = await prismaTx.rescueCase.update({
        where: { id },
        data: {
          status: CaseStatus.ESCALATED,
          escalationLevel: nextLevel,
        },
      });

      const summary = `Case escalated to Level ${nextLevel} (${input.targetRegulator}) due to: ${input.reason}`;

      await prismaTx.caseEvent.create({
        data: {
          caseId: id,
          actorId: actor.id,
          actorRole: actor.role,
          fromStatus: rescueCase.status,
          toStatus: CaseStatus.ESCALATED,
          summary,
          metadata: { targetRegulator: input.targetRegulator, reason: input.reason },
        },
      });

      await prismaTx.caseTimelineRecord.create({
        data: {
          caseId: id,
          eventType: 'ESCALATION',
          title: `Escalated to Level ${nextLevel} (${input.targetRegulator})`,
          description: input.reason,
          actorName: `${actor.firstName} ${actor.lastName}`,
        },
      });

      return updated;
    });

    return escalated;
  }
}
