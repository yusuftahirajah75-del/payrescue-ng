import { Request, Response } from 'express';
import { ClassificationEngine } from './classification.service';
import { ApiResponseHandler } from '../../utils/apiResponse';

export class ClassificationController {
  static async classify(req: Request, res: Response): Promise<void> {
    const result = await ClassificationEngine.classifyDispute(req.body);
    ApiResponseHandler.success(res, result, 'Dispute classified successfully.');
  }
}
