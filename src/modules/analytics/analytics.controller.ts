import { Request, Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { ApiResponseHandler } from '../../utils/apiResponse';

export class AnalyticsController {
  static async getOverview(req: Request, res: Response): Promise<void> {
    const data = await AnalyticsService.getPlatformOverview(req.businessId);
    ApiResponseHandler.success(res, data, 'Platform metrics retrieved.');
  }

  static async getProviderMetrics(req: Request, res: Response): Promise<void> {
    const data = await AnalyticsService.getProviderPerformance();
    ApiResponseHandler.success(res, data, 'Provider metrics retrieved.');
  }
}
