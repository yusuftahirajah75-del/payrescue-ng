export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details: any[];
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', details: any[] = []) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Requested resource not found', details: any[] = []) {
    super(message, 404, 'NOT_FOUND', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required', details: any[] = []) {
    super(message, 401, 'UNAUTHORIZED', details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied: insufficient permissions', details: any[] = []) {
    super(message, 403, 'FORBIDDEN', details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists or conflict occurred', details: any[] = []) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details: any[] = []) {
    super(message, 422, 'VALIDATION_ERROR', details);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', details: any[] = []) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests, please try again later', details: any[] = []) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', details);
  }
}
