import { Request, Response } from 'express';
import { CasesService } from './cases.service';
import { ApiResponseHandler } from '../../utils/apiResponse';

export class CasesController {
  static async create(req: Request, res: Response): Promise<void> {
    const user = {
      id: req.user!.id,
      role: req.user!.role,
      firstName: req.user!.firstName,
      lastName: req.user!.lastName,
    };
    const rescueCase = await CasesService.createCase(req.body, user, req.businessId);
    ApiResponseHandler.created(res, rescueCase, 'Rescue case opened successfully. Case reference assigned.');
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const user = { id: req.user!.id, role: req.user!.role };
    const rescueCase = await CasesService.getCaseById(req.params.id, user, req.businessId);
    ApiResponseHandler.success(res, rescueCase, 'Case details retrieved successfully.');
  }

  static async list(req: Request, res: Response): Promise<void> {
    const user = { id: req.user!.id, role: req.user!.role };
    const result = await CasesService.listCases(req.query as any, user, req.businessId);
    ApiResponseHandler.success(res, result, 'Rescue cases retrieved successfully.');
  }

  static async updateStatus(req: Request, res: Response): Promise<void> {
    const actor = {
      id: req.user!.id,
      role: req.user!.role,
      firstName: req.user!.firstName,
      lastName: req.user!.lastName,
    };
    const updated = await CasesService.updateCaseStatus(req.params.id, req.body, actor);
    ApiResponseHandler.success(res, updated, 'Case status updated successfully.');
  }

  static async escalate(req: Request, res: Response): Promise<void> {
    const actor = {
      id: req.user!.id,
      role: req.user!.role,
      firstName: req.user!.firstName,
      lastName: req.user!.lastName,
    };
    const escalated = await CasesService.escalateCase(req.params.id, req.body, actor);
    ApiResponseHandler.success(res, escalated, 'Case escalated to regulator level.');
  }
}
