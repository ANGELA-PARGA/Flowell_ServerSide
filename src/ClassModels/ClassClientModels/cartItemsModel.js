const createError = require('http-errors');
const {insertQuery, deleteDoubleConditionQuery, standardDeleteQuery} = require('../../DBQueries/generalQueries')
const {updateCartItemsQuery, selectCartItemsQuery} = require('../../DBQueries/cartItemsQueries')

module.exports = class CartItemsModel {
    /**
     * Create a new cart item using data object with the following properties: 
     * @param {number} cart_id
     * @param {number} product_id
     * @param {number} qty
     * @returns {Object}
     * @throws {Error}
     */
    static async createCartItem(data){
        try {
            const newCartItem = data;         
            const cartItemAdded = await insertQuery(newCartItem, 'cart_items')
            return cartItemAdded;
        } catch(error) {
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while creating a cart item' 
                    : 'ServerError: Unexpected error while creating a cart item'
            );

            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while creating a cart item';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'cartItemsModel / createCartItem';
            dbError.timestamp = new Date().toISOString();

            throw dbError;
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
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while updating a cart item' 
                    : 'ServerError: Unexpected error while updating a cart item'
            );

            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while updating a cart item';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'cartItemsModel / updateCartItem';
            dbError.timestamp = new Date().toISOString();

            throw dbError;
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
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while finding all cart items to order' 
                    : 'ServerError: Unexpected error while finding all cart items to order'
            );

            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while finding all cart items to order';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'cartItemsModel / findAllCartItemsToOrder';
            dbError.timestamp = new Date().toISOString();

            throw dbError;
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
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while deleting a cart item' 
                    : 'ServerError: Unexpected error while deleting a cart item'
            );

            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while deleting a cart item';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'cartItemsModel / deleteCartItem';
            dbError.timestamp = new Date().toISOString();

            throw dbError;
            
        }
    }

    static async deleteAllCartItems(cart_id){
        try {
            const cartItemsDeleted = await standardDeleteQuery(cart_id, 'cart_items', 'cart_id')
            return cartItemsDeleted
        } catch (error) {
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while deleting all cart items' 
                    : 'ServerError: Unexpected error while deleting all cart items'
            );

            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while deleting all cart items';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'cartItemsModel / deleteAllCartItems';
            dbError.timestamp = new Date().toISOString();

            throw dbError;
        }
    }
}