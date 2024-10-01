const createError = require('http-errors');
const CartsModel = require('../ClassModels/cartsModel');
const CartItemsModel = require('../ClassModels/cartItemsModel');
const OrderService = require('./OrderService');
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

    static async checkoutCart(data){
        try {
            const { cart_id, user_id, delivery_date, shipping_address_id, contact_info_id, itemsToOrder, totalPrice } = data            

            const OrderServiceInstance = new OrderService();

            const order = await OrderServiceInstance.createNewOrder(
                {   
                    user_id, 
                    total:totalPrice, 
                    items:itemsToOrder, 
                    delivery_date, 
                    shipping_address_id, 
                    contact_info_id
                }
            );
            

            //empty the cart after the order is created
            const cartUpdated= await this.emptyCart(cart_id)

            return { order:order, message:`Order succesfully created`, cart:cartUpdated };                          

        } catch(error) {
            throw createError(500, 'Error on server while placing the order', error.stack, error);            
        }
    }
}









/* static async checkoutCart(data){
        try {
            const { user_id, cart_id, delivery_date, shipping_address_id, contact_info_id  } = data
            
            //Find the cart and its id;
            const cart = await this.getCartInfo(user_id);            
            // Find all cart items
            const cartItemsToOrder = await CartItemsModel.findAllCartItemsToOrder(cart_id);
            // Retrieve total price from cart items
            const totalPrice = cart.total

            // Stripe integration
            const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
            const lineItems = cartItemsToOrder.map((item) =>{
                return {
                    price_items: {
                        product_data: {
                            name: item.name
                        },
                        currency: 'usd',
                        unit_amount: item.price * 100
                    },
                    quantity: item.qty
                }
            })

            const session = await stripe.checkout.sessions.create({
                client_reference_id: user_id,
                customer: user_id,
                customer_email: req.user.email,                            
                line_items: lineItems,
                amount_total: totalPrice * 100,
                mode: 'payment',
                ui_mode: 'embedded',
                currency: "usd",
                payment_method_types: [
                    "card",
                    "us_bank_account",
                    "Google Pay",
                    "customer_balance"
                ],
                success_url: 'http://localhost:3000/account/orders?session_id={CHECKOUT_SESSION_ID}',
                cancel_url: 'http://localhost:3000/account/cart',
            });

            // Generate initial order if the payment was succesfull

            if(session.payment_status === 'paid'){
                const OrderServiceInstance = new OrderService();
                const itemsToOrder = cartItemsToOrder.map((item) =>{
                    return {
                        product_id: item.product_id,
                        qty: item.qty
                    }
                })

                const order = await OrderServiceInstance.createNewOrder(
                    {   
                        user_id, 
                        total:totalPrice, 
                        items:itemsToOrder, 
                        delivery_date, 
                        shipping_address_id, 
                        contact_info_id
                    });

                //empty the cart after the order is created
                const cartUpdated= await this.emptyCart(cart_id)

                return {order:order, message:`Order succesfully created`, cart:cartUpdated};   

            } else {
                return {
                    sessionPaymentStatus: session.payment_status,
                    sessionStatus: session.payment_status,
                    message: 'order not placed'
                }
            }                         

        } catch(error) {
            throw createError(500, 'Error on server while placing the order', error.stack, error);            
        }
    } */