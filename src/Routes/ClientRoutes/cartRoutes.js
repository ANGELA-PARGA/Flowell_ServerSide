import express from 'express';
import { 
    validateId,
    validateCartUpdate,
    validateCheckout
} from '../../middleware/expressValidators.js';
import { checkAuthenticated } from '../../middleware/appMiddlewares.js';
import cartController from '../../controllers/clientControllers/cartController.js';

const router = express.Router();

router.get('/', checkAuthenticated, cartController.getCartInfo);

router.patch('/', checkAuthenticated, ...validateCartUpdate, cartController.updateCartItems);

router.post('/checkout', checkAuthenticated, ...validateCheckout, cartController.createCheckout);

router.delete('/', checkAuthenticated, cartController.emptyCart);

router.delete('/:id', checkAuthenticated, ...validateId, cartController.deleteCartItem);

export default router;

