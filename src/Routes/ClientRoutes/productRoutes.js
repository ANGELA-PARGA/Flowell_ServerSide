import express from 'express';
import { 
    validateProductById, 
    validateProductSearch, 
    validateCategory, 
    validateCartItem
} from '../../middleware/expressValidators.js';
import { checkAuthenticated } from '../../middleware/appMiddlewares.js';
import productController from '../../controllers/clientControllers/productController.js';

const router = express.Router();

router.get('/', productController.getAllProducts);

router.get('/search', ...validateProductSearch, productController.searchProducts);

router.get('/categories', productController.getAllCategories);

router.get('/categories/:categoryId', ...validateCategory, productController.getProductsByCategory);

router.get('/:id', ...validateProductById, productController.getProductById);

router.post('/', checkAuthenticated, ...validateCartItem, productController.addToCart);

export default router;






