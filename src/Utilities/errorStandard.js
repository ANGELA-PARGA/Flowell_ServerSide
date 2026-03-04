export class AppError extends Error {
    constructor(message, statusCode = 500, errorCode = null, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = details;
        this.isOperational = true;
        this.timestamp = new Date().toISOString();
        
        Error.captureStackTrace(this, this.constructor);
    }
}

export const ErrorCodes = {
    // Business Logic Errors
    RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
    DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
    INVALID_OPERATION: 'INVALID_OPERATION',
    
    // Authentication/Authorization
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    
    // Validation Errors
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_INPUT: 'INVALID_INPUT',
    
    // Database Errors
    DATABASE_ERROR: 'DATABASE_ERROR',
    CONSTRAINT_VIOLATION: 'CONSTRAINT_VIOLATION',
    
    // Server Errors
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
};

export const createNotFoundError = (message, id = null) => {
    return new AppError(
        message,
        404,
        ErrorCodes.RESOURCE_NOT_FOUND,
        id || 'Resource not found'
    );
};

export const createValidationError = (message, details) => {
    return new AppError(
        message,
        400,
        ErrorCodes.VALIDATION_ERROR,
        details || null
    );
};

export const createDuplicateResourceError = (resource, field, value) => {
    return new AppError(
        `Duplicate ${resource} detected with ${field}: ${value}`,
        409,
        ErrorCodes.DUPLICATE_RESOURCE,
        { resource, field, value }
    );
}

export const createDatabaseError = (message = 'Database operation failed', originalError) => {
    console.log('Database Error Code:', originalError);
    if(originalError?.code === '23505') {
        return new AppError(
            'Duplicate resource detected',
            409,
            ErrorCodes.DUPLICATE_RESOURCE,
            originalError?.detail || message
        );
    }

    if(originalError?.code === '23503') {
        return new AppError(
            'Constraint violation occurred',
            400,
            ErrorCodes.CONSTRAINT_VIOLATION,
            originalError?.detail || message
        );
    }

    return new AppError(
        originalError?.message || `DatabaseError: ${message}`,
        originalError?.status || 500,
        ErrorCodes.DATABASE_ERROR,
        originalError?.details || message
    );
};

export const createAuthError = (message = 'Authentication failed', originalError) => {
    return new AppError(
        originalError?.message || `AuthenticationError: ${message}`,
        originalError?.status || 401,
        ErrorCodes.UNAUTHORIZED,
        originalError?.details || message
    );
};

export const createForbiddenError = (message = 'Access denied', originalError) => {
    return new AppError(
        originalError?.message || `ForbiddenError: ${message}`,
        originalError?.status || 403,
        ErrorCodes.FORBIDDEN,
        originalError?.details || message
    );
};

export const createInternalServerError = (message = 'Internal Server Error', originalError) => {
    return new AppError(
        originalError?.message || `InternalServerError: ${message}`,
        originalError?.status || 500,
        ErrorCodes.INTERNAL_ERROR,
        originalError?.details || message
    );
}

