import axios, { AxiosError } from 'axios';
import { ApiError } from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Crucial: Transmits and stores httpOnly cookies (access_token & refresh_token)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach request tracking header
apiClient.interceptors.request.use((config) => {
  const requestId = `web_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  config.headers['X-Request-Id'] = requestId;
  return config;
});

// Response interceptor: unwraps backend payload and normalizes errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    // If backend returned standard error envelope
    if (error.response?.data?.error) {
      const { code, message, details } = error.response.data.error;
      const customError = new Error(message) as Error & { code: string; details?: any };
      customError.code = code;
      customError.details = details;
      return Promise.reject(customError);
    }

    // Network or server unreachable
    if (!error.response) {
      const netError = new Error('Unable to connect to PayRescue servers. Please check your internet connection.') as Error & { code: string };
      netError.code = 'NETWORK_ERROR';
      return Promise.reject(netError);
    }

    return Promise.reject(error);
  }
);
