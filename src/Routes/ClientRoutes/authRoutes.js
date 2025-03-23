const express = require('express');
const router = express.Router();
const passport = require('passport');
const { signupValidators, loginValidators, handleValidationErrors, 
    recoverEmailValidator, changePasswordOnRecoveryValidator } = require('../../Utilities/expressValidators')
const jwt = require('jsonwebtoken');
const {sendEmail} = require('../../Utilities/utilities');
const { checkUserRole } = require('../../middleware/appMiddlewares')
const CartService = require('../../ServicesLogic/ServiceClientLogic/CartService')
const Authentication = require('../../ServicesLogic/ServiceClientLogic/AuthService')
const UserModel = require('../../ClassModels/ClassClientModels/userModel');
const UserService = require('../../ServicesLogic/ServiceClientLogic/UserService')

router.post('/login', loginValidators, handleValidationErrors, passport.authenticate('local'), checkUserRole, async (req, res, next) => {
    try {
        let loadCart = await CartService.getCartInfo(req.user.id)
        let cartId;

        if(!Object.keys(loadCart)?.length){
            console.log('there is NOT CART...creating one')
            loadCart = await CartService.createNewCart({user_id: req.user.id})
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
            loadCart = await CartService.createNewCart({ user_id: newUser.id });
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


router.post('/logout', async (req, res, next) => {
    try {
        console.log('➡️ Logout request received');

        if (!req.session) {
            console.log("🚨 No session found");
            return res.status(400).json({ message: "No active session." });
        }

        console.log("🚨 Session found", req.session);

        req.logout((err) => {
            if (err) {
                console.error("❌ Error in req.logout:", err);
                return next(err);
            }
            console.log("✅ Logout successfully");
        })

        console.log("✅ Session destroyed successfully");
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logged out successfully' });

    } catch (err) {
        console.error("❌ Unexpected error in logout:", err);
        next(err);
    }
});



router.post('/request_email_pwd_recovery', recoverEmailValidator,
    handleValidationErrors, async (req, res, next) => {
    try {
        const email = req.body.email;
        console.log('calling api route for recover email', email)
        const SECRET = process.env.JWT_SECRET;
        const userFound = await UserModel.findUserByEmail(email);
        if(!userFound?.length){
            return res.status(200).json({ message: "If the email exists, a reset link has been sent." });
        }

        // Generate JWT token with expiration (1 hour)
        const token = jwt.sign({ userId: userFound[0].id }, SECRET, { expiresIn: "600000" });
        // Create reset link
        const resetUrl = `${process.env.NEXT_PUBLIC_HOST}/recover_process_pd?status=${token}`;

        // Send reset email
        await sendEmail(email, "Password Reset", `Click here to reset your password: ${resetUrl}`);

        res.status(200).json({ message: "If the email exists, a reset link has been sent." });

    } catch(err) {
        next(err);
    }        
});

router.patch('/reset_password', changePasswordOnRecoveryValidator,
    handleValidationErrors, async (req, res, next) => {
    try {
        const {status, password} = req.body;
        console.log('calling api route for reset password', status, password)
        const SECRET = process.env.JWT_SECRET;
        // Verify token and extract userId
        const decoded = jwt.verify(status, SECRET);
        const userId = decoded.userId;

        await UserService.updateUserPassword({id:userId, password});

        res.status(200).json({ message: "Password reset successful. You can now log in." });

    } catch(err) {
        next(err);
    }        
});

module.exports = router;
