const express = require('express');
const router = express.Router();
const { idParamsValidator, checkAuthenticated, handleValidationErrors,
searchTermValidators, categoryParamsValidator, productFilterValidators, cartItemValidators } = require('../Utilities/expressValidators')

const ProductService = require('../ServicesLogic/ProductService')
const CartsService = require('../ServicesLogic/CartService')

router.get('/', async (req, res, next) => {
    try {
        console.log('calling api route for get products')
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
        console.log('calling api route for search products:', req.query.term)
        const data = req.query.term;
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
        console.log('calling api route for products by category')
        const categoryId = parseInt(req.params.categoryId, 10);
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
        console.log('calling api route for products filtering', req.body)
        const data = req.body;
        const categoryId = parseInt(req.params.categoryId, 10);
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
        console.log('calling api route for product by id')
        const id = parseInt(req.params.id, 10);
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

router.post('/:id', cartItemValidators, handleValidationErrors, async (req, res, next) => {
    try {
        console.log('calling api route for adding product to cart', req.body)
        const cart_info = await CartsService.getCartInfo(req.user.id)
        const cart_id = cart_info.id
        const data = req.body
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






