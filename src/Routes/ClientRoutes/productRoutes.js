import express from 'express';
import { 
    idParamsValidator, 
    handleValidationErrors, 
    searchTermValidators, 
    categoryParamsValidator, 
    cartItemValidators
} from '../../Utilities/expressValidators.js'
import { checkAuthenticated } from '../../middleware/appMiddlewares.js'
import { productService, cartService } from '../../config/container.js'

const router = express.Router();
router.get('/', async (req, res, next) => {
    try {
        const limit = 6;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        const { color, category } = req.query;

        const bestProducts = await productService.loadAllProducts(limit, offset, { color, category });
        const totalProducts = await productService.returnTotalNumber({ color, category });

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
        const response = await productService.findProductsBySearch(data, {color, category})

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
        const allCategories = await productService.loadAllCategories();
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

        const response = await productService.loadAllProductsByCategory(categoryId, limit, offset, { color })
        const totalProducts = await productService.returnTotalNumber({ color, categoryId });

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
        const response = await productService.loadSpecificProduct(id)
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
        const cart_info = await cartService.getCartInfo(req.user.id)
        const cart_id = cart_info.id
        const data = req.body
        const response = await cartService.addProductToCart({cart_id, ...data})
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

export default router;






