const express = require('express');
const router = express.Router();
const { idParamsValidator, handleValidationErrors,
        searchTermValidators, newProductValidators, updateStockValidator } = require('../../Utilities/expressValidators')
const { checkAuthenticated, checkAdminRole } = require('../../middleware/appMiddlewares')
const {selectTotalProducts} = require('../../DBQueries/productQueries')


const ProductAdminService = require('../../ServicesLogic/ServicesAdminLogic/productAdminService')

router.get('/', /*checkAuthenticated, checkAdminRole,*/ async (req, res, next) => {
    try {
        const limit = 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        const search = req.query.term;

        const bestProducts = await ProductAdminService.loadAllProducts(limit, offset, search);
        const totalProducts = await selectTotalProducts(search);

        res.status(200).json({
            status: 'success',
            message: 'Products and categories retrieved successfully',
            code: 200,
            products: bestProducts,
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


router.get('/search', /*checkAuthenticated, checkAdminRole,*/ searchTermValidators, handleValidationErrors,
            async (req, res, next) => {
    try {
        const data = req.query.term;
        const { color, category } = req.query;      

        console.log('calling api route for search products:', data, color, category)
        const response = await ProductAdminService.findProductsBySearch(data, {color, category})

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

router.get('/:id', /*checkAuthenticated, checkAdminRole,*/ idParamsValidator, handleValidationErrors, 
            async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        console.log('calling api route for product by id:', id)
        const response = await ProductAdminService.loadSpecificProduct(id)
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

router.post('/', /*checkAuthenticated, checkAdminRole,*/ newProductValidators, handleValidationErrors, async (req, res, next) => {
    try {
        const data = req.body
        console.log('calling api route for creating a new product', data)
        const response = await ProductAdminService.createNewProduct({...data})
        res.status(200).json({
            status: 'success',
            message: 'Product created succesfully',
            code: 200,
            new_product: response 
        });
    } catch(err) {
        next(err);
    }        
});


router.patch('/:id', /*checkAuthenticated, checkAdminRole,*/ idParamsValidator, updateStockValidator, handleValidationErrors, 
            async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const stock = req.body.stock
        console.log('calling api route to update product stock by id:', id, stock)
        const response = await ProductAdminService.updateProductStock({product_id:id, new_qty:stock});
        res.status(200).json({
            status: 'success',
            message: 'Product stock updated succesfully',
            code: 200,
            product_updated: response 
        });
    } catch(err) {
        next(err);
    }
});


module.exports = router;