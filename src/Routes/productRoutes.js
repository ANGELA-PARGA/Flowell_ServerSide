const express = require('express');
const router = express.Router();
const { idParamsValidator, checkAuthenticated, handleValidationErrors,
searchTermValidators, categoryParamsValidator, cartItemValidators } = require('../Utilities/expressValidators')
const {selectTotalProducts} = require('../DBQueries/productQueries')


const ProductService = require('../ServicesLogic/ProductService')
const CartsService = require('../ServicesLogic/CartService')

router.get('/', async (req, res, next) => {
    try {
        const limit = 6;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        const { color, category } = req.query;

        const bestProducts = await ProductService.loadAllProducts(limit, offset, { color, category });
        const totalProducts = await selectTotalProducts({ color, category });

        res.status(200).json({
            status: 'success',
            message: 'Products and categories retrieved successfully',
            code: 200,
            products_and_categories: bestProducts,
            pagination: {
                limit,
                page,
                totalPages: Math.ceil(totalProducts / limit),
                totalProducts: totalProducts
            },
        });
    } catch (err) {
        next(err);
    }
});


router.get('/search', searchTermValidators, handleValidationErrors,
            async (req, res, next) => {
    try {
        const data = req.query.term;
        const { color, category } = req.query;      

        console.log('calling api route for search products:', data, color, category)
        const response = await ProductService.findProductsBySearch(data, {color, category})

        res.status(200).json({
            status: 'success',
            message: 'Product(s) by search term retrieved succesfully',
            code: 200,
            product_found: response,
        });
    } catch(err) {
        next(err);
    }        
});

router.get('/categories', async (req, res, next) => {
    try {
        console.log('calling api route for getting all categories')
        
        const allCategories = await ProductService.loadAllCategories();
        res.status(200).json({
            status: 'success',
            message: 'categories retrieved succesfully',
            code: 200,
            products_and_categories: allCategories,
        });
    } catch(err) {
        next(err);
    }
});


router.get('/categories/:categoryId', categoryParamsValidator, handleValidationErrors, async (req, res, next) => {
    try {
        const limit = 6;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;
        const categoryId = parseInt(req.params.categoryId, 10);

        const { color } = req.query;
        console.log('calling api route for products by category with:', categoryId, limit, offset, color)

        const response = await ProductService.loadAllProductsByCategory(categoryId, limit, offset, { color })
        const totalProducts = await selectTotalProducts({ color, categoryId });

        res.status(200).json({
            status: 'success',
            message: 'Product(s) by category retrieved succesfully',
            code: 200,
            products_by_category: response, 
            pagination: {
                limit,
                page,
                totalPages: Math.ceil(totalProducts / limit),
                totalProducts: totalProducts
            },
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






