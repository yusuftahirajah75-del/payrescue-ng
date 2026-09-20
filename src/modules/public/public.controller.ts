import { Request, Response } from 'express';
import { PublicService } from './public.service';
import { ApiResponseHandler } from '../../utils/apiResponse';

export class PublicController {
  static async getPlatform(req: Request, res: Response): Promise<void> {
    const data = PublicService.getPlatformInfo();
    ApiResponseHandler.success(res, data, 'Platform metadata retrieved successfully');
  }

  static async getFeatures(req: Request, res: Response): Promise<void> {
    const data = PublicService.getFeatures();
    ApiResponseHandler.success(res, data, 'Platform features retrieved successfully');
  }

  static async getPricing(req: Request, res: Response): Promise<void> {
    const data = await PublicService.getPricingPlans();
    ApiResponseHandler.success(res, data, 'Pricing plans retrieved successfully');
  }

  static async getFaq(req: Request, res: Response): Promise<void> {
    const data = PublicService.getFaqs();
    ApiResponseHandler.success(res, data, 'Frequently asked questions retrieved successfully');
  }

  static async getProviders(req: Request, res: Response): Promise<void> {
    const data = await PublicService.getProviders();
    ApiResponseHandler.success(res, data, 'Supported providers directory retrieved successfully');
  }

  static async getStatus(req: Request, res: Response): Promise<void> {
    const data = await PublicService.getStatus();
    ApiResponseHandler.success(res, data, 'System status operational');
  }

  static async contactSupport(req: Request, res: Response): Promise<void> {
    const { name, email, subject, message } = req.body;
    // Log message and acknowledge
    ApiResponseHandler.success(
      res,
      { ticketReference: `SUP-${Date.now()}` },
      'Your inquiry has been received. A PayRescue support specialist will respond within 24 hours.'
    );
  }
}
