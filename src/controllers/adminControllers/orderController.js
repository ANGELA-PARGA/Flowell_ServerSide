import { orderService } from '../../config/container.js';

class OrderAdminController {
    /**
     * Get all orders with pagination and search
     */
    async getAllOrders(req, res, next) {
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
        } catch (err) {
            next(err);
        }
    }

    /**
     * Get dashboard orders statistics
     */
    async getDashboardOrders(req, res, next) {
        try {
            const { ordersByStatus, ordersByMonth, monthWithMostOrders } = await orderService.loadGroupedOrders();
            res.status(200).json({
                status: 'success',
                message: 'Grouped orders retrieved successfully',
                code: 200,
                orders: ordersByStatus, 
                ordersByMonth: ordersByMonth,
                monthWithMostOrders: monthWithMostOrders
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
            const response = await orderService.findOrder(id);
            res.status(200).json({
                status: 'success',
                message: 'Order retrieved successfully',
                code: 200,
                order: response 
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Cancel order (admin side)
     */
    async cancelOrder(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const response = await orderService.adminCancelOrder(id);
            res.status(200).send({
                status: 'success',
                message: 'Order cancelled successfully',
                code: 204,
                order_cancelled: response 
            });
        } catch (err) {
            next(err);
        }        
    }

    /**
     * Update order shipping information (admin)
     */
    async updateShippingInfo(req, res, next) {
        try {
            const data = req.body;
            const id = parseInt(req.params.id, 10);
            const response = await orderService.adminUpdateShippingInfo({ id, ...data });
            res.status(200).json({
                status: 'success',
                message: 'Order shipping information updated successfully',
                code: 200,
                order_updated: response 
            });
        } catch (err) {
            next(err);
        }        
    }

    /**
     * Update order delivery date (admin)
     */
    async updateDeliveryDate(req, res, next) {
        try {
            const data = req.body;
            const id = parseInt(req.params.id, 10);
            const response = await orderService.adminUpdateShippingInfo({ id, ...data });
            res.status(200).json({
                status: 'success',
                message: 'Order delivery date updated successfully',
                code: 200,
                order_updated: response 
            });
        } catch (err) {
            next(err);
        }        
    }

    /**
     * Update order items (admin)
     */
    async updateOrderItems(req, res, next) {
        try {
            const data = req.body;
            const id = parseInt(req.params.id, 10);
            const response = await orderService.adminUpdateItemsInfo({ id, ...data });
            res.status(200).json({
                status: 'success',
                message: 'Items updated successfully',
                code: 200,
                order_updated: response 
            });
        } catch (err) {
            next(err);
        }        
    }

    /**
     * Ship order with tracking information (admin)
     */
    async shipOrder(req, res, next) {
        try {
            const tracking = req.body;
            const id = parseInt(req.params.id, 10);
            const response = await orderService.shippingOrder({ id, ...tracking });
            res.status(200).json({
                status: 'success',
                message: 'Order shipped successfully',
                code: 200,
                order: response 
            });
        } catch (err) {
            next(err);
        }        
    }
}

export default new OrderAdminController();