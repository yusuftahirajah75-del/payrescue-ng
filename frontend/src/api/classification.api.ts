import { apiClient } from './client';
import { ApiResponse, DisputeCategory } from '../types';

export interface ClassificationResponse {
  category: DisputeCategory;
  confidenceScore: number;
  rationale: string;
  suggestedAction: string;
}

export const classificationApi = {
  classifyDispute: async (data: {
    transactionType: string;
    claimAmount: number;
    transactionReference: string;
    narrativeDescription: string;
    hasDebitAlert: boolean;
    hasValueDelivered: boolean;
    hoursElapsedSinceTransaction: number;
  }) => {
    const res = await apiClient.post<ApiResponse<ClassificationResponse>>('/classification/classify', data);
    return res.data.data;
  },
};
