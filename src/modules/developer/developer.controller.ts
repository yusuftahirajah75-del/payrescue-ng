import { Request, Response } from 'express';
import { DeveloperService } from './developer.service';
import { ApiResponseHandler } from '../../utils/apiResponse';

export class DeveloperController {
  static async createKey(req: Request, res: Response): Promise<void> {
    const key = await DeveloperService.createApiKey(req.businessId!, req.body);
    ApiResponseHandler.created(res, key, 'API key generated. Store secret securely.');
  }

  static async listKeys(req: Request, res: Response): Promise<void> {
    const keys = await DeveloperService.listApiKeys(req.businessId!);
    ApiResponseHandler.success(res, keys, 'API keys retrieved.');
  }

  static async revokeKey(req: Request, res: Response): Promise<void> {
    await DeveloperService.revokeApiKey(req.params.id, req.businessId!);
    ApiResponseHandler.success(res, null, 'API key revoked.');
  }

  static async createWebhook(req: Request, res: Response): Promise<void> {
    const webhook = await DeveloperService.createWebhook(req.businessId!, req.body);
    ApiResponseHandler.created(res, webhook, 'Webhook registered successfully.');
  }

  static async listWebhooks(req: Request, res: Response): Promise<void> {
    const webhooks = await DeveloperService.listWebhooks(req.businessId!);
    ApiResponseHandler.success(res, webhooks, 'Webhooks retrieved.');
  }

  static async testWebhook(req: Request, res: Response): Promise<void> {
    const result = await DeveloperService.dispatchTestWebhook(req.params.id, req.businessId!);
    ApiResponseHandler.success(res, result, 'Test webhook dispatched.');
  }

  static async getLogs(req: Request, res: Response): Promise<void> {
    const logs = await DeveloperService.getApiLogs(req.businessId!);
    ApiResponseHandler.success(res, logs, 'API request logs retrieved.');
  }
}
