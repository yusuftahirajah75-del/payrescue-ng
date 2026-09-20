import { Request, Response } from 'express';
import { ReconciliationService } from './reconciliation.service';
import { ApiResponseHandler } from '../../utils/apiResponse';
import { BadRequestError } from '../../utils/errors';

export class ReconciliationController {
  static async reconcileCsv(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      throw new BadRequestError('CSV file is required for batch reconciliation.');
    }

    const businessId = req.businessId;
    if (!businessId) {
      throw new BadRequestError('Business context required.');
    }

    const parsedRows = ReconciliationService.parseCsvSettlement(req.file.buffer);

    const claims = parsedRows.map((r) => ({
      claimedReference: r.reference,
      claimedAmount: r.amount,
      transactionDate: r.date,
      rawEntryData: r,
    }));

    const result = await ReconciliationService.reconcileBatch(
      businessId,
      claims,
      req.file.originalname
    );

    ApiResponseHandler.success(res, result, 'CSV bank settlement reconciled successfully.');
  }

  static async reconcileManual(req: Request, res: Response): Promise<void> {
    const businessId = req.businessId;
    if (!businessId) {
      throw new BadRequestError('Business context required.');
    }

    const result = await ReconciliationService.reconcileBatch(
      businessId,
      req.body.claims,
      req.body.sourceFileName
    );

    ApiResponseHandler.success(res, result, 'Batch reconciliation processed.');
  }

  static async getJob(req: Request, res: Response): Promise<void> {
    const businessId = req.businessId!;
    const job = await ReconciliationService.getJobResults(req.params.jobId, businessId);
    ApiResponseHandler.success(res, job, 'Reconciliation job details retrieved.');
  }
}
