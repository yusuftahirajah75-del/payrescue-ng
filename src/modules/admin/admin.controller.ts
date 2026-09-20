import { Request, Response } from 'express';
import { AdminService } from './admin.service';
import { ApiResponseHandler } from '../../utils/apiResponse';

export class AdminController {
  static async listUsers(req: Request, res: Response): Promise<void> {
    const result = await AdminService.listUsers(req.query as any);
    ApiResponseHandler.success(res, result, 'User directory retrieved.');
  }

  static async updateUserStatus(req: Request, res: Response): Promise<void> {
    const updated = await AdminService.updateUserStatus(
      req.params.id,
      req.body.status,
      req.user!.id
    );
    ApiResponseHandler.success(res, updated, 'User account status updated.');
  }

  static async listAuditLogs(req: Request, res: Response): Promise<void> {
    const limit = Number(req.query.limit) || 50;
    const logs = await AdminService.listAuditLogs(limit);
    ApiResponseHandler.success(res, logs, 'Audit trail logs retrieved.');
  }

  static async listSettings(req: Request, res: Response): Promise<void> {
    const settings = await AdminService.listSettings();
    ApiResponseHandler.success(res, settings, 'System settings retrieved.');
  }

  static async updateSetting(req: Request, res: Response): Promise<void> {
    const updated = await AdminService.updateSetting(req.params.key, req.body.value);
    ApiResponseHandler.success(res, updated, 'System setting updated.');
  }

  static async listFeatureFlags(req: Request, res: Response): Promise<void> {
    const flags = await AdminService.listFeatureFlags();
    ApiResponseHandler.success(res, flags, 'Feature flags retrieved.');
  }

  static async updateFeatureFlag(req: Request, res: Response): Promise<void> {
    const updated = await AdminService.updateFeatureFlag(req.params.name, req.body.isEnabled);
    ApiResponseHandler.success(res, updated, 'Feature flag updated.');
  }
}
