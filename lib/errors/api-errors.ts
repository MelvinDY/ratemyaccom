/**
 * Custom API error classes for different error scenarios
 */

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  toJSON() {
    return {
      error: {
        message: this.message,
        code: this.code || 'UNKNOWN_ERROR',
        statusCode: this.statusCode,
      },
    };
  }
}

export class ValidationError extends ApiError {
  constructor(
    message: string,
    public fields?: Record<string, string[]>
  ) {
    super(400, message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  toJSON() {
    return {
      error: {
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
        fields: this.fields,
      },
    };
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(401, message, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Insufficient permissions') {
    super(403, message, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string = 'Resource') {
    super(404, `${resource} not found`, 'NOT_FOUND');
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class RateLimitError extends ApiError {
  constructor(
    message: string = 'Too many requests',
    public retryAfter?: Date
  ) {
    super(429, message, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }

  toJSON() {
    return {
      error: {
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
        retryAfter: this.retryAfter?.toISOString(),
      },
    };
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = 'Resource conflict') {
    super(409, message, 'CONFLICT');
    this.name = 'ConflictError';
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class ServerError extends ApiError {
  constructor(message: string = 'Internal server error') {
    super(500, message, 'INTERNAL_SERVER_ERROR');
    this.name = 'ServerError';
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

/**
 * Error handler for API routes
 */
export const handleApiError = (error: unknown): Response => {
  console.error('API Error:', error);

  // Known API errors
  if (error instanceof ApiError) {
    return new Response(JSON.stringify(error.toJSON()), {
      status: error.statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validation errors from Zod
  if (error && typeof error === 'object' && 'issues' in error) {
    const validationError = new ValidationError('Validation failed', {
      fields: (error as { issues: Array<{ path: string[]; message: string }> }).issues.map(
        (issue) => issue.message
      ),
    } as Record<string, string[]>);

    return new Response(JSON.stringify(validationError.toJSON()), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Unknown errors - don't expose details in production
  const serverError = new ServerError(
    process.env.NODE_ENV === 'development'
      ? error instanceof Error
        ? error.message
        : 'Unknown error'
      : 'Internal server error'
  );

  return new Response(JSON.stringify(serverError.toJSON()), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  });
};

/**
 * Type guard for ApiError
 */
export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};
