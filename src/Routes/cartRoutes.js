const express = require('express');
const router = express.Router();
const { checkAuthenticated, handleValidationErrors, idParamsValidator, deleteBodyValidator,
    updateCartValidators, createCheckoutValidators } = require('../Utilities/expressValidators')

const CartService = require('../ServicesLogic/CartService')

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

router.patch('/:id', checkAuthenticated, idParamsValidator, updateCartValidators, handleValidationErrors, async (req, res, next) => {
    try {
        const data = req.body
        const id = parseInt(req.params.id, 10);
        const response = await CartService.updateCartItems({cart_id:id, ...data});
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


router.post('/:id/checkout', checkAuthenticated, idParamsValidator, createCheckoutValidators, handleValidationErrors, async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const user_id = req.user.id;
        const shipping_info = req.body
        const response = await CartService.checkoutCart({user_id, cart_id:id, ...shipping_info} );
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


router.delete('/:id', checkAuthenticated, idParamsValidator, handleValidationErrors, async (req, res, next) => {
    try {
        const cart_id = parseInt(req.params.id, 10);        
        const response = await CartService.emptyCart(cart_id);
        res.status(200).json({
            status: 'success',
            message: 'Cart emptied successfully',
            code: 204,
            cart_deleted: response 
        });       
    } catch(err) {
        next(err);
    }
});

router.delete('/:id/items/:productId', checkAuthenticated, idParamsValidator, handleValidationErrors, async (req, res, next) => {
    try {
        const cart_id = parseInt(req.params.id, 10);        
        const product_id = parseInt(req.params.productId, 10);
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