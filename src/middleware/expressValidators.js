import {body, query, param, validationResult } from 'express-validator';
import { createValidationError } from '../Utilities/errorStandard.js';

/*VALIDATORS----------------------- */

const idParamsValidator = [
    param('id').trim().notEmpty().withMessage('An ID is required') 
]

const resourceValidator = [
    param('resourceType').optional().trim().notEmpty().isString().withMessage('The resource type is required'),
    param('resourceId').optional().trim().notEmpty().withMessage('The resource ID to delete is required') 
]

const categoryParamsValidator = [
    param('categoryId').trim().optional().notEmpty().withMessage('The category ID is required') 
]

const signupValidators = [
    body('first_name').trim().notEmpty().isString().escape().isLength({ min: 2, max: 50 }).withMessage('First name is required, must be at least 2 characters long and not too long'),
    body('last_name').trim().notEmpty().isString().escape().isLength({ min: 2, max: 50 }).withMessage('Last name is required, must be at least 2 characters long and not too long'),
    body('email').trim().normalizeEmail({gmail_remove_dots: false}).notEmpty().isEmail().withMessage('Invalid email address, a valid email is required'),
    body('password')
        .trim()
        .notEmpty().withMessage('Password is required')
        .isString()       
        .matches(/^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])(?!.*\s).{8,30}$/)
        .withMessage('The password must contain: 1 number, 1 uppercase letter, 1 lowercase letter, 1 special character, minimum of 8 characters, maximum of 30 characters'),
]

const loginValidators = [
    body('email').trim().normalizeEmail({gmail_remove_dots: false}).notEmpty().isEmail().withMessage('Invalid email address, a valid email is required'),
    body('password').trim().notEmpty().isString().withMessage('Password is required, and must not be empty'),
]

const recoverEmailValidator = [
    body('email').trim().normalizeEmail({gmail_remove_dots: false}).notEmpty().isEmail().withMessage('Invalid email address, a valid email is required')
]

const changePasswordOnRecoveryValidator = [
    body('password')
        .trim()        
        .notEmpty().withMessage('Password is required')
        .isString()
        .matches(/^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])(?!.*\s).{8,30}$/)
        .withMessage('The password must contain: 1 number, 1 uppercase letter, 1 lowercase letter, 1 special character, minimum of 8 characters, maximum of 30 characters'),
    body('status').trim().notEmpty().isString().withMessage('A token is required')
]

const createPersonalInfoValidators = [
    body('first_name').trim().notEmpty().isString().escape().isLength({ min: 2, max: 50 }).withMessage('First name must be at least 2 characters long and not too long'),
    body('last_name').trim().notEmpty().isString().escape().isLength({ min: 2, max: 50 }).withMessage('Last name must be at least 2 characters long and not too long'),
]

const updatePersonalInfoValidators = [
    body('first_name').optional().trim().notEmpty().isString().escape().isLength({ min: 2, max: 50 }).withMessage('First name must be at least 2 characters long and not too long'),
    body('last_name').optional().trim().notEmpty().isString().escape().isLength({ min: 2, max: 50 }).withMessage('Last name must be at least 2 characters long and not too long'),
]

const createAddressInfoValidators = [
    body('address').trim().notEmpty().isString().escape().isLength({ min: 2, max: 60 }).withMessage('Address is required'),
    body('city').trim().notEmpty().isString().escape().isLength({ min: 2, max: 50 }).withMessage('City is required'),
    body('state').trim().notEmpty().isString().escape().isLength({ min: 2, max: 50 }).withMessage('State is required'),
    body('zip_code').trim().notEmpty().isString().escape().matches(/^\d{5}$/).withMessage('Zip Code is required and must be a valid zip code, must be exactly 5 digits'),
]

const updateAddressInfoValidators = [
    body('address').optional().trim().notEmpty().isString().escape().isLength({ min: 2, max: 60 }).withMessage('Address is required'),
    body('city').optional().trim().notEmpty().isString().escape().isLength({ min: 2, max: 50 }).withMessage('City is required'),
    body('state').optional().trim().notEmpty().isString().escape().isLength({ min: 2, max: 50 }).withMessage('State is required'),
    body('zip_code').optional().trim().notEmpty().isString().escape().matches(/^\d{5}$/).withMessage('Zip Code is required and must be a valid zip code, must be exactly 5 digits'),
]

const createContactInfoValidators = [
    body('phone')
    .trim().notEmpty().isString()
    .matches(/^\(\d{3}\) \d{3}-\d{4}$/).withMessage('Phone number must be in the format (123) 456-7890')
    .isLength({ min: 14, max: 14 }).withMessage('Phone number must be 10 digits long'),
]

const updateContactInfoValidators = [
    body('phone')
    .trim().notEmpty().isString()
    .matches(/^\(\d{3}\) \d{3}-\d{4}$/).withMessage('Phone number must be in the format (123) 456-7890')
    .isLength({ min: 14, max: 14 }).withMessage('Phone number must be 10 digits long'),
]

const updatePasswordValidators = [
    body('password')
        .trim()        
        .notEmpty().withMessage('Password is required')
        .isString()
        .matches(/^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])(?!.*\s).{8,30}$/)
        .withMessage('The password must contain: 1 number, 1 uppercase letter, 1 lowercase letter, 1 special character, minimum of 8 characters, maximum of 30 characters'),
];

const updateUserValidators = (req, res, next) => {
    const resourceType = req.params.resourceType;

    let validationRules;
    switch (resourceType) {
        case 'personal_inf':
            validationRules = updatePersonalInfoValidators;
            break;
        case 'contact_inf':
            validationRules = updateContactInfoValidators;
            break;
        case 'address_inf':
            validationRules = updateAddressInfoValidators;
        break;
        default:
            return res.status(400).json({ error: 'Invalid resource type' });
    }

    Promise.all(validationRules.map(rule => rule.run(req))).then(() => {
        next();
    })
};

const createUserValidators = (req, res, next) => {
    const resourceType = req.params.resourceType;

    let validationRules;
    switch (resourceType) {
        case 'personal_inf':
            validationRules = createPersonalInfoValidators;
            break;
        case 'contact_inf':
            validationRules = createContactInfoValidators;
            break;
        case 'address_inf':
            validationRules = createAddressInfoValidators;
        break;
        default:
            return res.status(400).json({ error: 'Invalid resource type' });
    }

    Promise.all(validationRules.map(rule => rule.run(req))).then(() => {
        next();
    })
};

const orderShippingInfoValidators = [
    body('address').trim().optional().isString().escape().withMessage('Address is required'),
    body('city').trim().optional().isString().escape().withMessage('City is required'),
    body('state').trim().optional().isString().escape().withMessage('State is required'),
    body('zip_code').trim().optional().isString().escape().matches(/^\d{5}$/).withMessage('Zip Code is required and must be a valid zip code, must be exactly 5 digits'),
    body('phone')
    .trim().optional().isString()
    .matches(/^\(\d{3}\) \d{3}-\d{4}$/).withMessage('Phone number must be in the format (123) 456-7890')
    .isLength({ min: 14, max: 14 }).withMessage('Phone number must be 10 digits long'),
]

const orderDeliveryInfoValidator = [
    body('delivery_date').trim().notEmpty().toDate({ format: 'MM-DD-YYYY' }).withMessage('A delivery date is required'),
]

const updateCartValidators = [
    body('product_id').trim().notEmpty().isInt().withMessage('The product ID is required'),
    body('qty').trim().notEmpty().isInt().withMessage('The quantity is required'),
]

const cartItemValidators = [
    body('product_id').trim().notEmpty().isInt().withMessage('The product ID is required, must be a number, can not be zero'),
    body('qty').trim().notEmpty().isInt().withMessage('The quantity is required, must be a number, can not be zero')
]

const orderedItemsValidators = [
    body('product_id').trim().notEmpty().isInt().withMessage('The product ID is required, must be a number, can not be zero'),
    body('qty').trim().notEmpty().isInt().withMessage('The quantity is required, must be a number, can not be zero')
]

const createCheckoutValidators = [
    body('delivery_date').trim().notEmpty().toDate({ format: 'MM-DD-YYYY' }).withMessage('Delivery date is required'),
    body('address').trim().notEmpty().isString().escape().withMessage('Address is required'),
    body('city').trim().notEmpty().isString().escape().withMessage('City is required'),
    body('state').trim().notEmpty().isString().escape().withMessage('State is required'),
    body('zip_code').trim().notEmpty().isString().escape().matches(/^\d{5}$/).withMessage('Zip Code is required and must be a valid zip code, must be exactly 5 digits'),
    body('phone')
    .trim().notEmpty().isString()
    .matches(/^\(\d{3}\) \d{3}-\d{4}$/).withMessage('Phone number must be in the format (123) 456-7890')
    .isLength({ min: 14, max: 14 }).withMessage('Phone number must be 10 digits long'),
]

const searchTermValidators = [
    query('term').trim().notEmpty().isString().escape().withMessage('the search term must be a string and can not be empty'),
]

const newProductValidators = [
    body('category_id').trim().notEmpty().withMessage('Category id is required').isInt().withMessage('Category id must be a number and is required'),
    body('name').trim().notEmpty().isString().escape().withMessage('Product name is required'),
    body('description').trim().notEmpty().isString().escape().withMessage('Product description is required'),
    body('color').trim().notEmpty().isString().withMessage('Color is required'),
    body('stem_length_cm').trim().notEmpty().isInt().withMessage('stem_length_cm is required'),
    body('bloom_size_cm').trim().notEmpty().isFloat().withMessage('bloom_size_cm is required'),
    body('blooms_per_stem').trim().notEmpty().isInt().withMessage('blooms_per_stem is required'),
    body('life_in_days').trim().notEmpty().isInt().withMessage('life_in_days is required'),
    body('qty_per_case').trim().notEmpty().isInt().withMessage('qty_per_case is required'),
    body('measure_per_case').trim().notEmpty().isString().withMessage('measure_per_case is required'),
    body('price_per_case').trim().notEmpty().isFloat().withMessage('price_per_case is required'),
    body('stock_available').trim().notEmpty().isInt().withMessage('blooms_per_stem is required'),
]

const updateProductValidators  = [
    body('category_id').trim().optional().isInt().withMessage('Category id must be a number and is required'),
    body('name').trim().optional().isString().escape().withMessage('Product name is required'),
    body('description').trim().optional().isString().escape().withMessage('Product description is required'),
    body('color').trim().optional().isString().withMessage('Color is required'),
    body('stem_length_cm').trim().optional().isInt().withMessage('stem_length_cm is required'),
    body('bloom_size_cm').trim().optional().isInt().withMessage('bloom_size_cm is required'),
    body('blooms_per_stem').trim().optional().isInt().withMessage('blooms_per_stem is required'),
    body('life_in_days').trim().optional().isInt().withMessage('life_in_days is required'),
    body('qty_per_case').trim().optional().isInt().withMessage('qty_per_case is required'),
    body('measure_per_case').trim().optional().isInt().withMessage('measure_per_case is required'),
    body('price_per_case').trim().optional().isFloat().withMessage('price_per_case is required'),
]

const updateStockValidator = [
    body('stock').trim().notEmpty().isInt().withMessage('The stock quantity is required and must be a number'),
]

const trackingValidator = [
    body('tracking')
    .trim().notEmpty().isString()
    .matches(/^\d{12}$/).withMessage('Tracking number must be 12 digits')
    .isLength({ min: 12, max: 12 }).withMessage('Tracking number must be 12 digits long'),
]

const chatMessageValidator = [
    body('message').trim().isLength({ min: 1, max: 1000 })
        .withMessage('Message must be between 1 and 1000 characters')
]

const topicDocumentValidator = [
    body('topic').optional().trim().isLength({ max: 100 })
        .withMessage('Topic must be less than 100 characters')
]

/*middleware for handling validation errors */

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    console.log('Validation errors:', req.param);
    if (!errors.isEmpty()) {
        const errorDetails = errors.array().map(error => ({
            field: error.path || error.param,
            message: error.msg,
        }));
        
        const validationError = createValidationError(
            'Validation failed',
            errorDetails
        );
        
        return next(validationError);
    }
    next();    
}

/*COMPOSITE VALIDATORS - Factory function */
const createValidator = (...validators) => [
    ...validators.flat(),
    handleValidationErrors
];

// Authentication validators
const validateLogin = createValidator(loginValidators);
const validateSignup = createValidator(signupValidators);
const validateRecoverEmail = createValidator(recoverEmailValidator);
const validatePasswordRecovery = createValidator(changePasswordOnRecoveryValidator);

// ID parameter validators
const validateId = createValidator(idParamsValidator);
const validateIdAndResource = createValidator(resourceValidator);
const validateCategory = createValidator(categoryParamsValidator);

// User profile validators  
const validatePasswordUpdate = createValidator(updatePasswordValidators);

// Order validators
const validateOrderById = createValidator(idParamsValidator);
const validateOrderCancel = createValidator(idParamsValidator);
const validateOrderShippingUpdate = createValidator(idParamsValidator, orderShippingInfoValidators);
const validateOrderDeliveryUpdate = createValidator(idParamsValidator, orderDeliveryInfoValidator);
const validateOrderItemsUpdate = createValidator(idParamsValidator, orderedItemsValidators);
const validateOrderShipping = createValidator(idParamsValidator, trackingValidator);

// Cart validators
const validateCartUpdate = createValidator(updateCartValidators);
const validateCartItem = createValidator(cartItemValidators);

// Product validators
const validateProductById = createValidator(idParamsValidator);
const validateProductSearch = createValidator(searchTermValidators);
const validateNewProduct = createValidator(newProductValidators);
const validateProductUpdate = createValidator(idParamsValidator, updateProductValidators);
const validateStockUpdate = createValidator(idParamsValidator, updateStockValidator);

// Checkout validators
const validateCheckout = createValidator(createCheckoutValidators);

// Chat validators  
const validateChatMessage = createValidator(chatMessageValidator);
const validateTopicDocument = createValidator(topicDocumentValidator);

export {
    handleValidationErrors,
    idParamsValidator,
    resourceValidator,
    categoryParamsValidator,
    updateUserValidators,
    updatePasswordValidators,
    signupValidators,
    loginValidators,
    recoverEmailValidator,
    changePasswordOnRecoveryValidator,
    orderShippingInfoValidators,
    orderDeliveryInfoValidator,
    updateCartValidators,
    createCheckoutValidators,
    cartItemValidators,
    searchTermValidators,
    newProductValidators,
    updateProductValidators,
    orderedItemsValidators,
    updateStockValidator,
    trackingValidator,
    chatMessageValidator,
    topicDocumentValidator,
    createUserValidators,
    
    // New composite validators
    validateLogin,
    validateSignup,
    validateRecoverEmail,
    validatePasswordRecovery,
    validateId,
    validateIdAndResource,
    validateCategory,
    validatePasswordUpdate,
    validateOrderById,
    validateOrderCancel,
    validateOrderShippingUpdate,
    validateOrderDeliveryUpdate,
    validateOrderItemsUpdate,
    validateOrderShipping,
    validateCartUpdate,
    validateCartItem,
    validateProductById,
    validateProductSearch,
    validateNewProduct,
    validateProductUpdate,
    validateStockUpdate,
    validateCheckout,
    validateChatMessage,
    validateTopicDocument
}