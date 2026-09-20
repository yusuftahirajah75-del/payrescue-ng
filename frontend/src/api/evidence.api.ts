import { apiClient } from './client';
import { ApiResponse, Evidence } from '../types';

export const evidenceApi = {
  uploadEvidence: async (formData: FormData) => {
    const res = await apiClient.post<ApiResponse<Evidence>>('/evidence/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  },

  getEvidenceById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Evidence>>(`/evidence/${id}`);
    return res.data.data;
  },
};
