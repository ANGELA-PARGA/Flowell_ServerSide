const express = require('express');
const router = express.Router();
const { checkAuthenticated, handleValidationErrors, idParamsValidator, deleteBodyValidator,
    updateCartValidators, createCheckoutValidators } = require('../Utilities/expressValidators')
require('dotenv').config({ path: 'variables.env' });
const CartService = require('../ServicesLogic/CartService')
const CartItemsModel = require('../ClassModels/cartItemsModel');


router.get('/', checkAuthenticated, async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const response = await CartService.getCartInfo(user_id);
        console.log('calling api route for get cart with:', user_id)
        res.status(200).json({
            status: 'success',
            message: 'Cart information retrieved successfully',
            code: 200,
            cart: response 
        });
    } catch(err) {
        next(err);
    }
});

router.patch('/', checkAuthenticated, updateCartValidators, handleValidationErrors, async (req, res, next) => {
    try {
        const data = req.body
        const cart_info = await CartService.getCartInfo(req.user.id)
        const cart_id = cart_info.id 
        console.log('calling api route for update cart items with:', cart_id, data)
        const response = await CartService.updateCartItems({cart_id:cart_id, ...data});
        res.status(200).json({
            status: 'success',
            message: 'Carts items updated successfully',
            code: 200,
            cart_updated: response 
        });
    } catch(err) {
        next(err);
    }        
});


router.post('/checkout', checkAuthenticated, createCheckoutValidators, handleValidationErrors, async (req, res, next) => {
    try {
        console.log('Here begins, first, the creation of checkout SESSION')
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        const user_id = req.user.id;
        const cart_info = await CartService.getCartInfo(user_id );
        const cart_id = cart_info.id 
        const cartItemsToOrder = await CartItemsModel.findAllCartItemsToOrder(cart_id);
        const shipping_info = req.body

        console.log('calling api route for checkout with:', user_id, cart_id, shipping_info)

        // Stripe integration, this data will be             
        const lineItems = cartItemsToOrder.map((item) =>{
            return {
                price_data: {                    
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
            customer_email: req.user.email,                            
            line_items: lineItems,
            mode: 'payment',
            currency: "usd",
            metadata: {
                delivery_date: new Date(new Date(shipping_info.delivery_date).setHours(0, 0, 0, 0)).toISOString(),
                shipping_address_id: shipping_info.shipping_address_id,
                contact_info_id: shipping_info.contact_info_id
            },
            success_url: `http://localhost:3000/account/orders/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: 'http://localhost:3000/account/cart',
        });

        res.status(200).json({ url: session.url });

    } catch(err) {
        next(err);
    }        
});


router.delete('/', checkAuthenticated, handleValidationErrors, async (req, res, next) => {
    try {
        const cart_info = await CartService.getCartInfo(req.user.id)
        const cart_id = cart_info.id   
        console.log('calling api route for emptying a cart with:', cart_id)   
        const response = await CartService.emptyCart(cart_id);
        res.status(200).json({
            status: 'success',
            message: 'Cart emptied successfully',
            code: 200,
            cart_deleted: response 
        });       
    } catch(err) {
        next(err);
    }
});

router.delete('/:id', checkAuthenticated, idParamsValidator, handleValidationErrors, async (req, res, next) => {
    try {
        const cart_info = await CartService.getCartInfo(req.user.id)
        const cart_id = cart_info.id             
        const product_id = parseInt(req.params.id, 10);
        console.log('calling api route for deleting a carts item #:', cart_id, product_id)
        const response = await CartService.deleteItemFromCart({ param1: cart_id, param2: product_id });
        res.status(200).json({
            status: 'success',
            message: 'Carts item deleted successfully',
            code: 200,
            cart_updated: response 
        });   
    } catch(err) {
        next(err);
    }
});

module.exports = router;

/*router.post('/checkout', checkAuthenticated, createCheckoutValidators, handleValidationErrors, async (req, res, next) => {
    try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

        const user_id = req.user.id;
        const cart_info = await CartService.getCartInfo(user_id );
        const cart_id = cart_info.id 
        const cartItemsToOrder = await CartItemsModel.findAllCartItemsToOrder(cart_id);
        const totalPrice = cart_info.total
        const shipping_info = req.body

        const itemsToOrder = cartItemsToOrder.map((item) =>{
            return {
                product_id: item.product_id,
                qty: item.qty
            }
        })

        console.log('calling api route for checkout with:', user_id, cart_id, shipping_info, itemsToOrder)

        const newOrder = await CartService.checkoutCart({cart_id , user_id, ...shipping_info, itemsToOrder, totalPrice} );
        console.log('new order id:', newOrder)

        // Stripe integration            
        const lineItems = cartItemsToOrder.map((item) =>{
            return {
                price_data: {
                    
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
            client_reference_id: newOrder.order.id,
            customer_email: req.user.email,                            
            line_items: lineItems,
            mode: 'payment',
            currency: "usd",
            success_url: `http://localhost:3000/account/orders/${newOrder.order.id}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: 'http://localhost:3000/account/cart',
        });

        res.status(200).json({ url: session.url });

    } catch(err) {
        next(err);
    }        
});
 */
