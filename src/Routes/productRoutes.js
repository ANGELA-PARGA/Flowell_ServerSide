const express = require('express');
const router = express.Router();
const { idParamsValidator, checkAuthenticated, handleValidationErrors,
searchTermValidators, categoryParamsValidator, productFilterValidators, cartItemValidators } = require('../Utilities/expressValidators')

const ProductService = require('../ServicesLogic/ProductService')
const CartsService = require('../ServicesLogic/CartService')

router.get('/', async (req, res, next) => {
    try {
        console.log('calling api route for getting products:')
        const bestProducts = await ProductService.loadAllProducts(); 
        const allCategories = await ProductService.loadAllCategories();
        res.status(200).json({
            status: 'success',
            message: 'Products and categories retrieved succesfully',
            code: 200,
            products_and_categories: [bestProducts, allCategories] 
        });
    } catch(err) {
        next(err);
    }
});

router.get('/search', searchTermValidators, handleValidationErrors,
            async (req, res, next) => {
    try {
        const data = req.query.term;
        console.log('calling api route for search products:', data)
        const response = await ProductService.findProductsBySearch(data)
        res.status(200).json({
            status: 'success',
            message: 'Product(s) by search term retrieved succesfully',
            code: 200,
            product_found: response 
        });
    } catch(err) {
        next(err);
    }        
});



router.get('/categories/:categoryId', categoryParamsValidator, handleValidationErrors, async (req, res, next) => {
    try {
        const categoryId = parseInt(req.params.categoryId, 10);
        console.log('calling api route for products by category with:', categoryId)
        const response = await ProductService.loadAllProductsByCategory(categoryId)
        res.status(200).json({
            status: 'success',
            message: 'Product(s) by category retrieved succesfully',
            code: 200,
            products_by_category: response 
        });
    } catch(err) {
        next(err);
    }        
});


router.post('/categories/:categoryId', categoryParamsValidator, 
            productFilterValidators, handleValidationErrors,  async (req, res, next) => {
    try {
        const data = req.body;
        const categoryId = parseInt(req.params.categoryId, 10);
        console.log('calling api route for products filtering with:', data, categoryId)
        const response = await ProductService.findProductsByFilter({category_id: categoryId,...data})
        res.status(200).json({
            status: 'success',
            message: 'Product(s) by category and filter retrieved succesfully',
            code: 200,
            product_found: response 
        });
    } catch(err) {
        next(err);
    }        
});

router.get('/:id', idParamsValidator, handleValidationErrors, 
            async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        console.log('calling api route for product by id:', id)
        const response = await ProductService.loadSpecificProduct(id)
        res.status(200).json({
            status: 'success',
            message: 'Product retrieved succesfully',
            code: 200,
            product_found: response 
        });
    } catch(err) {
        next(err);
    }
});

router.post('/', checkAuthenticated, cartItemValidators, handleValidationErrors, async (req, res, next) => {
    try {
        const cart_info = await CartsService.getCartInfo(req.user.id)
        const cart_id = cart_info.id
        const data = req.body
        console.log('calling api route for adding product to cart', data, cart_id)
        const response = await ProductService.addProductToCart({cart_id, ...data})
        res.status(200).json({
            status: 'success',
            message: 'Product added to cart succesfully',
            code: 200,
            product_found: response 
        });
    } catch(err) {
        next(err);
    }        
});


module.exports = router;






