const createError = require('http-errors');
const {insertQuery, standardSelectQuery } = require('../../DBQueries/generalQueries')
const moment = require('moment');

module.exports = class OrderedItemsModel {    
    /**
     * Create an ordered item using data object with the following properties: 
     * @param {number} order_id
     * @param {number} product_id
     * @param {number} qty 
     * @returns {Object}
     * @throws {Error}
     */
    static async createOrderedItems(data){
        try {
            const orderedItem = data;               
            const newOrderedItem = await insertQuery(orderedItem, 'ordered_items')
            return newOrderedItem;
        } catch(error) {
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while creating new ordered items' 
                    : 'ServerError: Unexpected error while creating new ordered items'
            );

            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while creating new ordered items';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'orderedItemsModel / createOrderedItems';
            dbError.timestamp = new Date().toISOString();

            throw dbError;
        }
    }
    
    /**
     * Find all items ordered using the order id: 
     * @param {number} order_id
     * @returns {Object}
     * @throws {Error}
     */
    static async findAllItemsByOrderId(order_id){
        try {
            const foundItems = await standardSelectQuery(order_id,'ordered_items','order_id');
            return foundItems;
        } catch (error) {
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while finding all items in an order' 
                    : 'ServerError: Unexpected error while finding all items in an order'
            );

            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while finding all items in an order';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'orderedItemsModel / findAllItemsByOrderId';
            dbError.timestamp = new Date().toISOString();

            throw dbError;
        }
    }
    
}