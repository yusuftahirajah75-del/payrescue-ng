import { apiClient } from './client';
import { ApiResponse, OcrExtraction } from '../types';

export const ocrApi = {
  extractEvidence: async (evidenceId: string) => {
    const res = await apiClient.post<ApiResponse<OcrExtraction>>(`/ocr/extract/${evidenceId}`);
    return res.data.data;
  },
};
