const createError = require('http-errors');
const moment = require('moment');
const OrderedItemsModel = require('./orderedItemsModel')
const {insertQuery,updateQuery,calculateTotal} = require('../../DBQueries/generalQueries')
const {selectAllOrderInfoQuery} = require('../../DBQueries/orderQueries')
const {cancelOrderedItemsQuery} = require('../../DBQueries/orderedItemsQueries')

module.exports = class OrderModel {
    constructor(data) {
        this.created_at = moment.utc().toISOString();
        this.updated_at = moment.utc().toISOString();
        this.user_id = data.user_id;
        this.status = 'PAID';
        this.total = data.total;
        this.items = data.items;
        this.delivery_date = data.delivery_date;
        this.address = data.address;
        this.city = data.city
        this.state = data.state
        this.zip_code = data.zip_code
        this.contact_phone = data.contact_phone
    }
    
    /**
     * Create an order using data object with the following properties: 
     * @param {number} user_id
     * @param {number} total
     * @param {Array} items {product_id, qty}
     * @param {Date} delivery_date
     * @param {string} address
     * @param {string} city
     * @param {string} state
     * @param {string} zip_code
     * @param {string} contact_phone
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
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while creating a new order' 
                    : 'ServerError: Unexpected error while creating a new order'
            );

            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while creating a new order';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'orderModel / createOrder';
            dbError.timestamp = new Date().toISOString();

            throw dbError;
        }
    }

    /**
     * Update an order using data object that have an ID and can have one or multiple of the following properties: 
     * @param {number} id // required always
     * @param {Date} delivery_date
     * @param {string} address
     * @param {string} city
     * @param {string} state
     * @param {string} zip_code
     * @param {string} contact_phone
     * @returns {Object}
     * @throws {Error}
     */
    static async updateShippingInfo(data){
        try {
            const updatedOrder = await updateQuery(data, 'id','orders');
            return updatedOrder;            
        } catch (error) {
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while updating shipping information' 
                    : 'ServerError: Unexpected error while updating shipping information'
            );

            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while updating shipping information';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'orderModel / updateShippingInfo';
            dbError.timestamp = new Date().toISOString();

            throw dbError;
        }
    }

    static async updateItemsInfo(data){
        try {
            const { id, items } = data;
            console.log('data received:', items)

            let updatedOrder = {};

            const orderedItemsPromises = items.map(async (item) => {
                return await OrderedItemsModel.updateOrderedItem({order_id:id, ...item});
            });       
            updatedOrder.items = await Promise.all(orderedItemsPromises);
            
            const newTotal = await calculateTotal(id,'order_id','ordered_items');     
            updatedOrder.order = await updateQuery({id, total:newTotal.total }, 'id','orders')
            
            return updatedOrder;                 
        } catch (error) {
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while updating items information' 
                    : 'ServerError: Unexpected error while updating items information'
            );

            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while updating items information';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'orderModel / updateItemsInfo';
            dbError.timestamp = new Date().toISOString();

            throw dbError;
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
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while finding order information by id' 
                    : 'ServerError: Unexpected error while finding order information by id'
            );

            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while finding order information by id';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'orderModel / findOrderById';
            dbError.timestamp = new Date().toISOString();

            throw dbError;
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
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while finding user orders by user id' 
                    : 'ServerError: Unexpected error while finding user orders by user id'
            );

            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while finding user orders by user id';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'orderModel / findOrdersByUserId';
            dbError.timestamp = new Date().toISOString();

            throw dbError;
        }
    }

    /**
     * Cancel an order using the id: 
     * @param {number} id
     * @returns {boolean}
     * @throws {Error}
     */
    static async deleteOrder(id){
        try {
            const deletedOrderedItems = await cancelOrderedItemsQuery({order_id:id})            
            if(!deletedOrderedItems){
                return false
            }
            const newTotal = await calculateTotal(id,'order_id','ordered_items');
            const cancelledOrder = await updateQuery({id, total:newTotal.total, status:'CANCELLED'}, 'id','orders')                 
            return {
                cancelledItems: deletedOrderedItems,
                cancelledOrder: cancelledOrder
            };         
        } catch (error) {
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while canceling an order by order id' 
                    : 'ServerError: Unexpected error while canceling an order by order id'
            );

            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while canceling an order by order id';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'orderModel / deleteOrder';
            dbError.timestamp = new Date().toISOString();

            throw dbError;
        }
    }

}