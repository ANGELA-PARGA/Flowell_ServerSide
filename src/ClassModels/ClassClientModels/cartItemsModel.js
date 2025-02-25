const createError = require('http-errors');
const {insertQuery, deleteDoubleConditionQuery, standardDeleteQuery} = require('../../DBQueries/generalQueries')
const {updateCartItemsQuery, selectCartItemsQuery} = require('../../DBQueries/cartItemsQueries')
const moment = require('moment');

module.exports = class CartItemsModel {
    constructor(data) {
        this.cart_id = data.cart_id;
        this.product_id = data.product_id;
        this.qty = data.qty;
        this.created = moment.utc().toISOString();
        this.modified = moment.utc().toISOString();
    }

    /**
     * Create a new cart item using data object with the following properties: 
     * @param {number} cart_id
     * @param {number} product_id
     * @param {number} qty
     * @returns {Object}
     * @throws {Error}
     */
    async createCartItem(){
        try {
            const newCartItem = this;         
            const cartItemAdded = await insertQuery(newCartItem, 'cart_items')
            return cartItemAdded;
        } catch(error) {
            throw createError(500, 'error on server while creating the cart item', error.stack, error);
        }
    }

    /**
     * Update the qty of a cart item using data object with the following properties: 
     * @param {number} cart_id
     * @param {number} product_id
     * @param {number} qty 
     * @returns {Object|null}
     * @throws {Error}
     */
    static async updateCartItem(data){
        try {
            const updatedCartItem = updateCartItemsQuery(data);
            return updatedCartItem;
        } catch (error) {
            throw createError(500, 'error on server while updating the cart item', error.stack, error);            
        }
    }
    
    /**
     * Find all cart items using the cart id: 
     * @param {number} cart_id
     * @returns {Object|null}
     * @throws {Error}
     */
    static async findAllCartItemsToOrder(cart_id){
        try {
            const foundItems = await selectCartItemsQuery(cart_id);
            return foundItems;
        } catch (error) {
            throw createError(500, 'error on server while retrieving all items from a cart', error.stack, error);              
        }
    }

    /**
     * Delete a cart item using data object with the properties: 
     * @param {number} cart_id
     * @param {number} product_id
     * @returns {Object|null}
     * @throws {Error}
     */
    static async deleteCartItem(data){
        try {
            const deletedItem = await deleteDoubleConditionQuery(data, 'cart_items', 'cart_id', 'product_id')
            return deletedItem
        } catch (error) {
            throw createError(500, 'error on server while deleting a cart item', error.stack, error);              
        }
    }

    static async deleteAllCartItems(cart_id){
        try {
            const cartItemsDeleted = await standardDeleteQuery(cart_id, 'cart_items', 'cart_id')
            return cartItemsDeleted
        } catch (error) {
            throw createError(500, 'error on server while deleting all the cart items', error.stack, error);              
        }
    }
}