/*middlewares for routes */
import { AppError, createAuthError, createForbiddenError } from '../Utilities/errorStandard.js'

const checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        console.log('🚨 authenticated') 
        return next() 
    }
    if(!req.isAuthenticated()){
        console.log('🚨 not authenticated')
        throw createAuthError('User is not authenticated');
    }
}

const checkUserRole = (req, res, next) => {
    if (req.user.role === 'client') { 
        console.log('🚨 User is authenticated and authorized')
        return next() 
    }
    console.log('🚨 User is authenticated but not authorized');
    req.logout(err => {
        if (err) return next(err);
        throw createForbiddenError('Unauthorized access to client resources');
    });   
}

const checkAdminRole = (req, res, next) => {
    if (req.user.role === 'admin') { 
        return next() 
    }
    console.log('🚨 User is authenticated but not authorized');
    req.logout(err => {
        if (err) return next(err);
        throw createForbiddenError('Unauthorized access to admin resources');
    });   
}

const errorHandler = (err, req, res, next) => {
    console.log('🚨 Error handler middleware triggered', err);
    
    let error = err;
    
    if (!(err instanceof AppError)) {
        const statusCode = err?.status || err.statusCode || 500;
        const message = err?.message || 'Internal Server Error';
        
        error = new AppError(
            message,
            statusCode,
            err?.code || 'INTERNAL_ERROR',
            err?.details || null
        );
    }
    
    console.error(`🚨 Error: ${error.statusCode} - ${error.message}`);
    if (process.env.NODE_ENV === 'development') {
        console.error('Stack:', error.stack);
    }
    
    const errorResponse = {
        status: error.statusCode,
        error: error.message,
        errorCode: error.errorCode,
        timestamp: error.timestamp
    };
    
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = error.stack;
        errorResponse.details = error.details;
    }
    
    res.status(error.statusCode).json(errorResponse);
};

export {
    checkAuthenticated,
    checkUserRole,
    checkAdminRole,
    errorHandler
};