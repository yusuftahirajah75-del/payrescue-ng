import { Request, Response } from 'express';
import { TransactionsService } from './transactions.service';
import { ApiResponseHandler } from '../../utils/apiResponse';

export class TransactionsController {
  static async create(req: Request, res: Response): Promise<void> {
    const context = {
      userId: req.user?.id,
      businessId: req.businessId,
    };
    const transaction = await TransactionsService.createTransaction(req.body, context);
    ApiResponseHandler.created(res, transaction, 'Transaction recorded in ledger successfully.');
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const context = {
      userId: req.user?.id,
      businessId: req.businessId,
    };
    const transaction = await TransactionsService.getTransactionById(req.params.id, context);
    ApiResponseHandler.success(res, transaction, 'Transaction retrieved successfully.');
  }

  static async list(req: Request, res: Response): Promise<void> {
    const context = {
      userId: req.user?.id,
      businessId: req.businessId,
    };
    const result = await TransactionsService.listTransactions(req.query, context);
    ApiResponseHandler.success(res, result, 'Transactions retrieved successfully.');
  }

  static async updateStatus(req: Request, res: Response): Promise<void> {
    const updated = await TransactionsService.updateTransactionStatus(
      req.params.id,
      req.body,
      req.user?.id
    );
    ApiResponseHandler.success(res, updated, 'Transaction status updated successfully.');
  }
}
