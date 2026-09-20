import { CaseStatus } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { logger } from '../../utils/logger';
import { NotificationsService } from '../notifications/notifications.service';

export class EscalationEngine {
  /**
   * Scans open cases approaching or exceeding SLA deadline
   */
  static async processSlaExpirations() {
    const now = new Date();

    const expiredCases = await prisma.rescueCase.findMany({
      where: {
        status: { in: [CaseStatus.SUBMITTED, CaseStatus.PROVIDER_REVIEW, CaseStatus.PENDING] },
        slaDeadline: { lte: now },
      },
      include: { user: true, provider: true },
    });

    logger.info({ count: expiredCases.length }, 'Processing SLA expired cases');

    for (const c of expiredCases) {
      // 1. Advance escalation level
      const newEscalationLevel = Math.min(2, c.escalationLevel + 1);

      await prisma.$transaction(async (tx) => {
        await tx.rescueCase.update({
          where: { id: c.id },
          data: {
            status: CaseStatus.ESCALATED,
            escalationLevel: newEscalationLevel,
          },
        });

        await tx.caseEvent.create({
          data: {
            caseId: c.id,
            actorId: 'SYSTEM',
            fromStatus: c.status,
            toStatus: CaseStatus.ESCALATED,
            summary: `Automated SLA deadline expired (${c.provider?.slaHours || 72}h limit). Escalated to level ${newEscalationLevel}.`,
          },
        });

        await tx.caseTimelineRecord.create({
          data: {
            caseId: c.id,
            eventType: 'AUTOMATED_SLA_BREACH',
            title: `Statutory SLA Breached by ${c.provider?.name || 'Provider'}`,
            description: `The regulatory response window has expired without provider resolution. Case escalated automatically.`,
            actorName: 'PayRescue SLA Monitor',
          },
        });
      });

      // 2. Notify User
      await NotificationsService.sendNotification({
        userId: c.userId,
        title: `SLA Alert: Case ${c.caseNumber} Escalated`,
        body: `The statutory SLA deadline for ${c.provider?.name || 'your provider'} has elapsed. Your case has been automatically escalated for regulatory review.`,
        linkUrl: `/cases/${c.id}`,
      });
    }

    return { processedCount: expiredCases.length };
  }
}
