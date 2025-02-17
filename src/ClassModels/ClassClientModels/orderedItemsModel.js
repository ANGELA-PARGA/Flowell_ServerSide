const createError = require('http-errors');
const {insertQuery, standardSelectQuery } = require('../../DBQueries/generalQueries')
const {updateOrderedItemsQuery} = require('../../DBQueries/orderedItemsQueries')
const moment = require('moment');


module.exports = class OrderedItemsModel {
    constructor(data) {
        this.order_id = data.order_id;
        this.product_id = data.product_id;
        this.qty = data.qty;
        this.created = moment.utc().toISOString();
        this.modified = moment.utc().toISOString();
    }
    
    /**
     * Create an ordered item using data object with the following properties: 
     * @param {number} order_id
     * @param {number} product_id
     * @param {number} qty 
     * @returns {Object}
     * @throws {Error}
     */
    async createOrderedItems(){
        try {
            const orderedItem = this;               
            const newOrderedItem = await insertQuery(orderedItem, 'ordered_items')
            return newOrderedItem;
        } catch(error) {
            throw createError(500, 'error on server while creating the ordered item', error.stack, error);
        }
    }

    /**
     * Update an ordered item using data object with the following properties: 
     * @param {number} order_id
     * @param {number} product_id
     * @param {number} qty 
     * @returns {Object}
     * @throws {Error}
     */
    static async updateOrderedItem(data){
        try {
            const updatedItem = await updateOrderedItemsQuery(data)
            return updatedItem
        } catch (error) {
            throw createError(500, 'error on server while updating the ordered item qty', error.stack, error);            
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
            throw createError(500, 'error on server while retrieving all items ordered from an order', error.stack, error);              
        }
    }
    
    /**
     * Find all orders that have one particular product: 
     * @param {number} product_id
     * @returns {Object}
     * @throws {Error}
     */
    static async findAllItemsByProductId(product_id){
        try {
            const foundOrders = await standardSelectQuery(product_id,'ordered_items','product_id');
            return foundOrders;
        } catch (error) {
            throw createError(500, 'error on server while retrieving all items ordered by product id', error.stack, error);               
        }
    }
    
}