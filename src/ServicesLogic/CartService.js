const createError = require('http-errors');
const CartsModel = require('../ClassModels/cartsModel');
const CartItemsModel = require('../ClassModels/cartItemsModel');
const OrderService = require('./OrderService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config({ path: 'variables.env' });

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
            console.log('calling empty cart in checkout', cart_id)
            const emptiedCart = await CartsModel.emptyCart(cart_id);
            if(!emptiedCart) {
                throw createError(400, 'cart not found or unable to empty completely');
            }
            return { message:'Cart succesfully emptied' , status:204}
        } catch (error) {
            throw createError(500, 'Error on server while emptying the cart', error.stack, error);            
        }
    }

    static async checkoutCart(session_id){
        try {
            console.log('Fulfilling Checkout Session ' + session_id);
            
            const session = await stripe.checkout.sessions.retrieve(session_id, {
                expand: ['line_items'],
            });


            console.log('session items', session.line_items);
            console.log('session metadata',  session.metadata);

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

                console.log('calling createNewOrder with:', user_id, cart_id, totalPrice, itemsToOrder)
                const OrderServiceInstance = new OrderService();

                const order = await OrderServiceInstance.createNewOrder(
                    {   
                        user_id, 
                        total:totalPrice, 
                        items:itemsToOrder, 
                        delivery_date: session.metadata.delivery_date, 
                        shipping_address_id: session.metadata.shipping_address_id, 
                        contact_info_id: session.metadata.contact_info_id
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
            throw createError(500, 'Error on server while placing the order', error.stack, error);            
        }
    }
}

