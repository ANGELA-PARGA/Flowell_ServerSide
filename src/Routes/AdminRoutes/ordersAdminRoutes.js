import express from 'express';
import { idParamsValidator, 
        orderShippingInfoValidators, 
        orderDeliveryInfoValidator,
        orderedItemsValidators, 
        trackingValidator, 
        handleValidationErrors 
} from '../../Utilities/expressValidators.js'
import { checkAuthenticated, checkAdminRole } from '../../middleware/appMiddlewares.js'
import { orderService } from '../../config/container.js'

const router = express.Router();
router.get('/', checkAuthenticated, checkAdminRole, async (req, res, next) => {
    try {
        const limit = 5;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;
        const search = req.query.term;

        const orders = await orderService.loadAllOrders(limit, offset, search);
        const totalOrders = await orderService.returnTotalNumber(search);

        res.status(200).json({
            status: 'success',
            message: 'Orders retrieved successfully',
            code: 200,
            orders: orders,
            pagination: {
                limit,
                page,
                totalPages: Math.ceil(totalOrders / limit),
                totalOrders: totalOrders
            }, 
        });
    } catch(err) {
        next(err);
    }
});

router.get('/dashboard', checkAuthenticated, checkAdminRole, async (req, res, next) => {
    try {
        const {ordersByStatus: ordersByStatus, ordersByMonth: ordersByMonth, monthWithMostOrders: monthWithMostOrders} = await orderService.loadGroupedOrders()
        res.status(200).json({
            status: 'success',
            message: 'Grouped orders retrieved successfully',
            code: 200,
            orders: ordersByStatus, 
            ordersByMonth: ordersByMonth,
            monthWithMostOrders: monthWithMostOrders
        });
    } catch(err) {
        next(err);
    }
});

router.get('/:id', checkAuthenticated, checkAdminRole, idParamsValidator, handleValidationErrors, 
    async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            const response = await orderService.findOrder(id);
            res.status(200).json({
                status: 'success',
                message: 'Order retrieved successfully',
                code: 200,
                order: response 
            });
        } catch(err) {
            next(err);
        }
});

router.patch('/:id', checkAuthenticated, checkAdminRole, idParamsValidator, 
                handleValidationErrors, async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const response = await orderService.adminCancelOrder(id);
        res.status(200).send({
            status: 'success',
            message: 'Order cancelled successfully',
            code: 204,
            order_cancelled: response 
        });
    } catch(err) {
        next(err);
    }        
});


router.patch('/:id/shipping_info', checkAuthenticated, checkAdminRole, idParamsValidator, orderShippingInfoValidators, 
            handleValidationErrors, async (req, res, next) => {
    try {
        const data = req.body
        const id = parseInt(req.params.id, 10);
        const response = await orderService.adminUpdateShippingInfo({id, ...data});
        res.status(200).json({
            status: 'success',
            message: 'Orders shipping information updated successfully',
            code: 200,
            order_updated: response 
        });
    } catch(err) {
        next(err);
    }        
});

router.patch('/:id/delivery_date', checkAuthenticated, checkAdminRole, idParamsValidator, orderDeliveryInfoValidator, 
        handleValidationErrors, async (req, res, next) => {
    try {
    const data = req.body
    const id = parseInt(req.params.id, 10);
    const response = await orderService.adminUpdateShippingInfo({id, ...data});
    res.status(200).json({
        status: 'success',
        message: 'Orders delivery date updated successfully',
        code: 200,
        order_updated: response 
        });
    } catch(err) {
        next(err);
    }        
});

router.patch('/:id/items_ordered', checkAuthenticated, checkAdminRole, idParamsValidator, orderedItemsValidators, 
            handleValidationErrors, async (req, res, next) => {
    try {
        const data = req.body
        const id = parseInt(req.params.id, 10);
        const response = await orderService.adminUpdateItemsInfo({id, ...data});
        res.status(200).json({
            status: 'success',
            message: 'Items updated successfully',
            code: 200,
            order_updated: response 
        });
    } catch(err) {
        next(err);
    }        
});

router.patch('/:id/ship_order', checkAuthenticated, checkAdminRole, idParamsValidator, trackingValidator, 
    handleValidationErrors, async (req, res, next) => {
    try {
        const tracking = req.body
        const id = parseInt(req.params.id, 10);
        const response = await orderService.shippingOrder({id, ...tracking});
        res.status(200).json({
            status: 'success',
            message: 'Order shipped successfully',
            code: 200,
            order: response 
        });
    } catch(err) {
        next(err);
    }        
});


export default router;