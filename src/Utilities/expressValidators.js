const { body, query, param, validationResult } = require('express-validator');
const { luhnCheck } = require('./utilities')

const idParamsValidator = [
    param('id').trim().notEmpty().isInt().withMessage('An ID is required and must be a number') 
]

const resourceValidator = [
    param('resourceType').trim().optional().notEmpty().isString().withMessage('The resource type is required'),
    param('resourceId').trim().optional().notEmpty().isInt().withMessage('The resource ID to delete is required and must be a number') 
]

const categoryParamsValidator = [
    param('categoryId').trim().optional().notEmpty().isInt().withMessage('The category ID is required and must be a number') 
]

const signupValidators = [
    body('first_name').trim().notEmpty().isString().escape().withMessage('First name is required'),
    body('last_name').trim().notEmpty().isString().escape().withMessage('Last name is required'),
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


const updatePersonalInfoValidators = [
    body('first_name').trim().notEmpty().isString().isLength({ min: 2 }).withMessage('First name must be at least 2 characters long'),
    body('last_name').trim().notEmpty().isString().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters long'),
]
/*const updatePaymentInfoValidators = [
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
]*/
const updateAddressInfoValidators = [
    body('address').trim().notEmpty().isString().withMessage('Address is required'),
    body('city').trim().notEmpty().isString().withMessage('City is required'),
    body('state').trim().notEmpty().isString().withMessage('State is required'),
    body('zip_code').trim().notEmpty().isString().withMessage('Zip Code is required and must be a valid zip code'),
]
const updatePasswordValidators = [
    body('password')
        .trim()        
        .notEmpty().withMessage('Password is required')
        .isString()
        .matches(/^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])(?!.*\s).{8,30}$/)
        .withMessage('The password must contain: 1 number, 1 uppercase letter, 1 lowercase letter, 1 special character, minimum of 8 characters, maximum of 30 characters'),
];

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
    body('address').trim().notEmpty().isString().withMessage('Address is required'),
    body('city').trim().notEmpty().isString().withMessage('City is required'),
    body('state').trim().notEmpty().isString().withMessage('State is required'),
    body('zip_code').trim().notEmpty().isString().withMessage('Zip Code is required and must be a valid zip code'),
    body('contact_phone')
    .trim().notEmpty().isString()
    .matches(/^\(\d{3}\) \d{3}-\d{4}$/).withMessage('Phone number must be in the format (123) 456-7890')
    .isLength({ min: 14, max: 14 }).withMessage('Phone number must be 10 digits long'),
]

const orderDeliveryInfoValidator = [
    body('delivery_date').trim().notEmpty().toDate({ format: 'MM-DD-YYYY' }).withMessage('A delivery date is required'),
]

const updateCartValidators = [
    body('product_id').trim().notEmpty().isInt().withMessage('The product ID is required'),
    body('qty').trim().notEmpty().isInt().withMessage('The quantity is required')
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
    body('address').trim().notEmpty().isString().withMessage('Address is required'),
    body('city').trim().notEmpty().isString().withMessage('City is required'),
    body('state').trim().notEmpty().isString().withMessage('State is required'),
    body('zip_code').trim().notEmpty().isString().withMessage('Zip Code is required and must be a valid zip code'),
    body('contact_phone')
    .trim().notEmpty().isString()
    .matches(/^\(\d{3}\) \d{3}-\d{4}$/).withMessage('Phone number must be in the format (123) 456-7890')
    .isLength({ min: 14, max: 14 }).withMessage('Phone number must be 10 digits long'),
]

const searchTermValidators = [
    query('term').trim().notEmpty().isString().withMessage('the search term must be a string and can not be empty'),
]

const newProductValidators = [
    body('category_id').trim().notEmpty().withMessage('Category id is required').isInt().withMessage('Category id must be a number and is required'),
    body('name').trim().notEmpty().isString().withMessage('Product name is required'),
    body('description').trim().notEmpty().isString().withMessage('Product description is required'),
    body('color').trim().notEmpty().isString().withMessage('Color is required'),
    body('stem_length_cm').trim().notEmpty().isInt().withMessage('stem_length_cm is required'),
    body('bloom_size_cm').trim().notEmpty().isInt().withMessage('bloom_size_cm is required'),
    body('blooms_per_stem').trim().notEmpty().isInt().withMessage('blooms_per_stem is required'),
    body('life_in_days').trim().notEmpty().isInt().withMessage('life_in_days is required'),
    body('qty_per_case').trim().notEmpty().isInt().withMessage('qty_per_case is required'),
    body('measure_per_case').trim().notEmpty().isInt().withMessage('measure_per_case is required'),
    body('price_per_case').trim().notEmpty().isFloat().withMessage('price_per_case is required'),
    body('images_urls').trim().notEmpty().isArray().withMessage('images_urls is required'),
    body('stock_available').trim().notEmpty().isInt().withMessage('blooms_per_stem is required'),
    body('qty_purchased').trim().notEmpty().isInt().withMessage('life_in_days is required')
]

const updateStockValidator = [
    body('stock').trim().notEmpty().isInt().withMessage('The stock quantity is required and must be a positive number')
]

/*middleware for routes handle validation errors */

const handleValidationErrors = (req, res, next) => {
    console.log('calling validation errors')
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        const error = new Error('Validation failed')
        error.status = 400
        error.details = errors.array()
        return next(error)
    }
    next()    
}

module.exports = {
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
    orderedItemsValidators,
    updateStockValidator
}