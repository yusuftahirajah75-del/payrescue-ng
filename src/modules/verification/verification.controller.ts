import { Request, Response } from 'express';
import { VerificationService } from './verification.service';
import { ApiResponseHandler } from '../../utils/apiResponse';

export class VerificationController {
  static async createRequest(req: Request, res: Response): Promise<void> {
    const request = await VerificationService.createPaymentRequest(req.businessId!, req.body);
    ApiResponseHandler.created(res, request, 'Payment request reference generated.');
  }

  static async verify(req: Request, res: Response): Promise<void> {
    const result = await VerificationService.verifyPayment(req.businessId!, req.body);
    ApiResponseHandler.success(res, result, 'Payment claim verified against ledger.');
  }
}
