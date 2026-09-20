import { apiClient } from './client';
import { ApiResponse, PaymentRequest, VerificationResult } from '../types';

export const verificationApi = {
  createPaymentRequest: async (businessId: string, data: { expectedAmount: number; currency?: string; payerIdentifier?: string; description?: string; expiresInMinutes?: number }) => {
    const res = await apiClient.post<ApiResponse<PaymentRequest>>(`/verification/${businessId}/requests`, data);
    return res.data.data;
  },

  verifyPayment: async (businessId: string, data: { paymentRequestId?: string; claimedReference: string; claimedAmount?: number }) => {
    const res = await apiClient.post<ApiResponse<VerificationResult>>(`/verification/${businessId}/verify`, data);
    return res.data.data;
  },
};
