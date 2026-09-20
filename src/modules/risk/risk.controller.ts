import { Request, Response } from 'express';
import { RiskService } from './risk.service';
import { ApiResponseHandler } from '../../utils/apiResponse';

export class RiskController {
  static async evaluate(req: Request, res: Response): Promise<void> {
    const result = await RiskService.evaluateTransactionRisk({
      ...req.body,
      userId: req.user?.id,
    });
    ApiResponseHandler.success(res, result, 'Risk and trust signals evaluated.');
  }
}
