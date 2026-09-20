import { Request, Response } from 'express';
import { EvidenceService } from './evidence.service';
import { ApiResponseHandler } from '../../utils/apiResponse';
import { BadRequestError } from '../../utils/errors';
import path from 'path';
import fs from 'fs';
import { config } from '../../config';

export class EvidenceController {
  static async upload(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      throw new BadRequestError('Evidence file is required in multipart form-data.');
    }

    const { caseId, documentType } = req.body;
    if (!caseId) {
      throw new BadRequestError('caseId is required.');
    }

    const user = {
      id: req.user!.id,
      firstName: req.user!.firstName,
      lastName: req.user!.lastName,
    };

    const evidence = await EvidenceService.uploadEvidence(caseId, req.file, documentType, user);
    ApiResponseHandler.created(res, evidence, 'Evidence uploaded and cryptographically hashed.');
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const actor = {
      id: req.user!.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };
    const evidence = await EvidenceService.getEvidenceById(req.params.id, actor);
    ApiResponseHandler.success(res, evidence, 'Evidence metadata retrieved.');
  }

  static async serveFile(req: Request, res: Response): Promise<void> {
    const key = req.params[0];
    const uploadDir = path.resolve(config.LOCAL_UPLOAD_DIR);
    const filePath = path.join(uploadDir, key);

    // Prevent path traversal
    if (!filePath.startsWith(uploadDir)) {
      res.status(403).send('Forbidden');
      return;
    }

    if (!fs.existsSync(filePath)) {
      res.status(404).send('File not found');
      return;
    }

    res.sendFile(filePath);
  }
}
