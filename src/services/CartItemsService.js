import CartItem from '../models/cartItemsModel.js';

export default class CartItemsService{
    /**
     * This class is responsible for handling cart items-related business logic (e.g., creating, updating, deleting cart items).
     * It uses the CartItemsRepository to perform database operations.
     * @param {CartItemsRepository} cartItemsRepository - The repository for cart items-related database operations.
     */
    constructor(cartItemsRepository) {
        this.cartItemsRepository = cartItemsRepository
    }
    /**
     * Create a new cart item using data object with the following properties: 
     * @param {number} cart_id
     * @param {number} product_id
     * @param {number} qty
     * @returns {Object}
     * @throws {Error}
     */
    async createCartItem(data){
        try {
            const cartItem = new CartItem(data);         
            const cartItemAdded = await this.cartItemsRepository.insert(cartItem); 

            return cartItemAdded;
        } catch(error) {
            throw error;
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
    async updateCartItem(data){
        try {
            const updatedCartItem = this.cartItemsRepository.update(data);
            return updatedCartItem;
        } catch (error) {
            throw error;
        }
    }
    
    /**
     * Find all cart items using the cart id: 
     * @param {number} cart_id
     * @returns {Object|null}
     * @throws {Error}
     */
    async findAllCartItemsToOrder(cart_id){
        try {
            const foundItems = await this.cartItemsRepository.selectItems(cart_id);
            return foundItems;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete a cart item using data object with the properties: 
     * @param {number} cart_id
     * @param {number} product_id
     * @returns {Object|null}
     * @throws {Error}
     */
    async deleteCartItem(data){
        try {
            const deletedItem = await this.cartItemsRepository.deleteItem(data)
            return deletedItem
        } catch (error) {
            throw error;
        }
    }

    /**
     * delete all cart items using the cart id:
     * @param {number} cart_id
     * @returns {Object|null}
     * @throws {Error}
     */
    async deleteAllCartItems(cart_id){
        try {
            const cartItemsDeleted = await this.cartItemsRepository.deleteAll(cart_id)
            return cartItemsDeleted
        } catch (error) {
            throw error;
        }
    }
}