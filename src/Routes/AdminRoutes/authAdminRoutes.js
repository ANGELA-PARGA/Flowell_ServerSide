const express = require('express');
const router = express.Router();
const passport = require('passport');
const { signupValidators, loginValidators, handleValidationErrors} = require('../../Utilities/expressValidators')
const { checkAdminRole } = require('../../middleware/appMiddlewares')
const Authentication = require('../../services/client/AuthService')

router.post('/login', loginValidators, handleValidationErrors, passport.authenticate('local'), checkAdminRole, async (req, res, next) => {
    try {
        const { id, first_name, last_name, email, role } = req.user;
        
        res.status(200).json({
            status: 'success',
            message: 'Admin user successfully authenticated',
            code: 200,
            user: {
                id,
                first_name,
                last_name,
                email,
                role                    
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
        const AuthServiceInstance = new Authentication();
        const newUser = await AuthServiceInstance.register({...data, role:'admin'});

        req.login(newUser, (err) => {
            if (err) {
                return next(err);
            }
            const { id, first_name, last_name, email, role } = req.user;
            res.status(200).json({
                status: 'success',
                message: 'Admin User registered successfully',
                code: 200,
                user: {
                    id,
                    first_name,
                    last_name,
                    email,
                    role
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
        if (!req.session) {
            console.log("🚨 No session found");
            return res.status(400).json({ message: "No active session." });
        }

        req.logout((err) => {
            if (err) {
                console.error("❌ Error in req.logout:", err);
                return next(err);
            }
            console.log("✅ Logout successfully");
        })

        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logged out successfully' });

    } catch (err) {
        console.error("❌ Unexpected error in logout:", err);
        next(err);
    }
});

module.exports = router;