const express = require('express');
const router = express.Router();
const { idParamsValidator, orderShippingInfoValidators, orderDeliveryInfoValidator,
    orderedItemsValidators, handleValidationErrors } = require('../../Utilities/expressValidators')
const { checkAuthenticated, checkAdminRole } = require('../../middleware/appMiddlewares')
const { selectTotalOrdersQuery } = require('../../DBQueries/orderQueries')
const OrderAdminService = require('../../ServicesLogic/ServicesAdminLogic/orderAdminService')

router.get('/', /*checkAuthenticated, checkAdminRole,*/ async (req, res, next) => {
    try {
        const limit = 5;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;
        const search = req.query.term;

        console.log('calling api route to fetch all orders:', search)
        const orders = await OrderAdminService.loadAllOrders(limit, offset, search);
        const totalOrders = await selectTotalOrdersQuery(search);

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

router.get('/:id', /*checkAuthenticated, checkAdminRole,*/ idParamsValidator, handleValidationErrors, 
    async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            console.log('calling api route to fetch an order info by order id:', id)
            const response = await OrderAdminService.findOrder(id);
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

router.patch('/:id', /*checkAuthenticated, checkAdminRole,*/ idParamsValidator, 
                handleValidationErrors, async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        console.log('calling api route to delete/cancel an order:', id)
        const response = await OrderAdminService.deleteOrder(id);
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


router.patch('/:id/shipping_info', /*checkAuthenticated, checkAdminRole,*/ idParamsValidator, orderShippingInfoValidators, 
            handleValidationErrors, async (req, res, next) => {
    try {
        const data = req.body
        const id = parseInt(req.params.id, 10);
        console.log('calling api route to update the shipping info of an order:', data, id)
        const response = await OrderAdminService.updateOrderShippingInfo({id, ...data});
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

router.patch('/:id/delivery_date', /*checkAuthenticated, checkAdminRole,*/ idParamsValidator, orderDeliveryInfoValidator, 
        handleValidationErrors, async (req, res, next) => {
    try {
    const data = req.body
    const id = parseInt(req.params.id, 10);
    console.log('calling api route to update the delivery info of an order:', data, id)
    const response = await OrderAdminService.updateOrderShippingInfo({id, ...data});
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

router.patch('/:id/items_ordered', /*checkAuthenticated, checkAdminRole,*/ idParamsValidator, orderedItemsValidators, 
            handleValidationErrors, async (req, res, next) => {
    try {
        const data = req.body
        const id = parseInt(req.params.id, 10);
        console.log('calling api route to update the order items quantities:', data, id)
        const response = await OrderAdminService.updateOrderItemsInfo({id, ...data});
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


module.exports = router;