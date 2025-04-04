const express = require('express');
const router = express.Router();
const upload = require('../../config/multer');
const uploadImage = require('../../config/cloudinary')
const { idParamsValidator, handleValidationErrors,
        searchTermValidators, newProductValidators, updateStockValidator, updateProductValidators } = require('../../Utilities/expressValidators')
const { checkAuthenticated, checkAdminRole } = require('../../middleware/appMiddlewares')
const {selectTotalProductsDashboard} = require('../../DBQueries/productQueries')


const ProductAdminService = require('../../ServicesLogic/ServicesAdminLogic/productAdminService')

router.get('/', checkAuthenticated, checkAdminRole, async (req, res, next) => {
    try {
        const limit = 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        const search = req.query.term;

        const bestProducts = await ProductAdminService.loadAllProducts(limit, offset, search);
        const totalProducts = await selectTotalProductsDashboard(search);

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

router.get('/dashboard', checkAuthenticated, checkAdminRole, async (req, res, next) => {
    try {
        const products = await ProductAdminService.returnMostSold()

        res.status(200).json({
            status: 'success',
            message: 'The 3 most sold products retrieved successfully',
            code: 200,
            products: products, 
        });
    } catch(err) {
        next(err);
    }
});

router.get('/search', checkAuthenticated, checkAdminRole, searchTermValidators, handleValidationErrors,
            async (req, res, next) => {
    try {
        const data = req.query.term;
        const { color, category } = req.query;      

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

router.get('/:id', checkAuthenticated, checkAdminRole, idParamsValidator, handleValidationErrors, 
            async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
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

router.post('/', checkAuthenticated, checkAdminRole, upload.array('images_url', 3), newProductValidators, handleValidationErrors, async (req, res, next) => {
    try {          
        // ✅ 1. Extract text fields
        const data = req.body;

        // ✅ 2. Upload images to Cloudinary, here we have to use the buffer to 
        const imageUrls = await Promise.all(req.files.map(async (file) => {
            const buffer = file.buffer; 
            return await uploadImage(`data:image/jpeg;base64,${buffer.toString('base64')}`);
        }));
        
        // ✅ 3. Save product data + image URLs in the DB
        const newProduct = await ProductAdminService.createNewProduct({
            ...data,
            images_urls: imageUrls
        });

        res.status(200).json({
            status: 'success',
            message: 'Product created succesfully',
            code: 200,
            new_product: newProduct 
        });
    } catch(err) {
        next(err);
    }        
});


router.patch('/:id/product_details', checkAuthenticated, checkAdminRole, idParamsValidator, updateProductValidators, handleValidationErrors, 
    async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const details = req.body
        const response = await ProductAdminService.updateProductDetails({id, ...details});
        res.status(200).json({
            status: 'success',
            message: 'Product details updated succesfully',
            code: 200,
            product_updated: response 
        });
    } catch(err) {
        next(err);
    }
});

router.patch('/:id/stock', checkAuthenticated, checkAdminRole, idParamsValidator, updateStockValidator, handleValidationErrors, 
            async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const stock = req.body.stock
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