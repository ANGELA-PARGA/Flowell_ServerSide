import Cart from '../models/cartModel.js';
import dotenv from 'dotenv';
dotenv.config({ path: 'variables.env' });
import Stripe from 'stripe';
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

export default class CartService{
    /**
     * This class is responsible for managing the cart-related operations like creating the cart, 
     * retrieving cart information, adding and updating the items, deleting items, emptying the cart and the checkout process.
     * @param {CartRepository} cartRepository - The repository for cart-related database operations.
     * @param {CartItemsService} cartItemsService - The service for managing cart items.
     * @param {OrderService} orderService - The service for managing orders.
     */
    constructor(cartRepository, cartItemsService, orderService) {
        this.cartRepository = cartRepository
        this.cartItemsService = cartItemsService
        this.orderService = orderService
    }
    
    /**
     * Create a cart using data object with the following properties: 
     * @param {number} user_id
     * @returns {Object}
     * @throws {Error}
     */
    async createNewCart(data){
        try {
            const cart = new Cart(data); 
            const newCart = this.cartRepository.insert(cart);          
            return newCart;         
        } catch (error) {
            throw error
        }
    }

    /**
     * Find a cart using the user_id: 
     * @param {number} user_id
     * @returns {Object|null}
     * @throws {Error}
     */
    async getCartInfo(user_id){
        try {
            const cartInfo = await this.cartRepository.selectBy(user_id);
            return cartInfo;          
        } catch (error) {
            throw error
        }
    }

    /**
     * Add a product to the cart using the data object {cart_id, product_id, qty}: 
     * @param {number} product_id
     * @param {number} qty
     * @param {number} cart_id
     * @returns {Object}
     * @throws {Error}
     */
    async addProductToCart(data){
        try {
            const { cart_id } = data
            const itemToAdd = await  this.cartItemsService.createCartItem(data)

            const newTotal = await this.cartRepository.getTotalByCartId(cart_id);
            const newItemNumber = await this.cartRepository.getTotalItems(cart_id);         
            const updatedCart = await this.cartRepository.update({id:cart_id, total:newTotal.total, total_items:newItemNumber})

            return {item:itemToAdd, cart:updatedCart};

        } catch (error) {
            throw error
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
    async updateCartItems(data){
        try {
            const { cart_id } = data;
            const updatedCartItem = await  this.cartItemsService.updateCartItem(data)

            const newTotal = await this.cartRepository.getTotalByCartId(cart_id);
            const newItemNumber = await this.cartRepository.getTotalItems(cart_id);             
            const updatedCart = await this.cartRepository.update({id:cart_id, total:newTotal.total, total_items:newItemNumber})
            
            return {item: updatedCartItem, cart: updatedCart};                       
                    
        } catch (error) {
            throw error
        }
    }

    /**
     * Delete an item from the cart using object 'data' with: 
     * @param {number} param1 this is the cart_id
     * @param {number} param2 this is the product_id
     * @returns {Object}
     * @throws {Error}
     */
    async deleteItemFromCart(data){
        try {
            const cart_id = data.param1;
            const deletedCartItem = await  this.cartItemsService.deleteCartItem(data)
            const newTotal = await this.cartRepository.getTotalByCartId(cart_id);
            const newItemNumber = await this.cartRepository.getTotalItems(cart_id); 
            
            let updatedCart;
            if(!newTotal.total){
                updatedCart = await this.cartRepository.update({id:cart_id, total:0, total_items:0 })
                
            } else {
                updatedCart = await this.cartRepository.update({id:cart_id, total:newTotal.total, total_items:newItemNumber})
            }

            return {item:deletedCartItem, cart:updatedCart};
        } catch (error) {
            throw error
        }
    }

    /**
     * Empty a cart using the cart_id: 
     * @param {number} cart_id
     * @returns {boolean}
     * @throws {Error}
     */
    async emptyCart(cart_id){
        try {
            const cartEmptied = await  this.cartItemsService.deleteAllCartItems(cart_id)
            const updatedCart = await this.cartRepository.update({ id:cart_id, total:0, total_items:0 })
            if(!cartEmptied || !Object.keys(updatedCart)?.length){
                return false
            }

            return { message:'Cart succesfully emptied' , status:204}
        } catch (error) {
            throw error
        }
    }

    /**
     * Initiate a checkout session using the session id provided by stripe plus the 
     * cart_id and the user_id accessed from the cart table.: 
     * @param {number} cart_id
     * @param {number} user_id
     * @param {number} session_id
     * @returns {boolean}
     * @throws {Error}
     */
    async checkoutCart(session_id){
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
                const cartItemsToOrder = await  this.cartItemsService.findAllCartItemsToOrder(cart_id);
                // Retrieve total price from cart items
                const totalPrice = cart.total
                const itemsToOrder = cartItemsToOrder.map((item) =>{
                    return {
                        product_id: item.product_id,
                        qty: item.qty
                    }
                })

                const order = await this.orderService.createNewOrder(
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

