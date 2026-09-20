import { Request, Response } from 'express';
import { OcrService } from './ocr.service';
import { ApiResponseHandler } from '../../utils/apiResponse';

export class OcrController {
  static async extract(req: Request, res: Response): Promise<void> {
    const { evidenceId } = req.params;
    const extraction = await OcrService.extractEvidenceMetadata(evidenceId);
    ApiResponseHandler.success(
      res,
      extraction,
      'Document parsed. Manual confirmation required before financial decisions.'
    );
  }
}
