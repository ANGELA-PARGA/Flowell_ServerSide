/*middlewares for routes */

const checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        console.log('🚨 authenticated') 
        return next() 
    }
    if(!req.isAuthenticated()){
        console.log('🚨 not authenticated')
        res.status(401).json({ error: 'Unauthorized' });
    }
}

const checkUserRole = (req, res, next) => {
    console.log('🚨 checking user role')
    if (req.user.role === 'client') { 
        console.log('🚨 User is authenticated and authorized')
        return next() 
    }
    console.log('🚨 User is authenticated but not authorized');
    req.logout(err => {
        if (err) return next(err);
        res.status(403).json({ error: 'Unauthorized' });
    });   
}

const checkAdminRole = (req, res, next) => {
    if (req.user.role === 'admin') { 
        return next() 
    }
    console.log('🚨 User is authenticated but not authorized');
    req.logout(err => {
        if (err) return next(err);
        res.status(403).json({ error: 'Unauthorized' });
    });   
}

const errorHandler = (err, req, res, next) => {
    console.log('🚨 Error handler middleware triggered', err);
    const statusCode = err.status || 500;
    const message = err.message || 'Internal Server Error';
    const stack = err.stack || 'Stack was not provided';
    const error = err || 'Error object was not provided';

    console.error(`🚨 Error: ${statusCode} - ${message}\n\n${error}`);

    res.status(statusCode).json({        
        status: statusCode,
        error: message,
        stack: stack,
        customError: {
            status: statusCode,
            message: message,
        }
    });
};

export {
    checkAuthenticated,
    checkUserRole,
    checkAdminRole,
    errorHandler
};