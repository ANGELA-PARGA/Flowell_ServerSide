const createError = require('http-errors');
const Order = require('../../models/client/orderModel');
const OrderedItemsService = require('./OrderedItemsService');
const {triggerRevalidationDashboard} = require('../Utilities/utilities');
const {triggerRevalidationEcomerce} = require('../Utilities/utilities');

module.exports = class OrderService {
    constructor(orderRepository) {
        this.orderRepository = orderRepository
    }
    
    /**
     * CLIENT METHOD: Create an order using data object all the necessary properties to create an order.
     * It will return the created order object with the items included.
     * @param {object} orderData
     * @returns {Object}
     * @throws {Error}
     */
    async createNewOrder(orderData){
        try {
            const { items, ...data } = orderData
            const orderObject = new Order(data);
            const orderCreated = await this.orderRepository.insert(orderObject);
            const order_id = orderCreated.id

            const orderedItemsPromises = items.map(async (item) => {
                return await OrderedItemsService.createOrderedItems({ ...item, order_id });
            });
            
            orderCreated.items = await Promise.all(orderedItemsPromises);

            // Trigger revalidation for the new order
            const path = `/admin_panel/orders`;
            await triggerRevalidationDashboard(path);

            return orderCreated;            
        } catch (error) {
            throw error
        }
    }

    /**
     * CLIENT METHOD: Update an order using data object that have an ID and can have one or multiple 
     * of the following properties: 
     * @param {number} id // required always
     * @param {Date} delivery_date
     * @param {string} address
     * @param {string} city
     * @param {string} state
     * @param {string} zip_code
     * @param {string} phone
     * @returns {Object}
     * @throws {Error}
     */
    async customerUpdateShippingInfo(dataToUpdate){
        try {        
            const updatedOrder = await this.orderRepository.update(dataToUpdate);

            // Trigger revalidation for the new order
            const path = `/admin_panel/orders/${updatedOrder.id}`;
            const tag = `orders`
            await triggerRevalidationDashboard(path, tag);

            return updatedOrder; 
        } catch (error) {
            throw error
        }
    }

    /**
     * CLIENT AND ADMIN METHOD: Find an order using the id of the order or the user_id of the user that created the order.: 
     * @param {number} id
     * @param {number} user_id
     * @returns {Object}
     * @throws {Error}
     */
    async findOrder(data){
        try {
            const { id, user_id } = data;
            let orderFound;
            if(id){
                orderFound = await this.orderRepository.findByOrderId(id);                
            }
            if(user_id){
                orderFound = await this.orderRepository.findByUserId(user_id);
            }

            if(!orderFound?.length){
                orderFound = []               
            }

            return orderFound;
        } catch (error) {
            throw error
        }
    }

    /**
     * CLIENT METHOD: Cancel an order using the id: 
     * @param {number} id
     * @returns {boolean}
     * @throws {Error}
     */
    async customerCancelOrder(id){
        try {
            const cancelledItems = await OrderedItemsService.cancelOrderedItems({order_id:id})            
            if(!cancelledItems){
                return false
            }
            const newTotal = await this.orderRepository.getTotalByOrderId(id);
            const cancelledOrder = await this.orderRepository.update({id, total:newTotal.total, status:'CANCELLED', tracking:'NO_TRACKING'})                 
            
            
            // Trigger revalidation for the new order
            const path = `/admin_panel/orders`;
            await triggerRevalidationDashboard(path);  

            return {
                cancelledItems: cancelledItems,
                cancelledOrder: cancelledOrder
            }; 
        } catch (error) {
            throw error
        }
    }

    /**
     * ADMIN METHOD: Load all orders on the DB:
     * @param {number} limit
     * @param {number} offset
     * @param {string} search 
     * @returns {Array}
     * @throws {Error}
     */
    async loadAllOrders(limit, offset, search){
        try {
            const foundOrders = await this.orderRepository.selectAllOrders(limit, offset, search)
            return foundOrders
        } catch (error) {
            throw error
        }
    }

    /**
     * ADMIN METHOD: Load the count of all orders on the DB grouped by status: 
     * @returns {Object}
     * @throws {Error}
     */
    async loadGroupedOrders(){
        try {
            const [ordersByStatus, ordersByMonth, monthWithMostOrders] = await Promise.all([
                this.orderRepository.selectDashboard(),
                this.orderRepository.selectByMonth(),
                this.orderRepository.selectByMostOrders()
            ]) 
            
            return { 
                ordersByStatus: ordersByStatus,
                ordersByMonth: ordersByMonth,
                monthWithMostOrders: monthWithMostOrders                
            }
        } catch (error) {
            throw error
        }
    }

    /**
     * ADMIN METHOD: Update an order using data object that have an ID and can have one or 
     * multiple of the following properties: 
     * @param {number} id // required always
     * @param {Date} delivery_date
     * @param {string} address
     * @param {string} city
     * @param {string} state
     * @param {string} zip_code
     * @param {string} phone
     * @returns {Object}
     * @throws {Error}
     */    
    async adminUpdateShippingInfo(dataToUpdate){
        try {        
            const updatedOrder = await this.orderRepository.update(dataToUpdate);
            
            if(!Object.keys(updatedOrder)?.length){
                throw createError(400, 'order not found or unable to update');                
            }
            
            // Trigger revalidation for the new product
            const path = `/account/orders/${updatedOrder.id}`; 
            const tag = `orders`
            await triggerRevalidationEcomerce(path, tag); 
            
            return updatedOrder; 
        } catch (error) {
            throw error
        }
    }

    /**
     * ADMIN METHOD: Update the quantity of an ordered or some ordered items using data object that have an ID 
     * and an array of items:
     * @param {number} id // required always
     * @param {Array} items {product_id, qty}
     * @returns {Object} 
     * @throws {Error}
     */
    async adminUpdateItemsInfo(dataToUpdate){
        try {        
            const { id, product_id, qty } = dataToUpdate;

            let updatedOrder = {};

            const orderedItemUpdated = await OrderedItemsService.updateOrderedItem({order_id:id, product_id, qty});
            
            updatedOrder.item = orderedItemUpdated;
            
            const newTotal = await this.orderRepository.getTotalByOrderId(id);     
            updatedOrder.order = await this.orderRepository.update({id, total:newTotal.total })
            
            
            if(!Object.keys(updatedOrder)?.length){
                throw createError(400, 'order not found or unable to update');                
            }
            // Trigger revalidation for the new product
            const path = `/account/orders/${updatedOrder.order.id}`; 
            const tag = `orders`
            await triggerRevalidationEcomerce(path, tag);

            return updatedOrder;
        } catch (error) {
            throw error
        }
    }

    /**
     * ADMIN METHOD: Ship an order using the tracking number provided by the carrier and the id of the order: 
     * @param {number} id // required always
     * @param {string} tracking
     * @returns {Object}
     * @throws {Error}
     */
    async shippingOrder(data){
        try {        
            const shippedOrder = await this.orderRepository.update({...data, status:'SHIPPED'});
            
            if(!Object.keys(shippedOrder)?.length){
                throw createError(400, 'order not found or unable to ship');                
            } 
            // Trigger revalidation for the new product
            const path = `/account/orders/${shippedOrder.id}`; 
            const tag = `orders`
            await triggerRevalidationEcomerce(path, tag);
            
            return shippedOrder; 
        } catch (error) {
            throw error
        }
    }

    /**
     * ADMIN METHOD: Find an order using the order id, it returns the order information 
     * plus the user associated to this order: 
     * @param {number} id
     * @returns {Object}
     * @throws {Error}
     */
    async findOrder(id){
        try {
            const orderFound = await this.orderRepository.orderWithUserInfo(id)
            
            if(!orderFound?.length){
                throw createError(404, 'order not found');             
            }
            return orderFound;
        } catch (error) {
            throw error
        }
    }

    /**
     * ADMIN METHOD: Cancel an order using the id: 
     * @param {number} id
     * @returns {boolean}
     * @throws {Error}
     */
    async adminCancelOrder(id){
        try {
            const cancelledItems = await OrderedItemsService.cancelOrderedItems({order_id:id})            
            if(!cancelledItems){
                return false
            }
            const newTotal = await this.orderRepository.getTotalByOrderId(id);
            const cancelledOrder = await this.orderRepository.update({id, total:newTotal.total, status:'CANCELLED', tracking:'NO_TRACKING'})                 

            if(!cancelledOrder) {
                throw createError(400, 'order not found or unable to cancel');
            } 
            // Trigger revalidation for the new product
            const path = `/account/orders`; 
            await triggerRevalidationEcomerce(path);
            
            return {
                cancelledItems: cancelledItems,
                cancelledOrder: cancelledOrder
            };
        } catch (error) {
            throw error
        }
    }

}
