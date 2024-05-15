const createError = require('http-errors');
const CartsModel = require('../ClassModels/cartsModel');
const CartItemsModel = require('../ClassModels/cartItemsModel');
const OrderService = require('./OrderService');

module.exports = class CartService{

    //data is an object { user_id }
    async createNewCart(data){
        try {
            const cartInstance = new CartsModel(data);
            const newCart = await cartInstance.createCart();
            if(!Object.keys(newCart)?.length){
                throw createError(400, 'unable to create new cart');                
            } 
            return newCart;         
        } catch (error) {
            throw createError(500, 'Error on server while creating the cart', error.stack, error);            
        }
    }

    // this method uses a user_id
    static async getCartInfo(user_id){
        try {
            const cartInfo = await CartsModel.findCartByUserId(user_id);
            return cartInfo;          
        } catch (error) {
            throw createError(500, 'Error on server while retrieving the cart information', error.stack, error);            
        }
    }

    // data is an object {cart_id, product_id, qty}
    static async updateCartItems(data){
        try {
            const cartUpdated = await CartsModel.updateCartItems(data);
            if(!Object.keys(cartUpdated)?.length){
                throw createError(400, 'cart item not found or unable to update');                
            }            
            return cartUpdated         
        } catch (error) {
            throw createError(500, 'Error on server while updating the cart item', error.stack, error);            
        }
    }

    // this method require a cart_id
    static async deleteItemFromCart(data){
        try {
            const deletedItem = await CartsModel.deleteCartItem(data);
            if(!deletedItem){
                throw createError(400, 'cart item not found or unable to delete');                
            }
            return { message:'Item succesfully deleted', status:204};
        } catch (error) {
            throw createError(500, 'Error on server while deleting the item', error.stack, error);            
        }
    }

    // this method require a cart_id
    static async emptyCart(cart_id){
        try {
            const emptiedCart = await CartsModel.emptyCart(cart_id);
            if(!emptiedCart) {
                throw createError(400, 'cart not found or unable to empty completely');
            }
            return { message:'Cart succesfully emptied' , status:204}
        } catch (error) {
            throw createError(500, 'Error on server while emptying the cart', error.stack, error);            
        }
    }

    // this method require a user_id and an object 'shipping_info' { delivery_date, shipping_address_id, contact_info_id }
    static async checkoutCart(data){
        try {
            const { user_id, cart_id, delivery_date, shipping_address_id, contact_info_id  } = data
            
            //Find the cart and its id;
            const cart = await this.getCartInfo(user_id);            
            // Find all cart items
            const cartItemsToOrder = await CartItemsModel.findAllCartItemsToOrder(cart_id);
            // Generate total price from cart items
            const totalPrice = cart.total

            // Generate initial order
            const OrderServiceInstance = new OrderService();
            const order = await OrderServiceInstance.createNewOrder(
                {   
                    user_id, 
                    total:totalPrice, 
                    items:cartItemsToOrder, 
                    delivery_date, 
                    shipping_address_id, 
                    contact_info_id
                });

            //empty the cart after the order is created
            const cartUpdated= await this.emptyCart(cart_id)

            return {order:order, message:`Order succesfully created`, cart:cartUpdated};           

        } catch(error) {
            throw createError(500, 'Error on server while placing the order', error.stack, error);            
        }
    }
}