import { apiClient } from './client';
import { ApiResponse, RiskSignal, RiskAction } from '../types';

export interface RiskEvaluationResult {
  recommendedAction: RiskAction;
  overallScore: number;
  signals: RiskSignal[];
}

export const riskApi = {
  evaluateRisk: async (data: { caseId?: string; transactionReference: string; claimedAmount: number; claimedTimestamp?: string }) => {
    const res = await apiClient.post<ApiResponse<RiskEvaluationResult>>('/risk/evaluate', data);
    return res.data.data;
  },
};
