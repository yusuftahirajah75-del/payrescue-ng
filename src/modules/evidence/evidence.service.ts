import { v4 as uuidv4 } from 'uuid';
import { EvidenceStatus } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { CryptoUtils } from '../../utils/crypto';
import { getStorageDriver } from './storage';
import { defaultScanner } from './scanner';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../utils/errors';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export class EvidenceService {
  static async uploadEvidence(
    caseId: string,
    file: Express.Multer.File,
    documentType: string,
    user: { id: string; firstName: string; lastName: string }
  ) {
    if (!file) {
      throw new BadRequestError('No file was uploaded.');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestError(
        `Unsupported file format: ${file.mimetype}. Allowed formats: JPEG, PNG, WEBP, PDF.`
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestError('File exceeds the maximum allowable size of 10MB.');
    }

    const rescueCase = await prisma.rescueCase.findUnique({
      where: { id: caseId },
    });

    if (!rescueCase) {
      throw new NotFoundError('Associated rescue case not found.');
    }

    // 1. Calculate Cryptographic SHA-256 Digest
    const sha256Hash = CryptoUtils.sha256(file.buffer);

    // 2. Malware Scan
    const scanResult = await defaultScanner.scanBuffer(file.buffer, file.originalname);
    const status = scanResult.isClean ? EvidenceStatus.CLEAN : EvidenceStatus.INFECTED;

    if (status === EvidenceStatus.INFECTED) {
      throw new BadRequestError(`Security violation: File flagged by antivirus as ${scanResult.threatName}`);
    }

    // 3. Upload to Storage Driver
    const extension = file.originalname.split('.').pop() || 'dat';
    const storageKey = `evidence/${caseId}/${uuidv4()}.${extension}`;
    const storageDriver = getStorageDriver();
    const uploadRes = await storageDriver.uploadFile(file, storageKey);

    // 4. Save to Database
    const evidence = await prisma.$transaction(async (tx) => {
      const created = await tx.evidence.create({
        data: {
          caseId,
          uploadedById: user.id,
          originalFilename: file.originalname,
          storageKey,
          storageDriver: process.env.STORAGE_DRIVER || 'local',
          publicUrl: uploadRes.publicUrl,
          fileSizeBytes: file.size,
          mimeType: file.mimetype,
          sha256Hash,
          status,
          documentType: documentType || 'RECEIPT',
          scanResult: scanResult.scannerEngine,
          isVerifiedProof: false, // Critical principle: Never treat screenshot alone as verified proof
        },
      });

      // Append Timeline Event
      await tx.caseTimelineRecord.create({
        data: {
          caseId,
          eventType: 'EVIDENCE_UPLOADED',
          title: 'Evidence Uploaded',
          description: `Evidence document "${file.originalname}" (${(file.size / 1024).toFixed(1)} KB) secured with SHA-256 hash.`,
          actorName: `${user.firstName} ${user.lastName}`,
        },
      });

      return created;
    });

    return evidence;
  }

  static async getEvidenceById(evidenceId: string, actor: { id: string; ipAddress?: string; userAgent?: string }) {
    const evidence = await prisma.evidence.findUnique({
      where: { id: evidenceId },
      include: { ocrExtractions: true },
    });

    if (!evidence) {
      throw new NotFoundError('Evidence record not found.');
    }

    // Audit Access
    await prisma.evidenceAuditLog.create({
      data: {
        evidenceId,
        action: 'VIEWED',
        actorId: actor.id,
        actorIp: actor.ipAddress,
        userAgent: actor.userAgent,
      },
    });

    return evidence;
  }
}
