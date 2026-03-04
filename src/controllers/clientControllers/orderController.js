import { orderService } from '../../config/container.js';

class OrderController {
    /**
     * Get all orders for authenticated user
     */
    async getUserOrders(req, res, next) {
        try {
            const user_id = req.user.id;
            const response = await orderService.findOrder({ user_id });
            res.status(200).json({
                status: 'success',
                code: 200,
                orders: response 
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Get specific order by ID
     */
    async getOrderById(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const response = await orderService.findOrder({ id });
            res.status(200).json({
                status: 'success',
                code: 200,
                orders: response 
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Cancel order (customer side)
     */
    async cancelOrder(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const response = await orderService.customerCancelOrder(id);
            res.status(200).send({
                status: 'success',
                code: 204,
                order_cancelled: response 
            });
        } catch (err) {
            next(err);
        }        
    }

    /**
     * Update order shipping information
     */
    async updateShippingInfo(req, res, next) {
        try {
            const data = req.body;
            const id = parseInt(req.params.id, 10);
            const response = await orderService.customerUpdateShippingInfo({ id, ...data });
            res.status(200).json({
                status: 'success',
                code: 200,
                order_updated: response 
            });
        } catch (err) {
            next(err);
        }        
    }

    /**
     * Update order delivery date
     */
    async updateDeliveryDate(req, res, next) {
        try {
            const data = req.body;
            const id = parseInt(req.params.id, 10);
            const response = await orderService.customerUpdateShippingInfo({ id, ...data });
            res.status(200).json({
                status: 'success',
                code: 200,
                order_updated: response 
            });
        } catch (err) {
            next(err);
        }        
    }
}

export default new OrderController();