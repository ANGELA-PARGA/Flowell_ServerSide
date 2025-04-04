const createError = require('http-errors');
const CartsModel = require('../../ClassModels/ClassClientModels/cartsModel');
const CartItemsModel = require('../../ClassModels/ClassClientModels/cartItemsModel');
const OrderService = require('./OrderService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config({ path: 'variables.env' });

module.exports = class CartService{

    //data is an object { user_id }
    static async createNewCart(data){
        try {
            const newCart = await CartsModel.createCart(data);
            if(!Object.keys(newCart)?.length){
                throw createError(400, 'unable to create new cart');                
            } 
            return newCart;         
        } catch (error) {
            throw error
        }
    }

    // this method uses a user_id
    static async getCartInfo(user_id){
        try {
            const cartInfo = await CartsModel.findCartByUserId(user_id);
            return cartInfo;          
        } catch (error) {
            throw error
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
            throw error
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
            throw error
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
            throw error
        }
    }

    static async checkoutCart(session_id){
        try {            
            const session = await stripe.checkout.sessions.retrieve(session_id, {
                expand: ['line_items'],
            });

            if (session.payment_status === 'paid'){
                const user_id = session.client_reference_id
                //Find the cart and its id;
                const cart = await this.getCartInfo(user_id); 
                const cart_id = cart.id           
                // Find all cart items
                const cartItemsToOrder = await CartItemsModel.findAllCartItemsToOrder(cart_id);
                // Retrieve total price from cart items
                const totalPrice = cart.total
                const itemsToOrder = cartItemsToOrder.map((item) =>{
                    return {
                        product_id: item.product_id,
                        qty: item.qty
                    }
                })

                const order = await OrderService.createNewOrder(
                    {   
                        user_id, 
                        total:totalPrice, 
                        items:itemsToOrder, 
                        delivery_date: session.metadata.delivery_date, 
                        address: session.metadata.address,
                        city: session.metadata.city,
                        state: session.metadata.state,
                        zip_code: session.metadata.zip_code, 
                        phone: session.metadata.phone,
                        status: 'PAID'
                    }
                );               
    
                //empty the cart after the order is created
                const cartUpdated= await this.emptyCart(cart_id)
    
                return { order:order, message:`Order succesfully created`, cart:cartUpdated }; 

            }  
            if (session.payment_status === 'unpaid' || session.payment_status === 'expired'){
                const status= session.payment_status    
                return {message:`Order could not be paid`, status}; 
            }                                             

        } catch(error) {
            throw error
        }
    }
}

