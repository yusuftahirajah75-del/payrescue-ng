import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  requestId: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any[];
  };
  requestId: string;
}

export class ApiResponseHandler {
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Operation successful',
    statusCode: number = 200
  ): Response {
    const requestId = (res.locals.requestId as string) || 'req_unknown';
    const payload: ApiResponse<T> = {
      success: true,
      data,
      message,
      requestId,
    };
    return res.status(statusCode).json(payload);
  }

  static created<T>(res: Response, data: T, message: string = 'Resource created successfully'): Response {
    return this.success(res, data, message, 201);
  }

  static error(
    res: Response,
    code: string,
    message: string,
    statusCode: number = 400,
    details: any[] = []
  ): Response {
    const requestId = (res.locals.requestId as string) || 'req_unknown';
    const payload: ApiErrorResponse = {
      success: false,
      error: {
        code,
        message,
        details,
      },
      requestId,
    };
    return res.status(statusCode).json(payload);
  }
}
