const express = require('express');
const router = express.Router();
const { idParamsValidator, orderShippingInfoValidators, orderDeliveryInfoValidator,
        handleValidationErrors } = require('../../Utilities/expressValidators')
const { checkAuthenticated } = require('../../middleware/appMiddlewares')
const OrderService = require('../../services/client/OrderService')

router.get('/', checkAuthenticated, async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const response = await OrderService.findOrder({user_id});
        res.status(200).json({
            status: 'success',
            message: 'Orders retrieved successfully',
            code: 200,
            orders: response 
        });
    } catch(err) {
        next(err);
    }
});

router.get('/:id', checkAuthenticated, idParamsValidator, handleValidationErrors, 
    async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            const response = await OrderService.findOrder({id});
            res.status(200).json({
                status: 'success',
                message: 'Order retrieved successfully',
                code: 200,
                orders: response 
            });
        } catch(err) {
            next(err);
        }
});

router.patch('/:id', checkAuthenticated, idParamsValidator, 
                handleValidationErrors, async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const response = await OrderService.deleteOrder(id);
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


router.patch('/:id/shipping_info', checkAuthenticated, idParamsValidator, orderShippingInfoValidators, 
            handleValidationErrors, async (req, res, next) => {
    try {
        const data = req.body
        const id = parseInt(req.params.id, 10);
        const response = await OrderService.updateOrderShippingInfo({id, ...data});
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

router.patch('/:id/delivery_date', checkAuthenticated, idParamsValidator, orderDeliveryInfoValidator, 
        handleValidationErrors, async (req, res, next) => {
    try {
    const data = req.body
    const id = parseInt(req.params.id, 10);
    const response = await OrderService.updateOrderShippingInfo({id, ...data});
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


module.exports = router;