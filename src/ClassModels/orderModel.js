const createError = require('http-errors');
const moment = require('moment');
const OrderedItemsModel = require('./orderedItemsModel')
const {insertQuery,updateQuery,standardDeleteQuery,calculateTotal} = require('../DBQueries/generalQueries')
const {selectAllOrderInfoQuery} = require('../DBQueries/orderQueries')

module.exports = class OrderModel {
    constructor(data) {
        this.created = moment.utc().toISOString();
        this.modified = moment.utc().toISOString();
        this.user_id = data.user_id;
        this.status = 'FULFILLED';
        this.total = data.total;
        this.items = data.items;
        this.delivery_date = data.delivery_date;
        this.shipping_address_id = data.shipping_address_id
        this.contact_info_id = data.contact_info_id
    }
    
    /**
     * Create an order using data object with the following properties: 
     * @param {number} user_id
     * @param {number} total
     * @param {Array} items {product_id, qty}
     * @param {Date} delivery_date
     * @param {number} shipping_address_id
     * @param {number} contact_info_id
     * @returns {Object}
     * @throws {Error}
     */
    async createOrder(){
        try {     
            const { items, ...parameters } = this
            const newOrder = await insertQuery(parameters, 'orders')
            const order_id = newOrder.id            

            const orderedItemsPromises = items.map(async (item) => {
                const newOrderedItem = new OrderedItemsModel({ ...item, order_id });
                return await newOrderedItem.createOrderedItems();
            });
    
            newOrder.items = await Promise.all(orderedItemsPromises);
            return newOrder;
        } catch(error) {
            throw createError(500, 'error on server while creating the order', error.stack, error);
        }
    }

    /**
     * Update an order using data object that have an ID and can have one or multiple of the following properties: 
     * @param {number} id
     * @param {number} user_id
     * @param {Array} items
     * @param {string} status
     * @param {Date} delivery_date
     * @param {number} shipping_address_id
     * @param {number} contact_info_id
     * @returns {Object}
     * @throws {Error}
     */
    static async updateShippingInfo(data){
        try {
            const updatedOrder = await updateQuery(data, 'id','orders');
            return updatedOrder;            
        } catch (error) {
            throw createError(500, 'error on server while updating the order shipping information', error.stack, error);            
        }
    }

    static async updateItemsInfo(data){
        try {
            const { id, items } = data;

            let updatedOrder = {};

            const orderedItemsPromises = items.map(async (item) => {
                return await OrderedItemsModel.updateOrderedItem({order_id:id, ...item});
            });       
            updatedOrder.items = await Promise.all(orderedItemsPromises);
            
            const newTotal = await calculateTotal(id,'order_id','ordered_items');     
            updatedOrder.order = await updateQuery({id, total:newTotal.total }, 'id','orders')
            
            return updatedOrder;                 
        } catch (error) {
            throw createError(500, 'error on sever while updating the order', error.stack, error);            
        }
    }
    
    /**
     * Find an order using the id: 
     * @param {number} id
     * @returns {Object}
     * @throws {Error}
     */
    static async findOrderById(id){
        try {
            const orderFound = await selectAllOrderInfoQuery(id, 'id')
            return orderFound
        } catch (error) {
            throw createError(500, 'error on server while retrieving the order by id', error.stack, error);            
        }
    }

    /**
     * Find an order using the user_id: 
     * @param {number} user_id
     * @returns {Array}
     * @throws {Error}
     */
    static async findOrdersByUserId(user_id){
        try {
            const ordersFound = await selectAllOrderInfoQuery(user_id, 'user_id')
            return ordersFound
        } catch (error) {
            throw createError(500, 'error on server while retrieving the order by user_id', error.stack, error);            
        }
    }

    /**
     * Delete an order using the id: 
     * @param {number} id
     * @returns {boolean}
     * @throws {Error}
     */
    static async deleteOrder(id){
        try {
            const deletedOrderedItems = await standardDeleteQuery(id, 'ordered_items', 'order_id')
            const deletedOrder = await standardDeleteQuery(id, 'orders', 'id')
            if(!deletedOrderedItems || !deletedOrder){
                return false
            }            
            return true;          
        } catch (error) {
            throw createError(500, 'error on server while deleting the order by id', error.stack, error);            
        }
    }

}