const { body, query, param, validationResult } = require('express-validator');

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

const updateUserValidators = [
    body('first_name').optional().trim().notEmpty().isString().withMessage('First name is required'),
    body('last_name').optional().trim().notEmpty().isString().withMessage('Last name is required'),
    body('password').optional().trim().notEmpty().isString().withMessage('Password is required'),
    body('phone').optional().trim().notEmpty().isString().withMessage('Phone is required'),
    body('address').optional().trim().notEmpty().isString().withMessage('Address is required'),
    body('city').optional().trim().notEmpty().isString().withMessage('City is required'),
    body('state').optional().trim().notEmpty().isString().withMessage('State is required'),
    body('zip_code').optional().trim().notEmpty().isString().withMessage('Zip Code is required and must be a valid zip code'),
    body('credit_card').optional().trim().notEmpty().isNumeric().withMessage('Credit Card number is required'),
    body('holder').optional().trim().notEmpty().isString().withMessage('Credit card holder is required'),
    body('expiration_date').optional().trim().notEmpty().toDate({ format: 'YYYY-MM-DD' }).withMessage('expired information is required')
]

const orderShippingInfoValidators = [
    body('delivery_date').optional().trim().notEmpty().toDate({ format: 'YYYY-MM-DD' }).withMessage('A delivery date is required'),
    body('shipping_address_id').optional().trim().notEmpty().isNumeric().withMessage('The address id is required and must be a number'),
    body('contact_info_id').optional().trim().notEmpty().isNumeric().withMessage('The phone id is required and must be a number') 
]

const orderedItemsInfoValidators = [
    body('items').notEmpty().isArray().notEmpty().withMessage('The new product/items with their qty are required')      
]

const updateCartValidators = [
    body('product_id').trim().notEmpty().isNumeric().withMessage('The product ID is required'),
    body('qty').trim().notEmpty().isNumeric().withMessage('The quantity is required')
]

const createCheckoutValidators = [
    body('delivery_date').trim().notEmpty().toDate({ format: 'YYYY-MM-DD' }).withMessage('Delivery date is required'),
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

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
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

const errorHandler = (err, req, res, next) => {
    const statusCode = err.status || 500;
    const message = err.message || 'Internal Server Error';
    const stack = err.stack || 'Stack was not provided';
    const error = err.error || 'Error object was not provided';

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
    handleValidationErrors,
    idParamsValidator,
    resourceValidator,
    categoryParamsValidator,
    updateUserValidators,
    signupValidators,
    loginValidators,
    orderShippingInfoValidators,
    orderedItemsInfoValidators,
    updateCartValidators,
    createCheckoutValidators,
    cartItemValidators,
    productFilterValidators,
    searchTermValidators,
    deleteBodyValidator,
    errorHandler
}