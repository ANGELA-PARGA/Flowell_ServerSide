const { body, query, param, validationResult } = require('express-validator');
const { luhnCheck } = require('./utilities')

const idParamsValidator = [
    param('id').trim().notEmpty().isNumeric().withMessage('An ID is required and must be a number') 
]

const resourceValidator = [
    param('resourceType').trim().optional().notEmpty().isString().withMessage('The resource type is required'),
    param('resourceId').trim().optional().notEmpty().isNumeric().withMessage('The resource ID to delete is required and must be a number') 
]

const categoryParamsValidator = [
    param('categoryId').trim().optional().notEmpty().isNumeric().withMessage('The category ID is required and must be a number') 
]

const signupValidators = [
    body('first_name').trim().notEmpty().isString().withMessage('First name is required'),
    body('last_name').trim().notEmpty().isString().withMessage('Last name is required'),
    body('email').trim().notEmpty().isEmail().withMessage('Invalid email address, a valid email is required'),
    body('password').trim().notEmpty().isString().withMessage('Password is required, and must not be empty'),
]

const loginValidators = [
    body('email').trim().notEmpty().isEmail().withMessage('Invalid email address, a valid email is required'),
    body('password').trim().notEmpty().isString().withMessage('Password is required, and must not be empty'),
]

const updatePersonalInfoValidators = [
    body('first_name').trim().notEmpty().isString().isLength({ min: 2 }).withMessage('First name must be at least 2 characters long'),
    body('last_name').trim().notEmpty().isString().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters long'),
]
const updatePaymentInfoValidators = [
    body('credit_card').isString().notEmpty().trim()
    .isLength({ min: 13, max: 19 }).withMessage('Credit card number must be between 13 and 19 digits')
    .matches(/^[0-9]+$/).withMessage('Credit card number must contain only digits')
    .custom(value => luhnCheck(value)).withMessage('Credit card number is invalid'),
    body('holder')
    .isLength({ min: 2, max: 50 }).withMessage('Card holder name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Card holder name must contain only letters and spaces'),
    body('expiration_date')
    .matches(/^(0[1-9]|1[0-2])\/([0-9]{2})$/).withMessage('Expiration date format must be MM/YY')
    .customSanitizer(value => {
        const [month, year] = value.split('/');
        const fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`;
        return `${fullYear}-${month}-01`;
    })
    .isISO8601().toDate()
    .custom(value => {
        const today = new Date();
        return value > today;
    }).withMessage('Expiration date must be in the future'),
]
const updateAddressInfoValidators = [
    body('address').trim().notEmpty().isString().withMessage('Address is required'),
    body('city').trim().notEmpty().isString().withMessage('City is required'),
    body('state').trim().notEmpty().isString().withMessage('State is required'),
    body('zip_code').trim().notEmpty().isString().withMessage('Zip Code is required and must be a valid zip code'),
]
const updatePasswordValidators = [
    body('password').isString().trim().notEmpty()
    .matches(/^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])(?!.*\s).{8,30}$/, 
    'The password must contain: 1 number, 1 uppercase letter, 1 lowercase letter, 1 special character, minimum of 8 characters, maximum of 30 characters')
    .withMessage('Password is required'),
]
const updateContactInfoValidators = [
    body('phone')
    .trim().notEmpty().isString()
    .matches(/^\(\d{3}\) \d{3}-\d{4}$/).withMessage('Phone number must be in the format (123) 456-7890')
    .isLength({ min: 14, max: 14 }).withMessage('Phone number must be 10 digits long'),
]

const updateUserValidators = (req, res, next) => {
    const resourceType = req.params.resourceType;
    console.log('calling validator', resourceType)

    let validationRules;
    switch (resourceType) {
        case 'payment_inf':
            console.log('validator for payment', resourceType)
            validationRules = updatePaymentInfoValidators;
            break;
        case 'personal_inf':
            console.log('validator for personal inf', resourceType)
            validationRules = updatePersonalInfoValidators;
            break;
        case 'contact_inf':
            console.log('validator for contact inf', resourceType)
            validationRules = updateContactInfoValidators;
            break;
        case 'address_inf':
            console.log('validator for phone', resourceType)
            validationRules = updateAddressInfoValidators;
        break;
        default:
            return res.status(400).json({ error: 'Invalid resource type' });
    }

    Promise.all(validationRules.map(rule => rule.run(req))).then(() => {
        next();
    })
};

const orderShippingInfoValidators = [
    body('delivery_date').optional().trim().notEmpty().toDate({ format: 'MM-DD-YYYY' }).withMessage('A delivery date is required'),
    body('shipping_address_id').optional().trim().notEmpty().isNumeric().withMessage('The address id is required and must be a number'),
    body('contact_info_id').optional().trim().notEmpty().isNumeric().withMessage('The phone id is required and must be a number') 
]

const updateCartValidators = [
    body('product_id').trim().notEmpty().isNumeric().withMessage('The product ID is required'),
    body('qty').trim().notEmpty().isNumeric().withMessage('The quantity is required')
]

const createCheckoutValidators = [
    body('delivery_date').trim().notEmpty().toDate({ format: 'MM-DD-YYYY' }).withMessage('Delivery date is required'),
    body('shipping_address_id').trim().notEmpty().isNumeric().withMessage('user address is required'),
    body('contact_info_id').trim().notEmpty().isNumeric().withMessage('The phone id is required and must be a number')
]

const cartItemValidators = [
    body('product_id').trim().notEmpty().isNumeric().withMessage('The product ID is required, must be a number, can not be zero'),
    body('qty').trim().notEmpty().isNumeric().withMessage('The quantity is required, must be a number, can not be zero')
]

const productFilterValidators = [
    body('color').optional().trim().notEmpty().isString().withMessage('The color is required, must be a string'),
    body('stem_length_cm').optional().trim().notEmpty().isNumeric().withMessage('The stem length is required, must be a number, represents cm'),
    body('bloom_size_cm').optional().trim().notEmpty().isNumeric().withMessage('The bloom size is required, must be a number, represents cm'),
    body('qty_per_case').optional().trim().notEmpty().isNumeric().withMessage('The quantity per case is required, must be a number, represents stems or bunches per case')
]

const searchTermValidators = [
    query('term').trim().notEmpty().isString().withMessage('the search term must be a string and can not be empty'),
]

const deleteBodyValidator = [
    body('product_id').trim().notEmpty().isNumeric().withMessage('The product ID is required, must be a number, can not be zero')
]

/*middlewares for routes */

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

const checkAuthenticated = (req, res, next) => {
    console.log('calling check authenticated')
    const auth = req.isAuthenticated()
    console.log(auth)
    if (req.isAuthenticated()) { 
        console.log('User is authenticated')
        return next() 
    }
    if(!req.isAuthenticated()){
        console.log('not authenticated')
        res.status(401).json({ error: 'Unauthorized' });
    }
}

const checkUserRole = (req, res, next) => {
    console.log('calling check user Role', req.user)
    if (req.user.role === 'client') { 
        console.log('User is authorized')
        return next() 
    }
    console.log('User is authenticated but not authorized');
    req.logout(err => {
        if (err) return next(err);
        res.status(403).json({ error: 'Unauthorized' });
    });   
}

const checkAdminRole = (req, res, next) => {
    console.log('calling check Admin Role', req.user)
    if (req.user.role === 'admin') { 
        console.log('admin is authorized')
        return next() 
    }
    console.log('User is authenticated but not authorized');
    req.logout(err => {
        if (err) return next(err);
        res.status(403).json({ error: 'Unauthorized' });
    });   
}

const errorHandler = (err, req, res, next) => {

    console.log('error received in error handler', err)
    const statusCode = err.status || 500;
    const message = err.message || 'Internal Server Error';
    const stack = err.stack || 'Stack was not provided';
    const error = err || 'Error object was not provided';

    console.error(`Error: ${statusCode} - ${message}\n${stack}\n${error}`);

    res.status(statusCode).json({        
        status: statusCode,
        error: message,
        stack: stack,
        customError: error
    });
};

module.exports = {
    checkAuthenticated,
    checkUserRole,
    checkAdminRole,
    handleValidationErrors,
    idParamsValidator,
    resourceValidator,
    categoryParamsValidator,
    updateUserValidators,
    updatePasswordValidators,
    signupValidators,
    loginValidators,
    orderShippingInfoValidators,
    updateCartValidators,
    createCheckoutValidators,
    cartItemValidators,
    productFilterValidators,
    searchTermValidators,
    deleteBodyValidator,
    errorHandler
}