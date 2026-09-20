import { Request, Response } from 'express';
import { ComplaintsService } from './complaints.service';
import { ApiResponseHandler } from '../../utils/apiResponse';

export class ComplaintsController {
  static async generate(req: Request, res: Response): Promise<void> {
    const { caseId } = req.params;
    const complaint = await ComplaintsService.generateComplaintPackage(caseId);
    ApiResponseHandler.created(res, complaint, 'Official complaint package generated successfully.');
  }

  static async recordSubmission(req: Request, res: Response): Promise<void> {
    const { complaintId } = req.params;
    const { channel, recipient, responseRef } = req.body;
    const submittedBy = `${req.user!.firstName} ${req.user!.lastName}`;

    const submission = await ComplaintsService.recordSubmission(
      complaintId,
      channel,
      submittedBy,
      recipient,
      responseRef
    );
    ApiResponseHandler.success(res, submission, 'Submission event recorded in case ledger.');
  }
}
