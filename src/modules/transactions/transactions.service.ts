import { Prisma } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { CreateTransactionInput, UpdateTransactionStatusInput } from './transactions.dto';
import { CryptoUtils } from '../../utils/crypto';
import { NotFoundError } from '../../utils/errors';

export class TransactionsService {
  static async createTransaction(
    input: CreateTransactionInput,
    context?: { userId?: string; businessId?: string; customerId?: string }
  ) {
    const internalReference = CryptoUtils.generateInternalReference();

    const transaction = await prisma.$transaction(async (tx) => {
      const created = await tx.transaction.create({
        data: {
          internalReference,
          publicReference: input.publicReference.trim(),
          amount: new Prisma.Decimal(input.amount),
          currency: input.currency || 'NGN',
          transactionType: input.transactionType,
          providerId: input.providerId,
          merchantName: input.merchantName,
          senderIdentifier: input.senderIdentifier,
          recipientIdentifier: input.recipientIdentifier,
          channel: input.channel,
          status: input.claimedStatus || 'PENDING',
          claimedStatus: input.claimedStatus || 'PENDING',
          transactionTimestamp: input.transactionTimestamp,
          rawMetadata: input.rawMetadata as any,
          source: input.source || 'USER_ENTRY',
          userId: context?.userId,
          businessId: context?.businessId,
          customerId: context?.customerId,
        },
      });

      // Immutable Event Log
      await tx.transactionEvent.create({
        data: {
          transactionId: created.id,
          actorType: context?.userId ? 'USER' : 'SYSTEM',
          actorId: context?.userId || 'SYSTEM',
          previousStatus: null,
          newStatus: created.status,
          reason: 'Initial transaction record captured',
          payload: { source: input.source },
        },
      });

      return created;
    });

    return transaction;
  }

  static async getTransactionById(id: string, context?: { userId?: string; businessId?: string }) {
    const where: Prisma.TransactionWhereInput = { id };
    if (context?.businessId) {
      where.businessId = context.businessId;
    } else if (context?.userId) {
      where.userId = context.userId;
    }

    const transaction = await prisma.transaction.findFirst({
      where,
      include: {
        provider: true,
        events: {
          orderBy: { createdAt: 'desc' },
        },
        rescueCases: {
          select: {
            id: true,
            caseNumber: true,
            status: true,
            category: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundError('Transaction not found or access denied.');
    }

    return transaction;
  }

  static async listTransactions(
    query: {
      page?: number;
      limit?: number;
      status?: string;
      providerId?: string;
      reference?: string;
      search?: string;
    },
    context?: { userId?: string; businessId?: string }
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = {};

    if (context?.businessId) {
      where.businessId = context.businessId;
    } else if (context?.userId) {
      where.userId = context.userId;
    }

    if (query.status) {
      where.status = query.status as any;
    }

    if (query.providerId) {
      where.providerId = query.providerId;
    }

    if (query.reference) {
      where.OR = [
        { publicReference: { contains: query.reference, mode: 'insensitive' } },
        { internalReference: { contains: query.reference, mode: 'insensitive' } },
      ];
    }

    const [total, transactions] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { transactionTimestamp: 'desc' },
        include: {
          provider: {
            select: { id: true, name: true, category: true, code: true },
          },
        },
      }),
    ]);

    return {
      items: transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async updateTransactionStatus(
    id: string,
    input: UpdateTransactionStatusInput,
    actorId?: string
  ) {
    const tx = await prisma.transaction.findUnique({ where: { id } });
    if (!tx) {
      throw new NotFoundError('Transaction not found');
    }

    const previousStatus = tx.status;

    const updated = await prisma.$transaction(async (prismaTx) => {
      const result = await prismaTx.transaction.update({
        where: { id },
        data: {
          status: input.newStatus,
          verifiedStatus: input.newStatus,
        },
      });

      await prismaTx.transactionEvent.create({
        data: {
          transactionId: id,
          actorType: input.actorType,
          actorId: actorId || null,
          previousStatus,
          newStatus: input.newStatus,
          reason: input.reason,
        },
      });

      return result;
    });

    return updated;
  }
}
