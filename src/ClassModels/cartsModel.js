const createError = require('http-errors');
const moment = require('moment');
const {insertQuery, updateQuery, calculateTotal, calculateTotalItems} = require('../DBQueries/generalQueries')
const {selectAllCartInfoQuery} = require('../DBQueries/cartQueries')
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
            throw createError(500, 'error on server while creating the cart', error.stack, error);
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
            throw createError(500, 'error on server while updating the cart items and the cart total', error.stack, error);
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
            throw createError(500, 'error on server while retrieving all cart information from user', error.stack, error);              
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
            throw createError(500, 'error on server while updating the cart items and the cart total', error.stack, error);
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
            const updatedCart = await updateQuery({id:cart_id, total:0 }, 'id','carts')
            if(!cartEmptied || !Object.keys(updatedCart)?.length){
                return false
            }
            return true;
        } catch (error) {
            throw createError(500, 'error on server while emptying the cart from user', error.stack, error);              
        }
    }

}