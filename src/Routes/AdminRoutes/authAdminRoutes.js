const express = require('express');
const router = express.Router();
const passport = require('passport');
const { signupValidators, loginValidators, handleValidationErrors} = require('../../Utilities/expressValidators')
const { checkAdminRole } = require('../../middleware/appMiddlewares')
const Authentication = require('../../ServicesLogic/ServiceClientLogic/AuthService')

router.post('/login', loginValidators, handleValidationErrors, passport.authenticate('local'), checkAdminRole, async (req, res, next) => {
    try {
        console.log('calling route for login admin')
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
        console.log('calling route for signup ADMIN', data)
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