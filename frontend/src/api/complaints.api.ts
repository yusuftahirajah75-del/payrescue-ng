import { apiClient } from './client';
import { ApiResponse, Complaint } from '../types';

export const complaintsApi = {
  generateComplaint: async (caseId: string) => {
    const res = await apiClient.post<ApiResponse<Complaint>>(`/complaints/generate/${caseId}`);
    return res.data.data;
  },

  submitComplaint: async (complaintId: string, data: { channel: string; recipient?: string; responseRef?: string }) => {
    const res = await apiClient.post<ApiResponse<any>>(`/complaints/submit/${complaintId}`, data);
    return res.data.data;
  },
};
