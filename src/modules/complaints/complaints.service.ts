import { prisma } from '../../prisma/client';
import { CryptoUtils } from '../../utils/crypto';
import { NigeriaUtils } from '../../utils/nigeria';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { ProviderAdapterRegistry } from '../providers/adapters';
import { ProviderCategory, CaseStatus } from '@prisma/client';

export class ComplaintsService {
  static async generateComplaintPackage(caseId: string) {
    const rescueCase = await prisma.rescueCase.findUnique({
      where: { id: caseId },
      include: {
        user: true,
        provider: true,
        transaction: true,
        evidence: true,
      },
    });

    if (!rescueCase) {
      throw new NotFoundError('Rescue case not found.');
    }

    const providerCategory = rescueCase.provider?.category || ProviderCategory.BANK;
    const adapter = ProviderAdapterRegistry.getAdapter(providerCategory);

    const formattedAmount = NigeriaUtils.formatNaira(rescueCase.claimAmount.toString());
    const evidenceList = rescueCase.evidence.map(
      (e) => `${e.documentType}: ${e.originalFilename} (SHA-256: ${e.sha256Hash.slice(0, 16)}...)`
    );

    const complaintRef = CryptoUtils.generateComplaintReference();

    const formatted = adapter.formatComplaint({
      caseNumber: rescueCase.caseNumber,
      customerName: `${rescueCase.user.firstName} ${rescueCase.user.lastName}`,
      customerPhone: rescueCase.user.phone || undefined,
      customerEmail: rescueCase.user.email,
      transactionReference: rescueCase.transaction.publicReference,
      amount: formattedAmount,
      timestamp: rescueCase.transaction.transactionTimestamp.toISOString(),
      providerName: rescueCase.provider?.name || 'Financial Service Provider',
      category: rescueCase.category,
      evidenceList: evidenceList.length > 0 ? evidenceList : ['Transaction metadata recorded in system ledger'],
    });

    const structuredSummary = {
      complaintRef,
      caseNumber: rescueCase.caseNumber,
      customer: {
        name: `${rescueCase.user.firstName} ${rescueCase.user.lastName}`,
        email: rescueCase.user.email,
        phone: rescueCase.user.phone,
      },
      transaction: {
        reference: rescueCase.transaction.publicReference,
        amount: formattedAmount,
        date: rescueCase.transaction.transactionTimestamp,
        provider: rescueCase.provider?.name,
      },
      evidenceHashes: rescueCase.evidence.map((e) => ({
        filename: e.originalFilename,
        hash: e.sha256Hash,
      })),
      statutoryBasis: formatted.statutoryBasis,
      escalationRoutes: adapter.getEscalationRoutes(),
    };

    const complaint = await prisma.$transaction(async (tx) => {
      const created = await tx.complaint.create({
        data: {
          complaintRef,
          caseId,
          providerId: rescueCase.providerId,
          subject: formatted.subject,
          contentBody: formatted.body,
          structuredSummary: structuredSummary as any,
          isRegulatoryFormat: true,
        },
      });

      // Advance case status to COMPLAINT_PREPARED
      await tx.rescueCase.update({
        where: { id: caseId },
        data: { status: CaseStatus.COMPLAINT_PREPARED },
      });

      await tx.caseTimelineRecord.create({
        data: {
          caseId,
          eventType: 'COMPLAINT_GENERATED',
          title: 'Official Complaint Package Prepared',
          description: `Standardized dispute documentation generated (Ref: ${complaintRef}) citing ${formatted.statutoryBasis}.`,
          actorName: 'PayRescue Engine',
        },
      });

      return created;
    });

    return complaint;
  }

  static async recordSubmission(
    complaintId: string,
    channel: 'EMAIL' | 'DIRECT_PORTAL' | 'API' | 'MANUAL_COPY',
    submittedBy: string,
    recipient?: string,
    responseRef?: string
  ) {
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: { rescueCase: true },
    });

    if (!complaint) {
      throw new NotFoundError('Complaint record not found.');
    }

    const submission = await prisma.$transaction(async (tx) => {
      const sub = await tx.complaintSubmission.create({
        data: {
          complaintId,
          channel,
          recipient,
          submittedBy,
          status: 'DISPATCHED',
          responseRef,
          deliveredAt: new Date(),
        },
      });

      await tx.rescueCase.update({
        where: { id: complaint.caseId },
        data: { status: CaseStatus.SUBMITTED },
      });

      await tx.caseTimelineRecord.create({
        data: {
          caseId: complaint.caseId,
          eventType: 'COMPLAINT_SUBMITTED',
          title: `Dispute Dispatched via ${channel}`,
          description: recipient ? `Transmitted to ${recipient}.` : 'Complaint copied for manual transmission.',
          actorName: submittedBy,
        },
      });

      return sub;
    });

    return submission;
  }
}
