import { Request, Response } from 'express';
import { BusinessService } from './business.service';
import { ApiResponseHandler } from '../../utils/apiResponse';

export class BusinessController {
  static async getDetails(req: Request, res: Response): Promise<void> {
    const business = await BusinessService.getBusinessDetails(req.businessId!);
    ApiResponseHandler.success(res, business, 'Business details retrieved.');
  }

  static async update(req: Request, res: Response): Promise<void> {
    const updated = await BusinessService.updateBusiness(req.businessId!, req.body);
    ApiResponseHandler.success(res, updated, 'Business profile updated.');
  }

  static async listMembers(req: Request, res: Response): Promise<void> {
    const members = await BusinessService.listMembers(req.businessId!);
    ApiResponseHandler.success(res, members, 'Team members retrieved.');
  }

  static async addMember(req: Request, res: Response): Promise<void> {
    const member = await BusinessService.addMember(req.businessId!, req.body);
    ApiResponseHandler.created(res, member, 'Team member added to business.');
  }

  static async removeMember(req: Request, res: Response): Promise<void> {
    await BusinessService.removeMember(req.businessId!, req.params.userId);
    ApiResponseHandler.success(res, null, 'Team member removed.');
  }
}
