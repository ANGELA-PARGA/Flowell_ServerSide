require('dotenv').config({ path: 'variables.env' });
const express = require('express');
const router = express.Router();
const { handleValidationErrors, idParamsValidator,
    updateCartValidators, createCheckoutValidators } = require('../../Utilities/expressValidators')
const { checkAuthenticated } = require('../../middleware/appMiddlewares')
const CartService = require('../../services/client/CartService')
const CartItemsModel = require('../../models/ClassClientModels/cartItemsModel');



router.get('/', checkAuthenticated, async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const response = await CartService.getCartInfo(user_id);
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
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        const user_id = req.user.id;
        const cart_info = await CartService.getCartInfo(user_id );
        const cart_id = cart_info.id 
        const cartItemsToOrder = await CartItemsModel.findAllCartItemsToOrder(cart_id);
        const shipping_info = req.body
                    
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
                address: shipping_info.address,
                city: shipping_info.city,
                state: shipping_info.state,
                zip_code: shipping_info.zip_code,
                phone: shipping_info.phone
            },
            success_url: `${process.env.NEXT_PUBLIC_HOST}/account/orders/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_HOST}/account/cart`,
            expires_at: Math.floor(Date.now() / 1000) + 1800
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

