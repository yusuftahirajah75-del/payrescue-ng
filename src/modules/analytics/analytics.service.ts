import { CaseStatus, TransactionStatus } from '@prisma/client';
import { prisma } from '../../prisma/client';

export class AnalyticsService {
  static async getPlatformOverview(businessId?: string) {
    const caseWhere: any = {};
    const txWhere: any = {};

    if (businessId) {
      caseWhere.businessId = businessId;
      txWhere.businessId = businessId;
    }

    const [
      totalTransactions,
      failedTransactions,
      totalCases,
      resolvedCases,
      activeCases,
      escalatedCases,
      recoverySum,
      reconciliationJobs,
    ] = await Promise.all([
      prisma.transaction.count({ where: txWhere }),
      prisma.transaction.count({
        where: { ...txWhere, status: { in: [TransactionStatus.FAILED, TransactionStatus.DISPUTED] } },
      }),
      prisma.rescueCase.count({ where: caseWhere }),
      prisma.rescueCase.count({
        where: { ...caseWhere, status: { in: [CaseStatus.RESOLVED, CaseStatus.PARTIALLY_RESOLVED] } },
      }),
      prisma.rescueCase.count({
        where: {
          ...caseWhere,
          status: {
            in: [
              CaseStatus.OPEN,
              CaseStatus.EVIDENCE_REQUIRED,
              CaseStatus.EVIDENCE_REVIEW,
              CaseStatus.READY_FOR_COMPLAINT,
              CaseStatus.COMPLAINT_PREPARED,
              CaseStatus.SUBMITTED,
              CaseStatus.PROVIDER_REVIEW,
              CaseStatus.PENDING,
            ],
          },
        },
      }),
      prisma.rescueCase.count({
        where: { ...caseWhere, status: CaseStatus.ESCALATED },
      }),
      prisma.rescueCase.aggregate({
        where: {
          ...caseWhere,
          status: { in: [CaseStatus.RESOLVED, CaseStatus.PARTIALLY_RESOLVED] },
        },
        _sum: { claimAmount: true },
      }),
      prisma.reconciliationJob.aggregate({
        where: businessId ? { businessId } : undefined,
        _sum: {
          totalRecords: true,
          matchedCount: true,
          unmatchedCount: true,
          mismatchCount: true,
        },
      }),
    ]);

    const totalReconRecords = reconciliationJobs._sum.totalRecords || 0;
    const totalReconMatched = reconciliationJobs._sum.matchedCount || 0;
    const reconciliationRate =
      totalReconRecords > 0
        ? `${((totalReconMatched / totalReconRecords) * 100).toFixed(1)}%`
        : '0.0%';

    const resolutionRate =
      totalCases > 0 ? `${((resolvedCases / totalCases) * 100).toFixed(1)}%` : '0.0%';

    return {
      transactions: {
        total: totalTransactions,
        failed: failedTransactions,
      },
      cases: {
        total: totalCases,
        active: activeCases,
        resolved: resolvedCases,
        escalated: escalatedCases,
        resolutionRate,
      },
      financialRecovery: {
        totalRecoveredNgn: Number(recoverySum._sum.claimAmount || 0),
        currency: 'NGN',
      },
      reconciliation: {
        totalRecordsProcessed: totalReconRecords,
        matchedRecords: totalReconMatched,
        unmatchedRecords: reconciliationJobs._sum.unmatchedCount || 0,
        mismatchRecords: reconciliationJobs._sum.mismatchCount || 0,
        reconciliationRate,
      },
    };
  }

  static async getProviderPerformance() {
    const providers = await prisma.provider.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { rescueCases: true },
        },
      },
    });

    return providers.map((p) => ({
      providerId: p.id,
      code: p.code,
      name: p.name,
      category: p.category,
      totalDisputesFiled: p._count.rescueCases,
      statutorySlaHours: p.slaHours,
    }));
  }
}
