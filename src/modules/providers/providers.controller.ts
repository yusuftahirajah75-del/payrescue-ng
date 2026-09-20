import { Request, Response } from 'express';
import { ProvidersService } from './providers.service';
import { ApiResponseHandler } from '../../utils/apiResponse';

export class ProvidersController {
  static async create(req: Request, res: Response): Promise<void> {
    const provider = await ProvidersService.createProvider(req.body);
    ApiResponseHandler.created(res, provider, 'Provider created successfully.');
  }

  static async list(req: Request, res: Response): Promise<void> {
    const providers = await ProvidersService.listProviders(req.query as any);
    ApiResponseHandler.success(res, providers, 'Providers directory retrieved successfully.');
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const provider = await ProvidersService.getProviderById(req.params.id);
    ApiResponseHandler.success(res, provider, 'Provider details retrieved.');
  }

  static async update(req: Request, res: Response): Promise<void> {
    const updated = await ProvidersService.updateProvider(req.params.id, req.body);
    ApiResponseHandler.success(res, updated, 'Provider updated successfully.');
  }
}
