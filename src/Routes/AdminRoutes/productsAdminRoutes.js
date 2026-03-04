import express from 'express';
import upload from '../../config/multer.js';
import { 
    validateProductById,
    validateProductSearch, 
    validateNewProduct,
    validateProductUpdate, 
    validateStockUpdate
} from '../../middleware/expressValidators.js'
import { checkAuthenticated, checkAdminRole } from '../../middleware/appMiddlewares.js'
import productController from '../../controllers/adminControllers/productController.js';

const router = express.Router();

router.get('/', checkAuthenticated, checkAdminRole, productController.getAllProducts);

router.get('/dashboard', checkAuthenticated, checkAdminRole, productController.getDashboardProducts);

router.get('/search', checkAuthenticated, checkAdminRole, ...validateProductSearch, productController.searchProducts);

router.get('/:id', checkAuthenticated, checkAdminRole, ...validateProductById, productController.getProductById);

router.post('/', checkAuthenticated, checkAdminRole, upload.array('images_url', 3), ...validateNewProduct, productController.createProduct);

router.patch('/:id/product_details', checkAuthenticated, checkAdminRole, ...validateProductUpdate, productController.updateProductDetails);

router.patch('/:id/stock', checkAuthenticated, checkAdminRole, ...validateStockUpdate, productController.updateProductStock);

export default router;