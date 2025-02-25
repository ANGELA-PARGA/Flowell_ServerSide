const createError = require('http-errors');
const moment = require('moment');
const {insertQuery, updateQuery, calculateTotal, calculateTotalItems} = require('../../DBQueries/generalQueries')
const {selectAllCartInfoQuery} = require('../../DBQueries/cartQueries')
const CartItemsModel = require('./cartItemsModel')

module.exports = class CartsModel {
    constructor(data) {
        this.created = moment.utc().toISOString();
        this.modified = moment.utc().toISOString();
        this.user_id = data.user_id;
        this.total = 0;
        this.total_items = 0;
    }
    
    /**
     * Create a cart using data object with the following properties: 
     * @param {number} user_id
     * @returns {Object}
     * @throws {Error}
     */
    async createCart(){
        try {   
            const newCartCreated = this;
            const newCartAdded = await insertQuery(newCartCreated, 'carts')      
            return newCartAdded;
        } catch(error) {
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while creating a new cart' 
                    : 'ServerError: Unexpected error while creating a new cart'
            );

            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while creating a new cart';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'cartsModel / createCart';
            dbError.timestamp = new Date().toISOString();

            throw dbError;
        }
    } 

    /**
     * Update items from a cart using data object with the following properties and then 
     * recalculate the total price: 
     * @param {number} cart_id
     * @param {number} product_id
     * @param {number} qty
     * @returns {Object}
     * @throws {Error}
     */
    
    static async updateCartItems(data){
        try {    
            const { cart_id } = data;
            const updatedCartItem = await CartItemsModel.updateCartItem(data)
            const newTotal = await calculateTotal(cart_id,'cart_id','cart_items');
            const newItemNumber = await calculateTotalItems(cart_id,'cart_id','cart_items');             
            const updatedCart = await updateQuery({id:cart_id, total:newTotal.total, total_items:newItemNumber}, 'id','carts')
            
            return {item: updatedCartItem, cart: updatedCart};
        } catch(error) {
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while updating cart items' 
                    : 'ServerError: Unexpected error while updating cart items'
            );

            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while updating cart items';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'cartsModel / updateCartItems';
            dbError.timestamp = new Date().toISOString();

            throw dbError;
        }
    } 

    /**
     * Find a cart using the user_id: 
     * @param {number} user_id
     * @returns {Object|null}
     * @throws {Error}
     */
    static async findCartByUserId(user_id){
        try {
            const foundedCart = await selectAllCartInfoQuery(user_id)
            return foundedCart
        } catch (error) {
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while finding a cart by user id' 
                    : 'ServerError: Unexpected error while finding a cart by user id'
            );

            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while finding a cart by user id';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'cartsModel / findCartByUserId';
            dbError.timestamp = new Date().toISOString();

            throw dbError;
        }
    }

    /**
     * Delete an item from the cart using object 'data' with: 
     * @param {number} param1 this is the cart_id
     * @param {number} param2 this is the product_id
     * @returns {Object}
     * @throws {Error}
     */
    static async deleteCartItem(data){
        try {    
            const cart_id = data.param1;
            const deletedCartItem = await CartItemsModel.deleteCartItem(data)
            const newTotal = await calculateTotal(cart_id,'cart_id','cart_items');
            const newItemNumber = await calculateTotalItems(cart_id,'cart_id','cart_items'); 
            
            let updatedCart;
            if(!newTotal.total){
                updatedCart = await updateQuery({id:cart_id, total:0, total_items:0 }, 'id','carts')
                
            } else {
                updatedCart = await updateQuery({id:cart_id, total:newTotal.total, total_items:newItemNumber}, 'id','carts')
            }

            return {item:deletedCartItem, cart:updatedCart};

        } catch(error) {
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while deleting a cart item' 
                    : 'ServerError: Unexpected error while deleting a cart item'
            );

            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while deleting a cart item';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'cartsModel / deleteCartItem';
            dbError.timestamp = new Date().toISOString();

            throw dbError;
        }
    } 

    /**
     * Empty a cart using the cart_id: 
     * @param {number} cart_id
     * @returns {boolean}
     * @throws {Error}
     */
    static async emptyCart(cart_id){
        try {
            const cartEmptied = await CartItemsModel.deleteAllCartItems(cart_id)
            const updatedCart = await updateQuery({ id:cart_id, total:0, total_items:0 }, 'id','carts')
            if(!cartEmptied || !Object.keys(updatedCart)?.length){
                return false
            }

            return true;
        } catch (error) {
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while emptying a cart' 
                    : 'ServerError: Unexpected error while emptying a cart'
            );

            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while emptying a cart';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'cartsModel / emptyCart';
            dbError.timestamp = new Date().toISOString();

            throw dbError;
        }
    }

}