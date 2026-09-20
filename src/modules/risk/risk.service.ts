import { Prisma, RiskAction } from '@prisma/client';
import { prisma } from '../../prisma/client';

export interface EvaluateRiskInput {
  caseId?: string;
  transactionReference: string;
  claimedAmount: number;
  claimedTimestamp?: Date;
  userId?: string;
}

export interface RiskEvaluationResult {
  recommendedAction: RiskAction;
  overallScore: number; // 0 - 100 (higher means higher risk)
  signals: Array<{
    ruleCode: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    reason: string;
    action: RiskAction;
  }>;
}

export class RiskService {
  static async evaluateTransactionRisk(input: EvaluateRiskInput): Promise<RiskEvaluationResult> {
    const signals: RiskEvaluationResult['signals'] = [];
    let riskScore = 0;

    const cleanRef = input.transactionReference.trim();

    // Signal 1: Duplicate references across different users
    const duplicateCases = await prisma.rescueCase.findMany({
      where: {
        transaction: { publicReference: cleanRef },
        userId: input.userId ? { not: input.userId } : undefined,
      },
      include: { user: true },
    });

    if (duplicateCases.length > 0) {
      signals.push({
        ruleCode: 'CROSS_USER_DUPLICATE_REFERENCE',
        severity: 'HIGH',
        reason: `Reference ${cleanRef} is already active in ${duplicateCases.length} other user dispute case(s).`,
        action: RiskAction.REVIEW,
      });
      riskScore += 45;
    }

    // Signal 2: Amount discrepancy check against existing recorded transaction
    const existingTx = await prisma.transaction.findFirst({
      where: { publicReference: cleanRef },
    });

    if (existingTx) {
      const diff = Math.abs(Number(existingTx.amount) - input.claimedAmount);
      if (diff > 50) {
        signals.push({
          ruleCode: 'AMOUNT_DISCREPANCY_DETECTED',
          severity: 'MEDIUM',
          reason: `Claimed amount (₦${input.claimedAmount}) deviates from recorded bank ledger amount (₦${existingTx.amount}) by ₦${diff.toFixed(2)}.`,
          action: RiskAction.VERIFY,
        });
        riskScore += 25;
      }
    }

    // Signal 3: Timestamp Inconsistency
    if (input.claimedTimestamp) {
      const now = new Date();
      if (input.claimedTimestamp > now) {
        signals.push({
          ruleCode: 'FUTURE_TIMESTAMP_DETECTED',
          severity: 'CRITICAL',
          reason: 'Claim timestamp is in the future. Inconsistent client device clock or fabricated receipt metadata.',
          action: RiskAction.BLOCK,
        });
        riskScore += 60;
      }
    }

    // Signal 4: Rapid successive cases filed by the same user within last 24h
    if (input.userId) {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentCasesCount = await prisma.rescueCase.count({
        where: {
          userId: input.userId,
          createdAt: { gte: twentyFourHoursAgo },
        },
      });

      if (recentCasesCount >= 5) {
        signals.push({
          ruleCode: 'HIGH_VELOCITY_DISPUTE_FILING',
          severity: 'MEDIUM',
          reason: `User has filed ${recentCasesCount} dispute cases within the last 24 hours.`,
          action: RiskAction.REVIEW,
        });
        riskScore += 20;
      }
    }

    // Determine Action
    let recommendedAction: RiskAction = RiskAction.ALLOW;
    if (riskScore >= 60 || signals.some((s) => s.severity === 'CRITICAL')) {
      recommendedAction = RiskAction.BLOCK;
    } else if (riskScore >= 35 || signals.some((s) => s.severity === 'HIGH')) {
      recommendedAction = RiskAction.REVIEW;
    } else if (riskScore > 15) {
      recommendedAction = RiskAction.VERIFY;
    }

    // Persist Risk Signals if attached to a case
    if (input.caseId && signals.length > 0) {
      for (const sig of signals) {
        await prisma.riskSignal.create({
          data: {
            caseId: input.caseId,
            transactionRef: cleanRef,
            ruleCode: sig.ruleCode,
            severity: sig.severity,
            recommendedAction: sig.action,
            confidenceScore: new Prisma.Decimal(Math.min(99, riskScore + 30)),
            reasonDetails: sig.reason,
          },
        }).catch(() => {});
      }
    }

    return {
      recommendedAction,
      overallScore: Math.min(100, riskScore),
      signals,
    };
  }
}
