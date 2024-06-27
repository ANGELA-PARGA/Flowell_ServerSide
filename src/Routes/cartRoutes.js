const express = require('express');
const router = express.Router();
const { checkAuthenticated, handleValidationErrors, idParamsValidator, deleteBodyValidator,
    updateCartValidators, createCheckoutValidators } = require('../Utilities/expressValidators')

const CartService = require('../ServicesLogic/CartService')

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
        const cart_info = await CartService.getCartInfo(req.user.id)
        const cart_id = cart_info.id 
        const user_id = req.user.id;
        const shipping_info = req.body
        console.log('calling api route for checkout with:', user_id, cart_id, shipping_info)
        const response = await CartService.checkoutCart({user_id, cart_id:cart_id, ...shipping_info} );
        res.status(200).json({
            status: 'success',
            message: 'Order created successfully',
            code: 200,
            order: response 
        });    
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