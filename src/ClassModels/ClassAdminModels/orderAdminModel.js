const createError = require('http-errors');
const OrderedItemsAdminModel = require('./orderedItemsAdminModel')
const {updateQuery,calculateTotal} = require('../../DBQueries/generalQueries')
const {selectAllOrderInfoWithUserQuery, selectAllOrdersQuery, 
    selectAllOrdersDashboard, selectOrdersByMonth, selectMonthWithMostOrders} = require('../../DBQueries/orderQueries')
const {cancelOrderedItemsQuery} = require('../../DBQueries/orderedItemsQueries')

module.exports = class OrderAdminModel { 
    
    /**
     * Load all orders on the DB: 
     * @returns {Array}
     * @throws {Error}
     */
    static async loadAllOrders(limit, offset, search){
        try {
            const ordersFound = await selectAllOrdersQuery(limit, offset, search)
            return ordersFound
        } catch (error) {
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while loading all orders on DB' 
                    : 'ServerError: Unexpected error while loading all orders on DB'
            );

            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while loading all orders on DB';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'orderAdminModel / loadAllOrders';
            dbError.timestamp = new Date().toISOString();

            throw dbError;
        }
    } 
    
    /**
     * Load the count of all orders on the DB grouped by status: 
     * @returns {Object}
     * @throws {Error}
     */
    static async loadGroupedOrders(){
        try {
            const [ordersByStatus, ordersByMonth, monthWithMostOrders] = await Promise.all([
                selectAllOrdersDashboard(),
                selectOrdersByMonth(),
                selectMonthWithMostOrders()
            ]) 
            
            return { 
                ordersByStatus: ordersByStatus,
                ordersByMonth: ordersByMonth,
                monthWithMostOrders: monthWithMostOrders                
            }

        } catch (error) {
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while retrieving the total orders grouped by status on DB' 
                    : 'ServerError: Unexpected error while retrieving the total orders grouped by status on DB'
            );

            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while retrieving the total orders grouped by status on DB';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'orderAdminModel / loadGroupedOrders';
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
     * @param {string} phone
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
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'orderAdminModel / updateShippingInfo';
            dbError.timestamp = new Date().toISOString();

            throw dbError;
        }
    }

    /**
     * Update the quantity of an ordered or some ordered items using data object that have an ID and an array of items:
     * @param {number} id // required always
     * @param {Array} items {product_id, qty}
     * @returns {Object} 
     * @throws {Error}
     */
    static async updateItemsInfo(data){
        try {
            const { id, product_id, qty } = data;
            console.log('data received:', id, product_id, qty)

            let updatedOrder = {};

            const orderedItemUpdated = await OrderedItemsAdminModel.updateOrderedItem({order_id:id, product_id, qty});
            
            updatedOrder.item = orderedItemUpdated;
            
            const newTotal = await calculateTotal(id,'order_id','ordered_items');     
            updatedOrder.order = await updateQuery({id, total:newTotal.total }, 'id','orders')

            console.log('item updated and new total:', orderedItemUpdated, newTotal)
            
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
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'orderAdminModel / updateItemsInfo';
            dbError.timestamp = new Date().toISOString();

            throw dbError;
        }
    }

    /**
     * Ship an order using the tracking number provided by the carrier and the id of the order: 
     * @param {number} id // required always
     * @param {string} tracking
     * @returns {Object}
     * @throws {Error}
     */
    static async shipOrder(data){
        try {
            const shippedOrder = await updateQuery({...data, status:'SHIPPED'}, 'id','orders');
            return shippedOrder;            
        } catch (error) {
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while shipping the order' 
                    : 'ServerError: Unexpected error while shipping the order'
            );

            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while shipping the order';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'orderAdminModel / shipOrder';
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
            const orderFound = await selectAllOrderInfoWithUserQuery(id, 'id')
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
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'orderAdminModel / findOrderById';
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
            const cancelledOrder = await updateQuery({id, total:newTotal.total, status:'CANCELLED', tracking:'NO_TRACKING'}, 'id','orders')                 
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
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'orderAdminModel / deleteOrder';
            dbError.timestamp = new Date().toISOString();

            throw dbError;
        }
    }

}