import { FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import { ZodError } from 'zod';
import { log } from '../lib/log';

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    hint?: string;
  };
  requestId?: string;
}

/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public hint?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Fastify error handler that normalizes error responses
 */
export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  const requestId = (request as any).requestId || 'unknown';
  const tenantId = (request as any).tenantId;
  
  // Log the error with context
  log('error', 'Unhandled error occurred', {
    requestId,
    tenantId,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    url: request.url,
    method: request.method,
  });

  let statusCode: number;
  let errorResponse: ErrorResponse;

  if (error instanceof AppError) {
    // Application-specific errors
    statusCode = error.statusCode;
    errorResponse = {
      error: {
        code: error.code,
        message: error.message,
        ...(error.hint && { hint: error.hint }),
      },
      requestId,
    };
  } else if (error instanceof ZodError) {
    // Validation errors from Zod schemas
    statusCode = 400;
    const firstError = error.errors[0];
    if (firstError) {
      errorResponse = {
        error: {
          code: 'VALIDATION_ERROR',
          message: firstError.message,
          hint: `Invalid field: ${firstError.path.join('.')}`,
        },
        requestId,
      };
    } else {
      errorResponse = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
        },
        requestId,
      };
    }
  } else if (error.name === 'SyntaxError') {
    // JSON parsing errors
    statusCode = 400;
    errorResponse = {
      error: {
        code: 'INVALID_JSON',
        message: 'Invalid JSON in request body',
        hint: 'Check your request payload format',
      },
      requestId,
    };
  } else {
    // Generic/unknown errors - don't expose internal details
    statusCode = error.statusCode || 500;
    errorResponse = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        hint: 'Please try again later or contact support',
      },
      requestId,
    };
  }

  // Send normalized error response
  reply.status(statusCode).send(errorResponse);
}

/**
 * Async error wrapper for route handlers
 * Catches async errors and passes them to the error handler
 */
export function asyncHandler<T = any>(
  fn: (request: FastifyRequest, reply: FastifyReply) => Promise<T>
) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      return await fn(request, reply);
    } catch (error) {
      if (error instanceof Error) {
        return errorHandler(error as FastifyError, request, reply);
      }
      throw error;
    }
  };
}

/**
 * 404 handler for unmatched routes
 */
export function notFoundHandler(request: FastifyRequest, reply: FastifyReply): void {
  const requestId = (request as any).requestId || 'unknown';
  const tenantId = (request as any).tenantId;
  
  log('warn', 'Route not found', {
    requestId,
    tenantId,
    url: request.url,
    method: request.method,
  });

  const errorResponse: ErrorResponse = {
    error: {
      code: 'NOT_FOUND',
      message: `Route ${request.method} ${request.url} not found`,
      hint: 'Check the API documentation for available endpoints',
    },
    requestId,
  };

  reply.status(404).send(errorResponse);
}

/**
 * Helper function to create application errors
 */
export function createError(
  code: string,
  message: string,
  statusCode: number = 500,
  hint?: string
): AppError {
  return new AppError(code, message, statusCode, hint);
}

/**
 * Common error factory functions
 */
export const errors = {
  notFound: (resource: string, id?: string) =>
    createError(
      'NOT_FOUND',
      `${resource}${id ? ` with id '${id}'` : ''} not found`,
      404,
      `Check that the ${resource.toLowerCase()} exists and you have access to it`
    ),

  unauthorized: (hint?: string) =>
    createError(
      'UNAUTHORIZED',
      'Authentication required',
      401,
      hint || 'Please provide valid authentication credentials'
    ),

  forbidden: (resource?: string) =>
    createError(
      'FORBIDDEN',
      `Access denied${resource ? ` to ${resource}` : ''}`,
      403,
      'You do not have permission to access this resource'
    ),

  validation: (field: string, reason: string) =>
    createError(
      'VALIDATION_ERROR',
      `Validation failed for field '${field}': ${reason}`,
      400,
      'Check your input data and try again'
    ),

  conflict: (resource: string, reason?: string) =>
    createError(
      'CONFLICT',
      `${resource} conflict${reason ? `: ${reason}` : ''}`,
      409,
      'The request conflicts with the current state'
    ),

  rateLimit: (retryAfter?: number) =>
    createError(
      'RATE_LIMIT_EXCEEDED',
      'Too many requests',
      429,
      retryAfter ? `Try again after ${retryAfter} seconds` : 'Please slow down your requests'
    ),

  external: (service: string, originalError?: string) =>
    createError(
      'EXTERNAL_SERVICE_ERROR',
      `External service error: ${service}`,
      502,
      originalError || 'The external service is temporarily unavailable'
    ),
};

export default errorHandler;