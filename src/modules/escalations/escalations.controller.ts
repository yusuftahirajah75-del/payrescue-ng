import { Request, Response } from 'express';
import { EscalationEngine } from './escalations.service';
import { ApiResponseHandler } from '../../utils/apiResponse';

export class EscalationController {
  static async triggerSlaCheck(req: Request, res: Response): Promise<void> {
    const result = await EscalationEngine.processSlaExpirations();
    ApiResponseHandler.success(res, result, 'SLA expiration review executed.');
  }
}
