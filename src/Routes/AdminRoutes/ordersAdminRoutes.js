import express from 'express';
import { 
    validateId, 
    validateOrderShippingUpdate,
    validateOrderDeliveryUpdate, 
    validateOrderItemsUpdate,
    validateOrderShipping
} from '../../middleware/expressValidators.js'
import { checkAuthenticated, checkAdminRole } from '../../middleware/appMiddlewares.js'
import orderController from '../../controllers/adminControllers/orderController.js';

const router = express.Router();

router.get('/', checkAuthenticated, checkAdminRole, orderController.getAllOrders);

router.get('/dashboard', checkAuthenticated, checkAdminRole, orderController.getDashboardOrders);

router.get('/:id', checkAuthenticated, checkAdminRole, ...validateId, orderController.getOrderById);

router.patch('/:id', checkAuthenticated, checkAdminRole, ...validateId, orderController.cancelOrder);

router.patch('/:id/shipping_info', checkAuthenticated, checkAdminRole, ...validateOrderShippingUpdate, orderController.updateShippingInfo);

router.patch('/:id/delivery_date', checkAuthenticated, checkAdminRole, ...validateOrderDeliveryUpdate, orderController.updateDeliveryDate);

router.patch('/:id/items_ordered', checkAuthenticated, checkAdminRole, ...validateOrderItemsUpdate, orderController.updateOrderItems);

router.patch('/:id/ship_order', checkAuthenticated, checkAdminRole, ...validateOrderShipping, orderController.shipOrder);

export default router;