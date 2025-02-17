const express = require('express');
const router = express.Router();
const passport = require('passport');
const { signupValidators, loginValidators, handleValidationErrors } = require('../../Utilities/expressValidators')
const { checkUserRole } = require('../../middleware/appMiddlewares')
const CartService = require('../../ServicesLogic/ServiceClientLogic/CartService')
const Authentication = require('../../ServicesLogic/ServiceClientLogic/AuthService')

router.post('/login', loginValidators, handleValidationErrors, passport.authenticate('local'), checkUserRole, async (req, res, next) => {
    try {
        let loadCart = await CartService.getCartInfo(req.user.id)
        let cartId;

        if(!Object.keys(loadCart)?.length){
            console.log('there is NOT CART...creating one')
            const CartServiceInstance = new CartService();
            loadCart = await CartServiceInstance.createNewCart({user_id: req.user.id})
        }
        cartId = loadCart.id;
        const { id, first_name, last_name, email, role } = req.user;
        
        res.status(200).json({
            status: 'success',
            message: 'User successfully authenticated',
            code: 200,
            user: {
                id,
                first_name,
                last_name,
                email,
                role, 
                cart_id:cartId                   
            },
            sessionID: req.sessionID
        });

    } catch (err) {
        next(err);        
    }
});


router.post('/signup', signupValidators, handleValidationErrors, async (req, res, next) => {
    try {
        const data = req.body;
        console.log('calling route for signup user', data)
        const AuthServiceInstance = new Authentication();
        const newUser = await AuthServiceInstance.register({...data, role:'client'});
        let loadCart = await CartService.getCartInfo(newUser.id);
        let cartId;

        if (!Object.keys(loadCart)?.length) {
            console.log('there is NOT CART...creating one')
            const CartServiceInstance = new CartService();
            loadCart = await CartServiceInstance.createNewCart({ user_id: newUser.id });
        }

        cartId = loadCart.id

        req.login(newUser, (err) => {
            if (err) {
                return next(err);
            }
            const { id, first_name, last_name, email, role } = req.user;
            res.status(200).json({
                status: 'success',
                message: 'User registered successfully',
                code: 200,
                user: {
                    id,
                    first_name,
                    last_name,
                    email,
                    role,
                    cart_id: cartId
                },
                sessionID: req.sessionID
            });
        });
    } catch(err) {
        next(err);
    }
});


router.post('/logout',  async (req, res, next) => {
    try { 
        console.log('calling logout in server')       
        req.logout((err) => {
            if (err) {
                return next(err);
        }})
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logged out successfully' });
                
    } catch(err) {
        next(err);
    }
});

module.exports = router;
