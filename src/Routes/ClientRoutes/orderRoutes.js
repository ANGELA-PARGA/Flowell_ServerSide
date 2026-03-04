import express from 'express';
import { 
    validateOrderById,
    validateOrderCancel,
    validateOrderShippingUpdate,
    validateOrderDeliveryUpdate
} from '../../middleware/expressValidators.js';
import { checkAuthenticated } from '../../middleware/appMiddlewares.js';
import orderController from '../../controllers/clientControllers/orderController.js';

const router = express.Router();

router.get('/', checkAuthenticated, orderController.getUserOrders);

router.get('/:id', checkAuthenticated, ...validateOrderById, orderController.getOrderById);

router.patch('/:id', checkAuthenticated, ...validateOrderCancel, orderController.cancelOrder);

router.patch('/:id/shipping_info', checkAuthenticated, ...validateOrderShippingUpdate, orderController.updateShippingInfo);

router.patch('/:id/delivery_date', checkAuthenticated, ...validateOrderDeliveryUpdate, orderController.updateDeliveryDate);

export default router;